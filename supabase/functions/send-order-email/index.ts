import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createEmailTemplate, type OrderDetails } from './emailTemplates.ts'
import { createSMTPClient } from './smtpClient.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  orderId: string;
  type: 'created' | 'paid';
}

const getOrderDetails = async (supabase: any, orderId: string) => {
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

  if (orderError) throw orderError;
  return order as OrderDetails;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = createSMTPClient();

    const { orderId, type } = await req.json() as EmailRequest;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing email for order ${orderId} (${type})`);

    // Get order details
    const order = await getOrderDetails(supabase, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Generate customer email content
    const customerHtml = createEmailTemplate(order, type);
    const subject = type === 'created' ? 
      `Nova Encomenda #${orderId}` : 
      `Pagamento Confirmado - Encomenda #${orderId}`;

    // Send email to customer
    if (order.email) {
      console.log(`Sending ${type} email to customer: ${order.email}`);
      await client.send({
        from: "envio@fotografiaescolar.duploefeito.com",
        to: order.email,
        subject: subject,
        html: customerHtml,
      });
    }

    // If payment is completed, send notification to admin
    if (type === 'paid') {
      console.log('Sending payment notification to admin');
      const adminHtml = createEmailTemplate(order, type, true);
      await client.send({
        from: "envio@fotografiaescolar.duploefeito.com",
        to: "envio@fotografiaescolar.duploefeito.com",
        subject: `[ADMIN] Pagamento Recebido - Encomenda #${orderId}`,
        html: adminHtml,
      });
    }

    await client.close();

    console.log(`Email(s) sent successfully for order ${orderId} (${type})`);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});