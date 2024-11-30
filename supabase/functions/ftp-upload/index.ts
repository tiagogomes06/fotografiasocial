import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

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
    const { fileData, fileName } = await req.json()

    // Convert base64 to Uint8Array
    const binaryString = atob(fileData.split(',')[1])
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Create temporary file
    const tempFile = await Deno.makeTempFile()
    await Deno.writeFile(tempFile, bytes)

    // Setup FTP client
    const client = new Client()
    client.ftp.verbose = true

    try {
      // Connect to FTP server
      await client.access({
        host: Deno.env.get("FTP_HOST") || "",
        port: Number(Deno.env.get("FTP_PORT")) || 21,
        user: Deno.env.get("FTP_USER") || "",
        password: Deno.env.get("FTP_PASSWORD") || "",
      })

      console.log("Connected to FTP server")

      // Upload file to /photos directory
      await client.uploadFrom(tempFile, `/photos/${fileName}`)
      console.log("File uploaded successfully")

      // Construct the public URL
      const baseUrl = Deno.env.get("FTP_BASE_URL") || ""
      const publicUrl = `${baseUrl}/photos/${fileName}`

      return new Response(
        JSON.stringify({ 
          success: true, 
          url: publicUrl
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )

    } finally {
      // Clean up
      client.close()
      await Deno.remove(tempFile)
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})