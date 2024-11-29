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
  valor?: string;
  canal?: string;
  referencia?: string;
  transacao?: string;
  identificador?: string;
  mp?: string;
  chave_api?: string;
  data?: string;
  entidade?: string;
  comissao?: string;
  local?: string;
}

async function sendPaymentConfirmationEmail(orderId: string, orderDetails: any) {
  try {
    const emailHtml = `
      <h2>Pagamento Confirmado - Encomenda #${orderId}</h2>
      <p>O seu pagamento foi confirmado com sucesso!</p>
      <p>Detalhes da encomenda:</p>
      <ul>
        <li>Total: ${orderDetails.total_amount}€</li>
        <li>Estado: Pago</li>
        <li>Data de pagamento: ${new Date().toLocaleString('pt-PT')}</li>
      </ul>
      <p>Obrigado pela sua compra!</p>
    `;

    const { error: emailError } = await supabase.functions.invoke('send-order-email', {
      body: { 
        orderId,
        type: 'paid',
        html: emailHtml
      }
    });

    if (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      throw emailError;
    }
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
}

async function updateOrderStatus(orderId: string, status: string, paymentDetails: Partial<EuPagoWebhookPayload>) {
  console.log(`Updating order ${orderId} with status ${status} and details:`, paymentDetails);
  
  try {
    // First get the order details for the email
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: status,
        payment_id: paymentDetails.transacao,
        status: status === 'completed' ? 'processing' : 'pending'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      throw updateError;
    }

    // If payment is completed, send confirmation email
    if (status === 'completed') {
      await sendPaymentConfirmationEmail(orderId, order);
    }
  } catch (error) {
    console.error('Failed to process order update:', error);
    throw error;
  }
}

async function handleEuPagoWebhook(payload: EuPagoWebhookPayload) {
  console.log('Processing EuPago webhook with payload:', payload);
  
  const orderId = payload.identificador;
  if (!orderId) {
    throw new Error('No order identifier (identificador) in EuPago webhook');
  }

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

  await updateOrderStatus(orderId, 'completed', payload);
  
  return { 
    success: true,
    message: `Payment processed successfully for order ${orderId}`
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Received webhook body:', body);
    
    let payload: EuPagoWebhookPayload;
    
    try {
      payload = JSON.parse(body);
    } catch {
      const params = new URLSearchParams(body);
      payload = Object.fromEntries(params.entries());
    }

    const result = await handleEuPagoWebhook(payload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
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