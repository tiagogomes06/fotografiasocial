import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId);

  if (error) throw error;
}

async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        ),
        shipping_method (*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const itemsList = order.order_items
      .map((item: any) => `${item.products.name} - ${item.price_at_time}€`)
      .join('<br>');

    const shippingInfo = order.shipping_method 
      ? `<p>Método de envio: ${order.shipping_method.name} - ${order.shipping_method.price}€</p>`
      : '';

    await supabase.functions.invoke('send-email', {
      body: {
        to: order.email,
        subject: "Confirmação de Compra - Fotografia Escolar",
        html: `
          <h1>Confirmação de Compra</h1>
          <p>Caro(a) ${order.shipping_name},</p>
          <p>O seu pagamento foi confirmado com sucesso!</p>
          <h2>Detalhes da compra:</h2>
          <p>Número do pedido: ${order.id}</p>
          ${itemsList}
          ${shippingInfo}
          <p><strong>Total: ${order.total_amount.toFixed(2)}€</strong></p>
          <p>Obrigado pela sua compra!</p>
        `
      }
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('Stripe-Signature')
    const eupago_signature = req.headers.get('x-eupago-signature')

    if (signature) {
      const body = await req.text()
      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
        undefined,
        cryptoProvider
      )

      console.log('Received Stripe webhook event:', event.type)

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        await updateOrderStatus(session.metadata.order_id, 'completed')
        await sendOrderConfirmationEmail(session.metadata.order_id)
      }

    } else if (eupago_signature) {
      const { valor, canal, referencia, transacao, identificador } = await req.json()
      
      console.log('Received EuPago webhook:', { 
        valor, 
        canal, 
        referencia, 
        transacao, 
        identificador 
      })

      if (transacao === 'paid') {
        await updateOrderStatus(identificador, 'completed')
        await sendOrderConfirmationEmail(identificador)
      } else if (transacao === 'failed') {
        await updateOrderStatus(identificador, 'failed')
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})