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
    
    // Get AWS credentials from environment
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsBucket = Deno.env.get('AWS_BUCKET_NAME');
    const awsRegion = Deno.env.get('AWS_REGION');

    console.log('AWS Configuration check:', {
      hasAccessKey: !!awsAccessKey,
      hasSecretKey: !!awsSecretKey,
      bucket: awsBucket,
      region: awsRegion
    });

    if (!awsAccessKey || !awsSecretKey || !awsBucket || !awsRegion) {
      throw new Error('Missing AWS credentials or configuration');
    }

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

    const fileId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const fileName = `photos/${fileId}.${fileExt}`;

    console.log('Generated filename:', fileName);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Initialize S3 client with explicit configuration
    const s3Client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
      },
      // Disable loading from shared config files
      loadDefaultConfig: false,
      // Force path-style endpoint
      forcePathStyle: true,
      // Explicitly set the endpoint
      endpoint: `https://s3.${awsRegion}.amazonaws.com`
    });

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: awsBucket,
      Key: fileName,
      Body: arrayBuffer,
      ContentType: file.type,
      ACL: 'public-read'
    });

    try {
      const uploadResult = await s3Client.send(command);
      console.log('S3 upload successful:', uploadResult);
    } catch (uploadError) {
      console.error('S3 upload error details:', {
        error: uploadError,
        message: uploadError.message,
        stack: uploadError.stack,
        name: uploadError.name
      });
      throw new Error(`Failed to upload file to S3: ${uploadError.message}`);
    }

    // Generate the S3 URL
    const s3Url = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${fileName}`;
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