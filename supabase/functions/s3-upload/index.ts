import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const fileName = `photos/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    console.log('Generated filename:', fileName);

    const arrayBuffer = await file.arrayBuffer();
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
        'x-amz-acl': 'public-read',
      },
    };

    console.log('Uploading to S3:', {
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      contentType: uploadParams.ContentType,
      size: arrayBuffer.byteLength,
      acl: uploadParams.ACL
    });

    const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('S3 upload result:', uploadResult);

    // Generate a direct public URL
    const s3Url = `https://${BUCKET_NAME}.s3.${Deno.env.get('AWS_REGION') ?? 'eu-west-1'}.amazonaws.com/${fileName}`;
    console.log('Generated S3 URL:', s3Url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: s3Url
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