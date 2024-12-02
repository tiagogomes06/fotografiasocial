import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"
import Sharp from "npm:sharp";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

console.log('Initializing S3 client with region:', Deno.env.get('AWS_REGION'));

const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION') ?? 'eu-west-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? '',
  },
});

const BUCKET_NAME = Deno.env.get('AWS_BUCKET_NAME') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Allow': 'POST, OPTIONS',
      }
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    console.log('Starting upload process...');
    console.log('Environment check:', {
      hasAccessKey: !!Deno.env.get('AWS_ACCESS_KEY_ID'),
      hasSecretKey: !!Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      bucketName: BUCKET_NAME,
      region: Deno.env.get('AWS_REGION')
    });

    if (!Deno.env.get('AWS_ACCESS_KEY_ID') || !Deno.env.get('AWS_SECRET_ACCESS_KEY')) {
      throw new Error('AWS credentials are missing');
    }

    if (!BUCKET_NAME) {
      throw new Error('AWS bucket name is missing');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('Missing or invalid file');
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const fileId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const originalFileName = `photos/${fileId}.${fileExt}`;
    const compressedFileName = `photos/${fileId}_compressed.${fileExt}`;

    console.log('Generated filenames:', { originalFileName, compressedFileName });

    // Upload original file
    const arrayBuffer = await file.arrayBuffer();
    const originalUploadParams = {
      Bucket: BUCKET_NAME,
      Key: originalFileName,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
        'x-amz-acl': 'public-read',
      },
    };

    console.log('Uploading original to S3...');
    await s3Client.send(new PutObjectCommand(originalUploadParams));

    // Create compressed version
    const compressedBuffer = await Sharp(arrayBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toBuffer();

    // Upload compressed file
    const compressedUploadParams = {
      Bucket: BUCKET_NAME,
      Key: compressedFileName,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      Metadata: {
        'x-amz-acl': 'public-read',
      },
    };

    console.log('Uploading compressed version to S3...');
    await s3Client.send(new PutObjectCommand(compressedUploadParams));

    // Generate URLs
    const region = Deno.env.get('AWS_REGION') ?? 'eu-west-1';
    const originalUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${originalFileName}`;
    const compressedUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${compressedFileName}`;

    console.log('Generated URLs:', { originalUrl, compressedUrl });

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: originalUrl,
        compressedUrl: compressedUrl
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        }, 
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});