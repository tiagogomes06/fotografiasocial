import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    const { orderId, type, html } = await req.json() as EmailRequest
    console.log(`Processing ${type} email for order ${orderId}`)

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

      if (!order.email) {
        throw new Error('Order has no email address')
      }

      to = [order.email]
      emailHtml = `
        <h2>${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}</h2>
        <p>Total: ${order.total_amount}€</p>
        <p>Estado: ${order.status}</p>
        <p>Data: ${new Date().toLocaleString('pt-PT')}</p>
      `
    }

    console.log('Sending email:', {
      to,
      subject: `${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}`,
      html: emailHtml
    })

    const send = await client.send({
      from: "envio@fotografiaescolar.duploefeito.com",
      to: to,
      subject: `${type === 'created' ? 'Nova encomenda' : 'Pagamento confirmado'} #${orderId}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", send)
    
    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
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