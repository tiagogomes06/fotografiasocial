import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Starting upload process...')
    
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) {
      console.error('No file uploaded')
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Get AWS credentials
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const awsBucket = Deno.env.get('AWS_BUCKET_NAME')
    const awsRegion = Deno.env.get('AWS_REGION')

    console.log('AWS Configuration:', {
      hasAccessKey: !!awsAccessKey,
      hasSecretKey: !!awsSecretKey,
      bucket: awsBucket,
      region: awsRegion
    })

    if (!awsAccessKey || !awsSecretKey || !awsBucket || !awsRegion) {
      throw new Error('Missing AWS credentials or configuration')
    }

    // Initialize S3 client with explicit credentials
    const s3Client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
      // Disable loading credentials from shared config files
      loadDefaultConfig: false
    })

    // Use original filename
    const fileName = file.name
    console.log('File details:', {
      name: fileName,
      type: file.type,
      size: file.size
    })

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: awsBucket,
      Key: fileName,
      Body: arrayBuffer,
      ContentType: file.type,
      ACL: 'public-read'
    })

    console.log('Attempting S3 upload...')
    const uploadResult = await s3Client.send(command)
    console.log('S3 upload successful:', uploadResult)

    // Generate the S3 URL
    const s3Url = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${fileName}`
    console.log('Generated S3 URL:', s3Url)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: s3Url
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})