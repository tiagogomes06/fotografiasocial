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
  resposta?: string;
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

    const orderId = payload.identificador;
    if (!orderId) {
      throw new Error('No order identifier (identificador) in EuPago webhook');
    }

    if (!payload.transacao || !payload.valor) {
      throw new Error('Invalid payment notification: missing transaction ID or amount');
    }

    console.log(`[payment-webhook] Processing ${payload.mp} payment for order ${orderId}:`, {
      transactionId: payload.transacao,
      amount: payload.valor,
      method: payload.mp,
      date: payload.data,
      status: payload.estado
    });

    // For Multibanco (MB), success can be indicated by estado being either '0' or undefined
    // For MBWay (MW), only estado '0' means success
    const isMultibanco = payload.mp === 'MB';
    const isSuccess = isMultibanco ? 
      (payload.estado === '0' || !payload.estado) : // For Multibanco
      payload.estado === '0'; // For MBWay

    const paymentStatus = isSuccess ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        payment_id: payload.transacao,
        status: paymentStatus === 'completed' ? 'processing' : 'cancelled'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[payment-webhook] Error updating order status:', updateError);
      throw updateError;
    }

    console.log('[payment-webhook] Order status updated successfully to:', paymentStatus);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Payment processed successfully for order ${orderId}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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