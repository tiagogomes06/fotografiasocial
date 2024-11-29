import { supabase } from "@/integrations/supabase/client";
import { School, Class, Student } from "@/types/admin";

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
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);

  // Create photo record
  const { data, error } = await supabase
    .from('photos')
    .insert({ url: publicUrl, student_id: studentId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchSchools = async (): Promise<School[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      classes:classes (
        *,
        students:students (*)
      )
    `);
  
  if (error) throw error;
  
  // Transform the data to match our types
  const schools = data.map((school): School => ({
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
        created_at: student.created_at
      }))
    }))
  }));

  return schools;
};