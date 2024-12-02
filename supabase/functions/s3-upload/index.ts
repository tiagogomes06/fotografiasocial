import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting upload process...')
    
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) {
      console.error('No file uploaded')
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: Deno.env.get('AWS_REGION'),
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
      },
      // Required for Deno
      runtime: "deno",
      requestHandler: {
        metadata: { handlerProtocol: "fetch" }
      }
    });

    // Generate a unique filename while keeping the original extension
    const fileExt = file.name.split('.').pop()
    const uniqueFileName = `photos/${crypto.randomUUID()}.${fileExt}`
    console.log('Generated unique filename:', uniqueFileName)

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: Deno.env.get('AWS_BUCKET_NAME'),
      Key: uniqueFileName,
      Body: arrayBuffer,
      ContentType: file.type,
      ACL: 'public-read'
    })

    console.log('Attempting S3 upload...')
    await s3Client.send(command)
    console.log('S3 upload successful')

    // Generate the S3 URL
    const s3Url = `https://${Deno.env.get('AWS_BUCKET_NAME')}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${uniqueFileName}`
    console.log('Generated S3 URL:', s3Url)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: s3Url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in upload process:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
