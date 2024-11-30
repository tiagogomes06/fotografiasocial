import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function setupFtpClient(): Promise<Client> {
  const client = new Client();
  client.ftp.verbose = true;
  
  const host = Deno.env.get("FTP_HOST");
  const port = Number(Deno.env.get("FTP_PORT"));
  const user = Deno.env.get("FTP_USER");
  const password = Deno.env.get("FTP_PASSWORD");

  console.log('FTP Configuration:', { 
    host, 
    port,
    user,
    hasPassword: !!password
  });

  await client.access({
    host: host || "",
    port: port || 21,
    user: user || "",
    password: password || "",
    secure: false,
    timeout: 30000, // 30 seconds timeout
  });

  return client;
}

async function retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error('Operation failed after all retries');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let client: Client | null = null;

  try {
    console.log('Starting FTP upload process...')
    const { fileData, fileName } = await req.json()
    
    if (!fileData || !fileName) {
      console.error('Missing required data:', { fileData: !!fileData, fileName: !!fileName })
      throw new Error('Missing required data: fileData or fileName')
    }

    console.log('Received file:', fileName)

    // Convert base64 to Uint8Array
    const base64Data = fileData.split(',')[1]
    console.log('Converting base64 to binary...')
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    client = await retryOperation(async () => {
      const ftpClient = await setupFtpClient();
      console.log("Connected to FTP server");
      return ftpClient;
    });

    // Ensure /photos directory exists
    await retryOperation(async () => {
      try {
        await client!.ensureDir("/photos");
        console.log("Photos directory confirmed");
      } catch (error) {
        console.log('Directory already exists or could not be created:', error);
      }
    });

    // Upload file
    await retryOperation(async () => {
      console.log('Starting file upload...');
      await client!.uploadFrom(bytes.buffer, `/photos/${fileName}`);
      console.log("File uploaded successfully");
    });

    // Construct the public URL
    const baseUrl = Deno.env.get("FTP_BASE_URL");
    if (!baseUrl) {
      throw new Error('FTP_BASE_URL environment variable is not set');
    }
    
    const publicUrl = `${baseUrl}/photos/${fileName}`;
    console.log('Generated public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in FTP upload:', error);
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
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('FTP connection closed');
      } catch (error) {
        console.error('Error closing FTP connection:', error);
      }
    }
  }
});