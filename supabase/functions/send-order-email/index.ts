import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'envio@fotografiaescolar.duploefeito.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  orderId: string;
  type: 'created' | 'paid';
  html?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { orderId, type, html } = await req.json() as EmailRequest
    console.log(`Processing ${type} email for order ${orderId}`)

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    // Get order details from database if html is not provided
    let emailHtml = html
    let to: string[] = []

    if (!html) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error || !order) {
        throw new Error(`Failed to fetch order: ${error?.message || 'Order not found'}`)
      }

      to = [order.email]
      emailHtml = `
        <h2>${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}</h2>
        <p>Total: ${order.total_amount}€</p>
      `
    }

    console.log('Sending email with Resend:', {
      to,
      subject: `${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}`,
      html: emailHtml
    })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: `${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', error)
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

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