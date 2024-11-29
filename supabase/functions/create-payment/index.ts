import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { corsHeaders, getConfig } from './paymentConfig.ts'
import { createStripePayment, createEupagoMBWayPayment, createEupagoMultibancoPayment } from './paymentProviders.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, paymentMethod, email, name } = await req.json()
    console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)

    // First verify the order exists
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: orderExists, error: orderExistsError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single()

    if (orderExistsError || !orderExists) {
      console.error('Order existence check failed:', orderExistsError)
      return new Response(
        JSON.stringify({ error: `Order not found: ${orderExistsError?.message || 'No order found'}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch the complete order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*),
          photos (*)
        ),
        shipping_methods!inner (*),
        students (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order details:', orderError)
      return new Response(
        JSON.stringify({ error: `Failed to fetch order details: ${orderError?.message}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Order found:', order)

    let paymentResponse

    try {
      switch (paymentMethod) {
        case 'card':
          const config = getConfig()
          const stripe = new Stripe(config.stripeKey, {
            apiVersion: '2022-11-15',
            httpClient: Stripe.createFetchHttpClient(),
          })
          paymentResponse = await createStripePayment(stripe, order, req.headers.get('origin') || '')
          break

        case 'mbway':
          paymentResponse = await createEupagoMBWayPayment(
            order,
            req.headers.get('origin') || '',
            'da58-5a0d-2f22-0152-8f6d' // Hardcoded EuPago key
          )
          break

        case 'multibanco':
          paymentResponse = await createEupagoMultibancoPayment(
            order, 
            'da58-5a0d-2f22-0152-8f6d' // Hardcoded EuPago key
          )
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
      console.error('Payment provider error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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