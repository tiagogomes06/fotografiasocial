import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createEmailTemplate } from './emailTemplates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, type, paymentDetails } = await req.json();

    const client = new SMTPClient({
      connection: {
        hostname: "mail.duploefeito.com",
        port: 465,
        tls: true,
        auth: {
          username: "encomendas@duploefeito.com",
          password: Deno.env.get('SMTP_PASSWORD')!,
        },
      },
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    if (!order) throw new Error('Order not found');
    if (!order.email) throw new Error('No email address associated with order');

    // Create email content with proper encoding
    const customerEmailHtml = createEmailTemplate(order, type, false, paymentDetails);
    
    // Send customer email with content-transfer-encoding set to base64
    await client.send({
      from: "encomendas@duploefeito.com",
      to: order.email,
      subject: type === 'created' ? 
        `Nova Encomenda #${orderId}` : 
        `Pagamento Confirmado - Encomenda #${orderId}`,
      html: customerEmailHtml,
      headers: {
        "Content-Transfer-Encoding": "quoted-printable",
        "Content-Type": "text/html; charset=UTF-8"
      }
    });

    // Send admin notification for paid orders
    if (type === 'paid') {
      const adminEmailHtml = createEmailTemplate(order, type, true);
      await client.send({
        from: "encomendas@duploefeito.com",
        to: ["gomes@duploefeito.com", "eu@tiagogomes.pt"],
        subject: `Novo Pagamento Recebido - Encomenda #${orderId}`,
        html: adminEmailHtml,
        headers: {
          "Content-Transfer-Encoding": "quoted-printable",
          "Content-Type": "text/html; charset=UTF-8"
        }
      });
    }

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('Error in send-order-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});