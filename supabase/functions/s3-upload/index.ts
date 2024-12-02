import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting upload process...');
    console.log('Environment check:', {
      hasAwsAccess: !!Deno.env.get('AWS_ACCESS_KEY_ID'),
      hasAwsSecret: !!Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      hasAwsBucket: !!Deno.env.get('AWS_BUCKET_NAME'),
      hasAwsRegion: !!Deno.env.get('AWS_REGION')
    });

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.error('No file uploaded or invalid file');
      throw new Error('Missing or invalid file');
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Initialize S3 client
    const s3Client = new S3Client({
      region: Deno.env.get('AWS_REGION') || 'eu-west-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    const fileId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const fileName = `photos/${fileId}.${fileExt}`;

    console.log('Generated filename:', fileName);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: Deno.env.get('AWS_BUCKET_NAME') || 'fotosduplo',
      Key: fileName,
      Body: arrayBuffer,
      ContentType: file.type,
    });

    try {
      await s3Client.send(command);
      console.log('File uploaded successfully to S3');
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      throw new Error('Failed to upload file to S3');
    }

    // Generate the S3 URL
    const s3Url = `https://${Deno.env.get('AWS_BUCKET_NAME')}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${fileName}`;
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        type: error.name
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});