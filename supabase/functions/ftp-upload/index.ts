import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let client: Client | null = null;
  let supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('Starting upload process...');
    const { fileData, fileName } = await req.json();
    
    if (!fileData || !fileName) {
      console.error('Missing required data:', { hasFileData: !!fileData, hasFileName: !!fileName });
      throw new Error('Missing required data: fileData or fileName');
    }

    // Convert base64 to file
    const base64Data = fileData.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create temporary file
    const tempFilePath = await Deno.makeTempFile();
    await Deno.writeFile(tempFilePath, bytes);

    // Connect to FTP and upload
    client = new Client();
    client.ftp.verbose = true;
    
    console.log('Connecting to FTP...');
    await client.access({
      host: "bashir.servidorpt.pt",
      port: 21,
      user: "tiagogom",
      password: "kxuCUa8P.F74",
      secure: false
    });

    const ftpPath = `/home/tiagogom/fotografiaescolar.duploefeito.com/fotos_alojamento/photos`;
    
    // Ensure directory exists
    try {
      await client.ensureDir(ftpPath);
      console.log("Photos directory confirmed");
    } catch (error) {
      console.log('Directory already exists or could not be created:', error);
    }

    // Upload the file directly to FTP
    console.log('Starting FTP upload...');
    await client.uploadFrom(tempFilePath, `${ftpPath}/${fileName}`);
    
    // Clean up temporary file
    await Deno.remove(tempFilePath);
    
    console.log("File uploaded successfully to FTP");

    // Create photo record with FTP URL
    const ftpUrl = `fotografiaescolar.duploefeito.com/fotos_alojamento/photos/${fileName}`;
    console.log('Generated FTP URL:', ftpUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: ftpUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload process:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('FTP connection closed');
      } catch (error) {
        console.error('Error closing FTP connection:', error);
      }
    }
  }
});