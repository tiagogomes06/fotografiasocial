import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[send-order-email] Missing Supabase configuration');
      throw new Error('Server configuration error');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[send-order-email] Supabase client created');

    const { orderId, type } = await req.json();
    console.log(`[send-order-email] Processing ${type} email for order: ${orderId}`);

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

    // Generate email content
    console.log('[send-order-email] Generating email template...');
    const html = createEmailTemplate(order, type);

    // Send email to customer
    console.log(`[send-order-email] Sending ${type} email to customer:`, order.email);
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: { 
        to: order.email,
        subject: type === 'created' ? 
          `Confirmação de Encomenda #${orderId}` : 
          `Pagamento Confirmado - Encomenda #${orderId}`,
        html: html
      }
    });

    if (emailError) {
      console.error('[send-order-email] Error sending email:', emailError);
      throw emailError;
    }

    console.log('[send-order-email] Email sent successfully');

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