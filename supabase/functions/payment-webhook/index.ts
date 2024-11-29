import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const eupago_signature = req.headers.get('x-eupago-signature')

    if (signature) {
      // Handle Stripe webhook
      const body = await req.text()
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET!
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('payment_id', session.id)
      }
    } else if (eupago_signature) {
      // Handle EuPago webhook
      const body = await req.json()
      
      // Verify EuPago signature
      const calculatedSignature = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(body + EUPAGO_API_KEY)
      )
      const signatureHex = Array.from(new Uint8Array(calculatedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      if (signatureHex !== eupago_signature) {
        throw new Error('Invalid EuPago signature')
      }

      if (body.status === 'paid') {
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('payment_id', body.payment_id)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})