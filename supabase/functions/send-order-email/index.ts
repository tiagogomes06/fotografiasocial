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
    console.log('Starting order email process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Server configuration error');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, type } = await req.json();
    console.log(`Processing ${type} email for order: ${orderId}`);

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
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    if (!order) {
      console.error('Order not found:', orderId);
      throw new Error('Order not found');
    }

    console.log('Order details retrieved:', order);

    // Generate email content
    const html = createEmailTemplate(order, type);

    // Send email to customer
    if (order.email) {
      console.log(`Sending ${type} email to customer:`, order.email);
      
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
        console.error('Error sending customer email:', emailError);
        throw emailError;
      }
    } else {
      console.warn('No customer email address found for order:', orderId);
    }

    // Send notification to admin for completed payments
    if (type === 'paid') {
      console.log('Sending admin notification for paid order');
      
      const adminHtml = createEmailTemplate(order, type, true);
      const { error: adminEmailError } = await supabase.functions.invoke('send-email', {
        body: { 
          to: "envio@fotografiaescolar.duploefeito.com",
          subject: `[ADMIN] Novo Pagamento - Encomenda #${orderId}`,
          html: adminHtml
        }
      });

      if (adminEmailError) {
        console.error('Error sending admin email:', adminEmailError);
        throw adminEmailError;
      }
    }

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
    console.error('Detailed error in send-order-email:', error);
    console.error('Error stack trace:', error.stack);
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