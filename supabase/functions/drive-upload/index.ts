import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken() {
  const serviceAccount = {
    "type": "service_account",
    "project_id": Deno.env.get('GOOGLE_PROJECT_ID'),
    "private_key_id": Deno.env.get('GOOGLE_PRIVATE_KEY_ID'),
    "private_key": Deno.env.get('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    "client_email": Deno.env.get('GOOGLE_CLIENT_EMAIL'),
    "client_id": Deno.env.get('GOOGLE_CLIENT_ID'),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": Deno.env.get('GOOGLE_CERT_URL')
  };

  // Create JWT
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  };

  // Encode header and claim
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const claimB64 = btoa(JSON.stringify(claim));

  // Create signature
  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(`${headerB64}.${claimB64}`)
  );

  const jwt = `${headerB64}.${claimB64}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const { access_token } = await tokenResponse.json();
  return access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();
    
    if (!fileData || !fileName) {
      throw new Error('Missing required data: fileData or fileName');
    }

    console.log(`Starting upload for file: ${fileName}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Remove data URL prefix and convert to binary
    const base64Data = fileData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Create file metadata
    const metadata = {
      name: fileName,
      parents: [Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')],
    };

    // Create multipart form data
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    // Construct the multipart request body
    const requestBody = new TextEncoder().encode(
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/octet-stream\r\n\r\n'
    );

    // Combine metadata and file data
    const multipartRequestBody = new Uint8Array([
      ...requestBody,
      ...binaryData,
      ...new TextEncoder().encode(closeDelim)
    ]);

    console.log('Sending request to Google Drive API...');

    // Upload file using Google Drive API
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': multipartRequestBody.length.toString(),
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Drive API Error:', errorText);
      throw new Error(`Failed to upload to Google Drive: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload successful. File ID:', data.id);

    // Generate the public URL for the file
    const fileUrl = `https://drive.google.com/uc?export=view&id=${data.id}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: fileUrl
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload process:', error);
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
  }
});