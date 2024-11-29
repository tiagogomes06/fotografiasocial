import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const eupagoKey = Deno.env.get('EUPAGO_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { orderId, paymentMethod, email, name } = await req.json()
    console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)

    // Fetch the order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*),
          photos (*)
        ),
        students (*),
        shipping_method (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Order found:', order)

    let paymentResponse

    switch (paymentMethod) {
      case 'card':
        const lineItems = order.order_items.map((item: any) => ({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.products.name,
              description: `Photo print for ${order.students.name}`,
            },
            unit_amount: Math.round(item.price_at_time * 100),
          },
          quantity: 1,
        }))

        if (order.shipping_method && order.shipping_method.price > 0) {
          lineItems.push({
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Shipping',
                description: order.shipping_method.name,
              },
              unit_amount: Math.round(order.shipping_method.price * 100),
            },
            quantity: 1,
          })
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

        paymentResponse = { 
          sessionId: session.id,
          url: session.url 
        }
        break

      case 'mbway':
        const mbwayResponse = await fetch('https://clientes.eupago.pt/api/v1.02/mbway/create', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': `ApiKey ${eupagoKey}`,
          },
          body: JSON.stringify({
            payment: {
              identifier: orderId,
              amount: {
                value: order.total_amount,
                currency: 'EUR'
              },
              successUrl: `${req.headers.get('origin')}/payment-success`,
              failUrl: `${req.headers.get('origin')}/payment-cancelled`,
              backUrl: `${req.headers.get('origin')}/cart`,
              lang: 'PT'
            },
            customer: {
              notify: true,
              phone: order.shipping_phone,
              name: order.shipping_name,
            }
          })
        })

        if (!mbwayResponse.ok) {
          const errorText = await mbwayResponse.text()
          console.error('EuPago MBWay error:', errorText)
          throw new Error(`EuPago error: ${errorText}`)
        }

        paymentResponse = await mbwayResponse.json()
        break

      case 'multibanco':
        const multibancoResponse = await fetch('https://clientes.eupago.pt/clientes/rest_api/pagamento/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${eupagoKey}`,
          },
          body: JSON.stringify({
            payment_method: 'multibanco',
            valor: order.total_amount,
            chave: eupagoKey,
            id: orderId,
          }),
        })

        if (!multibancoResponse.ok) {
          const errorText = await multibancoResponse.text()
          console.error('EuPago Multibanco error:', errorText)
          throw new Error(`EuPago error: ${errorText}`)
        }

        paymentResponse = await multibancoResponse.json()
        break

      default:
        throw new Error(`Invalid payment method: ${paymentMethod}`)
    }

    return new Response(
      JSON.stringify(paymentResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})