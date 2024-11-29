import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateOrderStatus(orderId: string, status: string) {
  console.log(`Updating order ${orderId} status to ${status}`);
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  // Send payment confirmation email
  if (status === 'completed') {
    const { error: emailError } = await supabase.functions.invoke('send-order-email', {
      body: { 
        orderId,
        type: 'paid'
      }
    });

    if (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
    }
  }
}

async function handleStripeWebhook(signature: string, body: string) {
  console.log('Processing Stripe webhook');
  const event = await stripe.webhooks.constructEventAsync(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET,
    undefined,
    cryptoProvider
  );

  console.log('Stripe event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await updateOrderStatus(session.metadata.order_id, 'completed');
  } else if (event.type === 'payment_intent.payment_failed') {
    const session = event.data.object;
    await updateOrderStatus(session.metadata.order_id, 'failed');
  }

  return { ok: true };
}

async function handleEuPagoWebhook(payload: any) {
  console.log('Processing EuPago webhook:', payload);
  const { identifier, status } = payload;

  if (!identifier) {
    throw new Error('No order identifier in EuPago webhook');
  }

  let paymentStatus;
  switch (status) {
    case 'paid':
      paymentStatus = 'completed';
      break;
    case 'failed':
      paymentStatus = 'failed';
      break;
    case 'pending':
      paymentStatus = 'pending';
      break;
    default:
      paymentStatus = 'failed';
  }

  await updateOrderStatus(identifier, paymentStatus);
  return { ok: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature');
    const eupagoSignature = req.headers.get('x-eupago-signature');

    let result;
    if (signature) {
      result = await handleStripeWebhook(signature, body);
    } else if (eupagoSignature) {
      const payload = JSON.parse(body);
      result = await handleEuPagoWebhook(payload);
    } else {
      throw new Error('Invalid webhook signature');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});