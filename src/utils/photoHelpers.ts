import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadPhoto = async (file: File, studentId: string) => {
  try {
    console.log('Iniciando upload da foto:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    if (!file.type.startsWith('image/')) {
      const errorMsg = `Tipo de arquivo inválido: ${file.type}. Apenas imagens são permitidas.`;
      console.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Upload para o Supabase Storage através da Edge Function
    const formData = new FormData();
    formData.append('file', file);

    const response = await supabase.functions.invoke('s3-upload', {
      body: formData,
    });

    if (response.error) {
      console.error('Erro na Edge Function:', response.error);
      throw new Error(`Erro no upload: ${response.error.message}`);
    }

    if (!response.data?.url) {
      console.error('Resposta inválida da Edge Function:', response.data);
      throw new Error('URL da foto não retornada pelo servidor');
    }

    const { url: photoUrl } = response.data;
    console.log('URL gerada:', { photoUrl });

    // Criar registro na tabela photos
    const { data: photoRecord, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: photoUrl,
        student_id: studentId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar na tabela photos:', dbError);
      toast.error(`Erro ao salvar foto: ${dbError.message}`);
      throw dbError;
    }

    console.log('Registro criado na tabela photos:', photoRecord);
    return photoRecord;

  } catch (error) {
    console.error('Erro durante o processo de upload:', error);
    toast.error(`Erro no upload: ${error.message}`);
    throw error;
  }
};