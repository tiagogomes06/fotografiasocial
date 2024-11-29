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
    console.log('Starting email send process...');
    
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    if (!smtpPassword) {
      console.error('SMTP_PASSWORD environment variable is not set');
      throw new Error('SMTP configuration error');
    }

    const client = new SMTPClient({
      connection: {
        hostname: "fotografiaescolar.duploefeito.com",
        port: 465,
        tls: true,
        auth: {
          username: "envio@fotografiaescolar.duploefeito.com",
          password: smtpPassword,
        },
      },
    });

    const { to, subject, html } = await req.json()
    
    console.log(`Attempting to send email to ${to} with subject: ${subject}`);

    const send = await client.send({
      from: "envio@fotografiaescolar.duploefeito.com",
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", send);
    
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
    console.error("Detailed error sending email:", error);
    console.error("Error stack trace:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: 'Check Edge Function logs for more information'
      }),
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