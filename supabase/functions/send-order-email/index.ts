import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const FROM_EMAIL = 'envio@fotografiaescolar.duploefeito.com'
const ADMIN_EMAIL = 'eu@tiagogomes.pt'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendEmail(to: string[], subject: string, html: string) {
  console.log(`Attempting to send email to: ${to.join(', ')}`)
  
  const client = new SMTPClient({
    connection: {
      hostname: "fotografiaescolar.duploefeito.com",
      port: 465,
      tls: true,
      auth: {
        username: "envio@fotografiaescolar.duploefeito.com",
        password: "Imacdejose1506!",
      },
    },
  });

  try {
    for (const recipient of to) {
      const send = await client.send({
        from: FROM_EMAIL,
        to: recipient,
        subject: subject,
        html: html,
      });
      console.log(`Successfully sent email to ${recipient}:`, send)
    }
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, type } = await req.json()
    console.log(`Processing order email for order ${orderId}, type: ${type}`)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        students (
          name
        ),
        shipping_methods (
          name
        ),
        order_items (
          quantity,
          price_at_time,
          photos (
            url
          ),
          products (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      throw new Error(`Error fetching order: ${orderError?.message || 'Order not found'}`)
    }

    console.log('Successfully fetched order data')

    const orderItemsHtml = order.order_items.map(item => `
      <tr>
        <td class="py-4 px-6 border-b">${item.products.name}</td>
        <td class="py-4 px-6 border-b text-center">${item.quantity}</td>
        <td class="py-4 px-6 border-b text-right">${item.price_at_time}€</td>
        <td class="py-4 px-6 border-b text-center">
          <a href="${item.photos.url}" class="text-blue-600 hover:text-blue-800 underline">Ver foto</a>
        </td>
      </tr>
    `).join('')

    const shippingInfo = order.shipping_methods 
      ? `<div class="mb-4">
          <p class="text-gray-700"><strong>Método de envio:</strong> ${order.shipping_methods.name}</p>
          <p class="text-gray-700"><strong>Morada:</strong> ${order.shipping_address}, ${order.shipping_postal_code} ${order.shipping_city}</p>
         </div>`
      : ''

    const isCreatedEmail = type === 'created'
    const subject = isCreatedEmail 
      ? `Nova encomenda #${orderId}`
      : `Pagamento recebido - Encomenda #${orderId}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Base styles */
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
            .table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .total { margin-top: 20px; text-align: right; font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #333; margin: 0;">${isCreatedEmail ? 'Nova encomenda' : 'Pagamento confirmado'}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Olá ${order.shipping_name},</p>
              <p style="font-size: 16px; color: #555;">
                ${isCreatedEmail 
                  ? 'A sua encomenda foi criada com sucesso.' 
                  : 'O pagamento da sua encomenda foi confirmado.'}
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Detalhes da encomenda #${orderId}</h2>
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${order.shipping_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${order.email}</p>
                <p style="margin: 5px 0;"><strong>Telefone:</strong> ${order.shipping_phone}</p>
              </div>
              
              ${shippingInfo}
              
              <table class="table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Produto</th>
                    <th style="text-align: center;">Quantidade</th>
                    <th style="text-align: right;">Preço</th>
                    <th style="text-align: center;">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                <p style="font-size: 18px; color: #333;">
                  <strong>Total:</strong> ${order.total_amount}€
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>Obrigado pela sua compra!</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to customer and admin
    await sendEmail([order.email, ADMIN_EMAIL], subject, emailHtml)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-order-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

serve(handler)