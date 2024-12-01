import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION') ?? 'eu-west-1',
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

  try {
    console.log('Starting upload process...');
    
    // Verificar se as credenciais estão presentes
    if (!Deno.env.get('AWS_ACCESS_KEY_ID') || !Deno.env.get('AWS_SECRET_ACCESS_KEY')) {
      console.error('AWS credentials are missing');
      throw new Error('AWS credentials are missing');
    }

    if (!BUCKET_NAME) {
      console.error('AWS bucket name is missing');
      throw new Error('AWS bucket name is missing');
    }

    let file;
    let fileName;
    const contentType = req.headers.get('content-type') || '';

    console.log('Content-Type:', contentType);

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
        console.error('Missing or invalid file');
        throw new Error('Missing or invalid file');
      }
      fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    }

    console.log('Generated filename:', fileName);
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    // Upload to S3
    const arrayBuffer = await file.arrayBuffer();
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `photos/${fileName}`,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file instanceof File ? file.type : 'image/jpeg',
      ACL: 'public-read',
    };

    console.log('Uploading to S3 with params:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      FileSize: arrayBuffer.byteLength
    });

    try {
      const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('S3 upload successful:', uploadResult);
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }
    
    const s3Url = `https://${BUCKET_NAME}.s3.${Deno.env.get('AWS_REGION') ?? 'eu-west-1'}.amazonaws.com/photos/${fileName}`;
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