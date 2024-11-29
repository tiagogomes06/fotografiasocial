import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderEmailRequest {
  orderId: string;
  type: 'created' | 'paid';
}

const getOrderDetails = async (supabase: any, orderId: string) => {
  // Get order details including shipping method and items
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
  return order;
}

const createEmailTemplate = (order: any, type: 'created' | 'paid') => {
  const items = order.order_items.map((item: any) => ({
    name: item.products.name,
    quantity: item.quantity,
    price: item.price_at_time,
    photoUrl: item.photos.url
  }));

  const shippingInfo = order.shipping_address ? 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>Morada de Envio:</strong><br>
        ${order.shipping_name}<br>
        ${order.shipping_address}<br>
        ${order.shipping_postal_code} ${order.shipping_city}
      </td>
    </tr>` : '';

  const title = type === 'created' ? 
    'Nova Encomenda Criada' : 
    'Pagamento Recebido';

  const message = type === 'created' ? 
    'A sua encomenda foi criada com sucesso.' : 
    'O pagamento da sua encomenda foi confirmado.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f8f8; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 20px; text-align: center;">${title}</h1>
        <p style="text-align: center; color: #666;">${message}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>Número da Encomenda:</strong> ${order.id}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>Cliente:</strong> ${order.shipping_name}<br>
            <strong>Email:</strong> ${order.email}<br>
            <strong>Telefone:</strong> ${order.shipping_phone}
          </td>
        </tr>
        ${shippingInfo}
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>Método de Pagamento:</strong> ${order.payment_method}<br>
            <strong>Método de Envio:</strong> ${order.shipping_methods?.name || 'N/A'} 
            (${order.shipping_methods?.price ? order.shipping_methods.price + '€' : 'Grátis'})
          </td>
        </tr>
      </table>

      <h2 style="margin-top: 30px; color: #333;">Itens da Encomenda</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        ${items.map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <div style="display: flex; align-items: center;">
                <div style="flex: 1;">
                  <strong>${item.name}</strong><br>
                  Quantidade: ${item.quantity}<br>
                  Preço: ${item.price}€<br>
                  <a href="${item.photoUrl}" style="color: #007bff; text-decoration: none;">Ver Foto</a>
                </div>
              </div>
            </td>
          </tr>
        `).join('')}
        <tr>
          <td style="padding: 10px; text-align: right;">
            <strong>Total:</strong> ${order.total_amount}€
          </td>
        </tr>
      </table>

      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>Obrigado pela sua preferência!</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: "fotografiaescolar.duploefeito.com",
        port: 465,
        tls: true,
        auth: {
          username: "envio@fotografiaescolar.duploefeito.com",
          password: Deno.env.get('SMTP_PASSWORD'),
        },
      },
    });

    const { orderId, type } = await req.json() as OrderEmailRequest;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const order = await getOrderDetails(supabase, orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Generate email content
    const html = createEmailTemplate(order, type);
    const subject = type === 'created' ? 
      `Nova Encomenda #${orderId}` : 
      `Pagamento Confirmado - Encomenda #${orderId}`;

    // Send email to customer
    await client.send({
      from: "envio@fotografiaescolar.duploefeito.com",
      to: order.email,
      subject: subject,
      html: html,
    });

    // If payment is completed, send notification to admin
    if (type === 'paid') {
      await client.send({
        from: "envio@fotografiaescolar.duploefeito.com",
        to: "envio@fotografiaescolar.duploefeito.com", // Admin email
        subject: `[ADMIN] Pagamento Recebido - Encomenda #${orderId}`,
        html: html,
      });
    }

    await client.close();

    console.log(`Email sent successfully for order ${orderId} (${type})`);

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