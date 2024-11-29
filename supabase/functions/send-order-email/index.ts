import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_BSgJrjKk_GQr6KvL1JkjurhqXguUYSzNK'
const FROM_EMAIL = 'encomedas@duploefeito.com'
const ADMIN_EMAIL = 'gomes@duploefeito.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, type } = await req.json()
    console.log(`Sending ${type} email for order ${orderId}`)

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
      throw new Error(`Error fetching order: ${orderError?.message || 'Order not found'}`)
    }

    const orderItemsHtml = order.order_items.map(item => `
      <tr>
        <td>${item.products.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price_at_time}€</td>
        <td><a href="${item.photos.url}">Ver foto</a></td>
      </tr>
    `).join('')

    const shippingInfo = order.shipping_methods 
      ? `<p>Método de envio: ${order.shipping_methods.name}</p>
         <p>Morada: ${order.shipping_address}, ${order.shipping_postal_code} ${order.shipping_city}</p>`
      : ''

    const isCreatedEmail = type === 'created'
    const subject = isCreatedEmail 
      ? `Nova encomenda #${orderId}`
      : `Pagamento recebido - Encomenda #${orderId}`

    const emailHtml = `
      <h1>${isCreatedEmail ? 'Nova encomenda' : 'Pagamento confirmado'}</h1>
      <p>Olá ${order.shipping_name},</p>
      <p>${isCreatedEmail 
          ? 'A sua encomenda foi criada com sucesso.' 
          : 'O pagamento da sua encomenda foi confirmado.'}</p>
      <h2>Detalhes da encomenda #${orderId}</h2>
      <p>Cliente: ${order.shipping_name}</p>
      <p>Email: ${order.email}</p>
      <p>Telefone: ${order.shipping_phone}</p>
      ${shippingInfo}
      <h3>Produtos:</h3>
      <table>
        <tr>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Preço</th>
          <th>Foto</th>
        </tr>
        ${orderItemsHtml}
      </table>
      <p><strong>Total: ${order.total_amount}€</strong></p>
    `

    // Send email to customer
    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [order.email],
        subject,
        html: emailHtml,
      }),
    })

    // Send email to admin
    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject,
        html: emailHtml,
      }),
    })

    if (!customerResponse.ok || !adminResponse.ok) {
      throw new Error('Failed to send emails')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending order email:', error)
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