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

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw new Error('Order not found')

    let paymentResponse

    if (paymentMethod === 'mbway' || paymentMethod === 'multibanco') {
      // EuPago integration
      const response = await fetch('https://sandbox.eupago.pt/api/v1.02/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${EUPAGO_API_KEY}`,
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          amount: order.total_amount,
          currency: 'EUR',
          reference: orderId,
          ...(paymentMethod === 'mbway' ? { phone: order.shipping_phone } : {}),
        }),
      })

      paymentResponse = await response.json()

      // Update order with payment details
      await supabase
        .from('orders')
        .update({
          payment_id: paymentResponse.id,
          payment_status: 'pending',
        })
        .eq('id', orderId)

    } else if (paymentMethod === 'card') {
      // Stripe integration
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Order ${orderId}`,
            },
            unit_amount: Math.round(order.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
      })

      paymentResponse = { 
        sessionId: session.id,
        url: session.url 
      }

      // Update order with payment details
      await supabase
        .from('orders')
        .update({
          payment_id: session.id,
          payment_status: 'pending',
        })
        .eq('id', orderId)
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