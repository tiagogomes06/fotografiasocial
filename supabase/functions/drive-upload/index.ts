import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
          'Authorization': `Bearer ${Deno.env.get('GOOGLE_DRIVE_API_KEY')}`,
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