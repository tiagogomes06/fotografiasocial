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

async function sendOrderConfirmationEmail(orderId: string) {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Send email notification
    await supabase.functions.invoke('send-email', {
      body: {
        to: "eu@tiagogomes.pt",
        subject: "Nova Compra Confirmada - Fotografia Escolar",
        html: `
          <h1>Nova compra confirmada</h1>
          <p>Total: ${order.total_amount.toFixed(2)}€</p>
          <h2>Itens:</h2>
          <ul>
            ${order.order_items.map((item: any) => 
              `<li>${item.products.name} - ${item.price_at_time}€</li>`
            ).join('')}
          </ul>
        `
      }
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('Stripe-Signature')
    const eupago_signature = req.headers.get('x-eupago-signature')

    if (signature) {
      // Handle Stripe webhook
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
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('payment_id', session.id)

        // Send confirmation email
        await sendOrderConfirmationEmail(session.metadata.order_id);
      }

    } else {
      // Handle EuPago webhook
      const { valor, canal, referencia, transacao, identificador } = await req.json()
      
      console.log('Received EuPago webhook:', { 
        valor, 
        canal, 
        referencia, 
        transacao, 
        identificador 
      })

      // Verify the payment status and update the order
      if (transacao === 'paid') {
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('payment_id', identificador)

        // Send confirmation email
        await sendOrderConfirmationEmail(identificador);
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