import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, paymentMethod } = await req.json()
    console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), students(name)')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      throw new Error('Order not found')
    }

    console.log('Order details:', order)
    let paymentResponse

    if (paymentMethod === 'mbway' || paymentMethod === 'multibanco') {
      // EuPago integration
      const eupagoMethod = paymentMethod === 'mbway' ? 'mb_way' : 'multibanco'
      console.log(`Making EuPago request for ${eupagoMethod}`)

      const response = await fetch('https://clientes.eupago.pt/clientes/rest_api/pagamento/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${EUPAGO_API_KEY}`,
        },
        body: JSON.stringify({
          payment_method: eupagoMethod,
          valor: order.total_amount,
          chave: EUPAGO_API_KEY,
          id: orderId,
          ...(paymentMethod === 'mbway' ? { 
            alias: order.shipping_phone,
            cliente: order.shipping_name
          } : {})
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('EuPago error:', errorText)
        throw new Error(`EuPago error: ${errorText}`)
      }

      paymentResponse = await response.json()
      console.log('EuPago response:', paymentResponse)

    } else if (paymentMethod === 'card') {
      console.log('Creating Stripe session')
      
      // Create line items from order items
      const lineItems = order.order_items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.products.name,
            description: `Photo print for ${order.students.name}`,
          },
          unit_amount: Math.round(item.price_at_time * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Add shipping cost if applicable
      if (order.shipping_method_id) {
        const { data: shippingMethod } = await supabase
          .from('shipping_methods')
          .select('*')
          .eq('id', order.shipping_method_id)
          .single();

        if (shippingMethod && shippingMethod.price > 0) {
          lineItems.push({
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Shipping',
                description: shippingMethod.name,
              },
              unit_amount: Math.round(shippingMethod.price * 100),
            },
            quantity: 1,
          });
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
        metadata: {
          order_id: orderId,
        },
      })

      console.log('Stripe session created:', session.id)
      paymentResponse = { 
        sessionId: session.id,
        url: session.url 
      }
    } else {
      throw new Error(`Invalid payment method: ${paymentMethod}`)
    }

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_id: paymentMethod === 'card' ? paymentResponse.sessionId : paymentResponse.referencia,
        payment_status: 'pending',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw new Error('Failed to update order with payment details')
    }

    return new Response(
      JSON.stringify(paymentResponse),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})