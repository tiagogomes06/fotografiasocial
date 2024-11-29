import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateOrderStatus(orderId: string, status: string, transactionId?: string) {
  console.log(`Updating order ${orderId} status to ${status}, transaction: ${transactionId}`);
  
  const updateData: any = { 
    payment_status: status 
  };
  
  if (transactionId) {
    updateData.payment_id = transactionId;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
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

async function handleEuPagoWebhook(payload: any) {
  console.log('Processing EuPago webhook:', payload);
  
  // Extract relevant information from the webhook payload
  const identifier = payload.identificador || payload.referencia;
  const transactionId = payload.transacao;
  const status = payload.estado?.toLowerCase();

  if (!identifier) {
    throw new Error('No order identifier in EuPago webhook');
  }

  console.log(`Processing payment for order ${identifier}, transaction ${transactionId}, status ${status}`);

  let paymentStatus;
  switch (status) {
    case 'pago':
    case 'paid':
    case 'completed':
      paymentStatus = 'completed';
      break;
    case 'pending':
    case 'pendente':
      paymentStatus = 'pending';
      break;
    case 'failed':
    case 'falhou':
    case 'erro':
      paymentStatus = 'failed';
      break;
    default:
      console.warn(`Unknown payment status: ${status}`);
      paymentStatus = 'pending';
  }

  await updateOrderStatus(identifier, paymentStatus, transactionId);
  return { ok: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Received webhook body:', body);
    
    const payload = JSON.parse(body);
    const result = await handleEuPagoWebhook(payload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});