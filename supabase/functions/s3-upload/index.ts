import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Allow': 'POST, OPTIONS',
      },
      status: 204
    });
  }

  try {
    console.log('Starting upload process...');
    console.log('Environment check:', {
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRole: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const originalFileName = `photos/${fileId}.${fileExt}`;
    const compressedFileName = `photos/${fileId}_compressed.${fileExt}`;

    console.log('Generated filenames:', { originalFileName, compressedFileName });

    // Upload original file
    const arrayBuffer = await file.arrayBuffer();
    const originalUploadParams = {
      Bucket: Deno.env.get('AWS_BUCKET_NAME') ?? '',
      Key: originalFileName,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ACL: 'public-read',
      Metadata: {
        'x-amz-acl': 'public-read',
      },
    };

    console.log('Uploading to S3...');
    const { data, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(originalFileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload file');
    }

    // Generate URLs
    const region = Deno.env.get('AWS_REGION') ?? 'eu-west-1';
    const bucketName = Deno.env.get('AWS_BUCKET_NAME') ?? '';
    const originalUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${originalFileName}`;
    const compressedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${compressedFileName}`;

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
          'Content-Type': 'application/json'
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }, 
        status: 500 
      }
    );
  }
});