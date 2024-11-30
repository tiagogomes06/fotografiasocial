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
    
    let file;
    let fileName;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const { fileData, fileName: providedFileName } = await req.json();
      if (!fileData || !providedFileName) {
        throw new Error('Missing required data: fileData or fileName');
      }
      fileName = providedFileName;
      
      // Convert base64 to blob
      const base64Data = fileData.split(',')[1];
      const byteString = atob(base64Data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      file = new Blob([byteArray]);
    } else {
      const formData = await req.formData();
      file = formData.get('file');
      if (!file || !(file instanceof File)) {
        throw new Error('Missing or invalid file');
      }
      fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    }

    console.log('Generated filename:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file instanceof File ? file.type : 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded to Supabase, getting public URL...');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

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

    // Download from Supabase and upload to FTP
    console.log('Starting FTP upload...');
    const response = await fetch(publicUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    await client.uploadFrom(
      new Uint8Array(arrayBuffer),
      `${ftpPath}/${fileName}`
    );
    
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