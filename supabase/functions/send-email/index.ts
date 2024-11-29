import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { to, subject, html } = await req.json()

    console.log(`Sending email to ${to} with subject: ${subject}`)

    const send = await client.send({
      from: "envio@fotografiaescolar.duploefeito.com",
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", send)
    
    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})