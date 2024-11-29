import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface EuPagoWebhookPayload {
  valor?: string;           // Payment amount
  canal?: string;          // Channel name
  referencia?: string;     // Reference number
  transacao?: string;      // Transaction ID
  identificador?: string;  // Order ID in our system
  mp?: string;            // Payment Method Code
  chave_api?: string;     // API Key used
  data?: string;          // Payment date (YYYY-MM-DD:hh:mm)
  entidade?: string;      // Entity
  comissao?: string;      // Payment Fee
  local?: string;         // Payment City
}

async function updateOrderStatus(orderId: string, status: string, paymentDetails: Partial<EuPagoWebhookPayload>) {
  console.log(`Updating order ${orderId} with status ${status} and details:`, paymentDetails);
  
  const updateData: any = { 
    payment_status: status,
    payment_id: paymentDetails.transacao
  };

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

async function handleEuPagoWebhook(payload: EuPagoWebhookPayload) {
  console.log('Processing EuPago webhook with payload:', payload);
  
  // Extract order ID from identificador field
  const orderId = payload.identificador;
  if (!orderId) {
    throw new Error('No order identifier (identificador) in EuPago webhook');
  }

  // Verify this is a payment notification (EuPago only sends notifications for successful payments)
  if (!payload.transacao || !payload.valor) {
    throw new Error('Invalid payment notification: missing transaction ID or amount');
  }

  console.log(`Processing successful payment for order ${orderId}:`, {
    transactionId: payload.transacao,
    amount: payload.valor,
    method: payload.mp,
    date: payload.data,
    location: payload.local
  });

  // Since EuPago only sends webhooks for successful payments, we can mark this as completed
  await updateOrderStatus(orderId, 'completed', payload);
  
  return { 
    success: true,
    message: `Payment processed successfully for order ${orderId}`
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body as text
    const body = await req.text();
    console.log('Received webhook body:', body);
    
    // Parse the URL-encoded form data or JSON
    let payload: EuPagoWebhookPayload;
    
    try {
      // First try to parse as JSON
      payload = JSON.parse(body);
    } catch {
      // If JSON parsing fails, try to parse as URL-encoded form data
      const params = new URLSearchParams(body);
      payload = Object.fromEntries(params.entries());
    }

    const result = await handleEuPagoWebhook(payload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});