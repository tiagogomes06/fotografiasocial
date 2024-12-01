import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const verifyAccessCode = async (code: string) => {
  const { data: student, error } = await supabase
    .from("students")
    .select(`
      id,
      name,
      photos (
        url
      )
    `)
    .eq("access_code", code)
    .single();

  if (error || !student) {
    toast.error("Código de acesso inválido");
    localStorage.removeItem("isAuthenticated");
    throw new Error("Invalid access code");
  }

  localStorage.setItem("studentId", student.id);
  localStorage.setItem("accessCode", code);
  localStorage.setItem("isAuthenticated", "true");

  const photoUrls = student.photos.map((photo: { url: string }) => {
    if (photo.url.includes('supabase')) {
      const filename = photo.url.split('/').pop();
      return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    return photo.url;
  });

  return {
    success: true,
    photos: photoUrls,
    studentName: student.name,
    studentId: student.id
  };
};