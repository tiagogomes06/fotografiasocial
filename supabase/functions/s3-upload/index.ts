import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const s3Client = new S3Client({
  region: 'eu-west-1', // Changed to Ireland region
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? '',
  },
});

const BUCKET_NAME = Deno.env.get('AWS_BUCKET_NAME') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Upload to S3
    const arrayBuffer = await file.arrayBuffer();
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `photos/${fileName}`,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file instanceof File ? file.type : 'image/jpeg',
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    const s3Url = `https://${BUCKET_NAME}.s3.eu-west-1.amazonaws.com/photos/${fileName}`;
    console.log('Generated S3 URL:', s3Url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: s3Url
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
  }
});