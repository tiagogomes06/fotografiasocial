import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let client: Client | null = null;

  try {
    console.log('Starting FTP upload process...');
    const { fileData, fileName } = await req.json();
    
    if (!fileData || !fileName) {
      console.error('Missing required data:', { hasFileData: !!fileData, hasFileName: !!fileName });
      throw new Error('Missing required data: fileData or fileName');
    }

    console.log('Received file:', fileName);

    // Convert base64 to Uint8Array
    const base64Data = fileData.split(',')[1];
    console.log('Converting base64 to binary...');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

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

    // Create a temporary file
    const tempFilePath = await Deno.makeTempFile();
    await Deno.writeFile(tempFilePath, bytes);

    // Ensure /photos directory exists
    try {
      await client.ensureDir("/photos");
      console.log("Photos directory confirmed");
    } catch (error) {
      console.log('Directory already exists or could not be created:', error);
    }

    // Upload file
    console.log('Starting file upload...');
    await client.uploadFrom(tempFilePath, `/photos/${fileName}`);
    console.log("File uploaded successfully");

    // Clean up temp file
    await Deno.remove(tempFilePath);

    const publicUrl = `fotografiaescolar.duploefeito.com/fotos_alojamento/photos/${fileName}`;
    console.log('Generated public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in FTP upload:', error);
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