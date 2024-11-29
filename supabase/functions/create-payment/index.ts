import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createStripePayment, createEupagoMBWayPayment, createEupagoMultibancoPayment } from './paymentProviders.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to wait for a specified time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch order with retries
async function fetchOrderWithRetries(orderId: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*),
          photos (*)
        ),
        students (
          name
        ),
        shipping_method (*)
      `)
      .eq('id', orderId)
      .single();

    if (order) {
      return { order, error: null };
    }

    if (i < maxRetries - 1) {
      console.log(`Attempt ${i + 1}: Order not found, retrying after delay...`);
      await delay(1000); // Wait 1 second before retrying
    }
  }

  return { order: null, error: new Error('Order not found after multiple attempts') };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, paymentMethod, email, name } = await req.json()
    console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)

    // Add initial delay to allow for order creation to complete
    await delay(500);

    // Fetch order with retries
    const { order, error } = await fetchOrderWithRetries(orderId);

    if (error || !order) {
      console.error('Error fetching order:', error)
      throw new Error('Order not found')
    }

    console.log('Order details:', order)
    let paymentResponse;

    switch (paymentMethod) {
      case 'mbway':
        paymentResponse = await createEupagoMBWayPayment(order, req.headers.get('origin') || '', EUPAGO_API_KEY);
        break;
      case 'multibanco':
        paymentResponse = await createEupagoMultibancoPayment(order, EUPAGO_API_KEY);
        break;
      case 'card':
        paymentResponse = await createStripePayment(stripe, order, req.headers.get('origin') || '');
        break;
      default:
        throw new Error(`Invalid payment method: ${paymentMethod}`);
    }

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_id: paymentMethod === 'card' ? paymentResponse.sessionId : paymentResponse.reference,
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