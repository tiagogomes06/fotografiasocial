import { supabase } from "@/integrations/supabase/client";
import { School, Class, Student } from "@/types/admin";
import { toast } from "sonner";

export const createSchool = async (name: string) => {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createClass = async (name: string, schoolId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .insert({ name, school_id: schoolId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createStudent = async (name: string, classId: string, accessCode: string) => {
  const { data, error } = await supabase
    .from('students')
    .insert({ name, class_id: classId, access_code: accessCode })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

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

    // Upload para o S3 através da Edge Function
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

    const s3Url = response.data.url;
    console.log('URL S3 gerada:', s3Url);

    // Criar registro na tabela photos
    const { data: photoRecord, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: s3Url,
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

export const fetchSchools = async (): Promise<School[]> => {
  // First, fetch schools with their classes and students
  const { data: schoolsData, error: schoolsError } = await supabase
    .from('schools')
    .select(`
      *,
      classes:classes (
        *,
        students:students (*)
      )
    `);
  
  if (schoolsError) throw schoolsError;

  // Then, fetch all photos
  const { data: photosData, error: photosError } = await supabase
    .from('photos')
    .select('*');

  if (photosError) throw photosError;

  // Create a map of student IDs to their photos
  const studentPhotos = new Map();
  photosData?.forEach(photo => {
    if (!studentPhotos.has(photo.student_id)) {
      studentPhotos.set(photo.student_id, []);
    }
    // Convert Supabase URL to S3 URL if needed
    let photoUrl = photo.url;
    if (photoUrl.includes('supabase')) {
      const filename = photoUrl.split('/').pop();
      photoUrl = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    studentPhotos.get(photo.student_id).push(photoUrl);
  });

  // Transform the data to match our types
  const schools = schoolsData.map((school): School => ({
    id: school.id,
    name: school.name,
    created_at: school.created_at,
    classes: school.classes.map((cls): Class => ({
      id: cls.id,
      name: cls.name,
      school_id: cls.school_id,
      created_at: cls.created_at,
      students: cls.students.map((student): Student => ({
        id: student.id,
        name: student.name,
        access_code: student.access_code,
        class_id: student.class_id,
        created_at: student.created_at,
        photoUrl: studentPhotos.get(student.id)?.[0] // Get the first photo URL if it exists
      }))
    }))
  }));

  return schools;
};