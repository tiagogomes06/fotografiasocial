import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3 } from "https://deno.land/x/s3@0.5.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting upload process...');
    
    // Get AWS credentials from environment
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsBucket = Deno.env.get('AWS_BUCKET_NAME');
    const awsRegion = Deno.env.get('AWS_REGION');

    console.log('AWS Configuration:', {
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

    // Initialize S3 client
    const s3 = new S3({
      accessKeyID: awsAccessKey,
      secretKey: awsSecretKey,
      region: awsRegion,
    });

    // Convert File to ArrayBuffer and then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    try {
      // Upload to S3
      await s3.putObject({
        bucket: awsBucket,
        key: fileName,
        body: uint8Array,
        contentType: file.type,
        acl: "public-read",
      });

      console.log('S3 upload successful');
    } catch (uploadError) {
      console.error('S3 upload error details:', {
        error: uploadError,
        message: uploadError.message,
        stack: uploadError.stack,
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