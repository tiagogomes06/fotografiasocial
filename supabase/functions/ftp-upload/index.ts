import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FTPClient } from "npm:basic-ftp@5.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();

    const client = new FTPClient();
    client.ftp.verbose = true; // Enable logging for debugging

    console.log('Connecting to FTP server...');
    await client.access({
      host: Deno.env.get("FTP_HOST"),
      port: Number(Deno.env.get("FTP_PORT")),
      user: Deno.env.get("FTP_USER"),
      password: Deno.env.get("FTP_PASSWORD"),
    });

    console.log('Connected to FTP server');

    // Convert base64 to Uint8Array
    const binaryString = atob(fileData.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a temporary file
    const tempFile = await Deno.makeTempFile();
    await Deno.writeFile(tempFile, bytes);

    // Upload to FTP
    console.log('Uploading file...');
    await client.uploadFrom(tempFile, `/photos/${fileName}`);
    console.log('File uploaded successfully');

    // Clean up temp file
    await Deno.remove(tempFile);

    // Close FTP connection
    await client.close();

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