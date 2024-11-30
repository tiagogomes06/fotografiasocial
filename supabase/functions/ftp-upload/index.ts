import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FTPClient } from "https://deno.land/x/ftp@v0.0.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();

    const ftp = new FTPClient();
    await ftp.connect({
      host: Deno.env.get("FTP_HOST") || "",
      port: Number(Deno.env.get("FTP_PORT")) || 21,
      user: Deno.env.get("FTP_USER") || "",
      password: Deno.env.get("FTP_PASSWORD") || "",
    });

    // Convert base64 to Uint8Array
    const binaryData = Uint8Array.from(atob(fileData.split(',')[1]), c => c.charCodeAt(0));
    
    // Upload to FTP
    await ftp.uploadFrom(binaryData, `/photos/${fileName}`);
    await ftp.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        ftpUrl: `${Deno.env.get("FTP_BASE_URL")}/photos/${fileName}` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});