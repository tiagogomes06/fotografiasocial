import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createEmailTemplate } from './emailTemplates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[send-order-email] Starting order email process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;
    
    if (!supabaseUrl || !supabaseKey || !smtpPassword) {
      console.error('[send-order-email] Missing configuration');
      throw new Error('Server configuration error');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[send-order-email] Supabase client created');

    const { orderId, type, paymentDetails } = await req.json();
    console.log(`[send-order-email] Processing ${type} email for order: ${orderId}`);

    // Create SMTP client with proper configuration
    const client = new SMTPClient({
      connection: {
        hostname: "mail.duploefeito.com",
        port: 465,
        tls: true,
        auth: {
          username: "encomendas@duploefeito.com",
          password: smtpPassword,
        },
      },
    });

    // Fetch order details with all related information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        shipping_methods (
          name,
          price
        ),
        order_items (
          quantity,
          price_at_time,
          products (
            name
          ),
          photos (
            url
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('[send-order-email] Error fetching order:', orderError);
      throw orderError;
    }

    if (!order) {
      console.error('[send-order-email] Order not found:', orderId);
      throw new Error('Order not found');
    }

    console.log('[send-order-email] Order details retrieved:', order);

    if (!order.email) {
      console.error('[send-order-email] No email address found for order:', orderId);
      throw new Error('No email address associated with order');
    }

    // Generate customer email content (without photo links)
    console.log('[send-order-email] Generating customer email template...');
    const customerEmailHtml = createEmailTemplate(order, type, false, paymentDetails);

    // Send email to customer with proper headers
    console.log(`[send-order-email] Sending ${type} email to customer:`, order.email);
    await client.send({
      from: "Fotografia Escolar <encomendas@duploefeito.com>",
      to: order.email,
      subject: type === 'created' ? 
        `Confirmação de Encomenda #${orderId}` : 
        `Pagamento Confirmado - Encomenda #${orderId}`,
      html: customerEmailHtml,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

    // If payment is completed, also send notification to admin emails with photo links
    if (type === 'paid') {
      console.log('[send-order-email] Sending admin notification emails...');
      
      const adminEmailHtml = createEmailTemplate(order, type, true);
      
      await client.send({
        from: "Fotografia Escolar <encomendas@duploefeito.com>",
        to: ["gomes@duploefeito.com", "eu@tiagogomes.pt"],
        subject: `Novo Pagamento Recebido - Encomenda #${orderId}`,
        html: adminEmailHtml,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
      
      console.log('[send-order-email] Admin notifications sent');
    }

    await client.close();
    console.log('[send-order-email] SMTP client closed');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('[send-order-email] Error in send-order-email:', error);
    console.error('[send-order-email] Error stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: 'Check Edge Function logs for more information'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})