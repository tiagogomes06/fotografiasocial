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
    console.log('[send-email] Starting email send process...');
    
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    if (!smtpPassword) {
      console.error('[send-email] SMTP_PASSWORD environment variable is not set');
      throw new Error('SMTP configuration error');
    }

    console.log('[send-email] Creating SMTP client...');
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

    const { to, subject, html } = await req.json();
    console.log(`[send-email] Preparing to send email to ${to} with subject: ${subject}`);
    console.log('[send-email] Email content:', html);

    const send = await client.send({
      from: "envio@fotografiaescolar.duploefeito.com",
      to: to,
      subject: subject,
      html: html,
    });

    console.log("[send-email] Email sent successfully:", send);
    await client.close();
    console.log("[send-email] SMTP client closed");

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
    console.error("[send-email] Error sending email:", error);
    console.error("[send-email] Error stack trace:", error.stack);
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