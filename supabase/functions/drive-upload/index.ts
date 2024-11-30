import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function uploadToDrive(fileData: string, fileName: string) {
  const GOOGLE_DRIVE_FOLDER_ID = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
  const GOOGLE_DRIVE_API_KEY = Deno.env.get('GOOGLE_DRIVE_API_KEY');
  
  // Remove data URL prefix and convert to binary
  const base64Data = fileData.split(',')[1];
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

  // Create file metadata
  const metadata = {
    name: fileName,
    parents: [GOOGLE_DRIVE_FOLDER_ID],
  };

  // Upload file using Google Drive API
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([binaryData]));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOOGLE_DRIVE_API_KEY}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Google Drive');
  }

  const data = await response.json();
  return `https://drive.google.com/uc?export=view&id=${data.id}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();
    if (!fileData || !fileName) {
      throw new Error('Missing required data: fileData or fileName');
    }

    const fileUrl = await uploadToDrive(fileData, fileName);

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