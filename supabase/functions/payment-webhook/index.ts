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
  valor: string;
  canal: string;
  referencia: string;
  transacao: string;
  identificador: string;
  mp: string;
  chave_api: string;
  data: string;
  entidade?: string;
  comissao?: string;
  local?: string;
  estado?: string;
}

async function sendPaymentConfirmationEmail(orderId: string, orderDetails: any) {
  console.log('[payment-webhook] Sending confirmation email for order:', orderId);
  console.log('[payment-webhook] Order details:', orderDetails);
  
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

    console.log('[payment-webhook] Invoking send-order-email function');
    const { error: emailError } = await supabase.functions.invoke('send-order-email', {
      body: { 
        orderId,
        type: 'paid',
        html: emailHtml
      }
    });

    if (emailError) {
      console.error('[payment-webhook] Error sending payment confirmation email:', emailError);
      throw emailError;
    }
    
    console.log('[payment-webhook] Confirmation email sent successfully');
  } catch (error) {
    console.error('[payment-webhook] Failed to send payment confirmation email:', error);
    throw error;
  }
}

async function updateOrderStatus(orderId: string, paymentDetails: EuPagoWebhookPayload) {
  console.log(`[payment-webhook] Updating order ${orderId} with payment details:`, paymentDetails);
  
  try {
    // First get the order details for the email
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('[payment-webhook] Error fetching order:', orderError);
      throw orderError;
    }

    // Update the order status based on the payment status
    const paymentStatus = paymentDetails.estado === '0' ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        payment_id: paymentDetails.transacao,
        status: paymentStatus === 'completed' ? 'processing' : 'cancelled'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[payment-webhook] Error updating order status:', updateError);
      throw updateError;
    }

    console.log('[payment-webhook] Order status updated successfully');
    
    // Only send confirmation email if payment was successful
    if (paymentStatus === 'completed') {
      await sendPaymentConfirmationEmail(orderId, order);
    }
  } catch (error) {
    console.error('[payment-webhook] Failed to process order update:', error);
    throw error;
  }
}

async function handleEuPagoWebhook(payload: EuPagoWebhookPayload) {
  console.log('[payment-webhook] Processing EuPago webhook with payload:', payload);
  
  const orderId = payload.identificador;
  if (!orderId) {
    throw new Error('No order identifier (identificador) in EuPago webhook');
  }

  if (!payload.transacao || !payload.valor) {
    throw new Error('Invalid payment notification: missing transaction ID or amount');
  }

  console.log(`[payment-webhook] Processing payment for order ${orderId}:`, {
    transactionId: payload.transacao,
    amount: payload.valor,
    method: payload.mp,
    date: payload.data,
    location: payload.local,
    status: payload.estado
  });

  await updateOrderStatus(orderId, payload);
  
  return { 
    success: true,
    message: `Payment processed successfully for order ${orderId}`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log('[payment-webhook] Received webhook request:', {
      method: req.method,
      url: url.toString()
    });

    let payload: EuPagoWebhookPayload;
    
    if (req.method === 'POST') {
      const body = await req.text();
      console.log('[payment-webhook] POST body:', body);
      
      try {
        payload = JSON.parse(body);
      } catch {
        const params = new URLSearchParams(body);
        payload = Object.fromEntries(params.entries()) as EuPagoWebhookPayload;
      }
    } else if (req.method === 'GET') {
      // Handle GET request from EuPago
      const params = url.searchParams;
      payload = Object.fromEntries(params.entries()) as EuPagoWebhookPayload;
    } else {
      throw new Error(`Unsupported method: ${req.method}`);
    }

    console.log('[payment-webhook] Parsed payload:', payload);

    const result = await handleEuPagoWebhook(payload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[payment-webhook] Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});