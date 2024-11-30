import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const code = searchParams.get("code");

  useEffect(() => {
    const verifyAccessCode = async () => {
      if (!code) {
        toast.error("Código de acesso não fornecido");
        navigate("/");
        return;
      }

      try {
        // Fetch student data including photos
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
          navigate("/");
          return;
        }

        // Store the student ID in localStorage
        localStorage.setItem("studentId", student.id);
        
        // Get photo URLs
        const photoUrls = student.photos.map((photo: { url: string }) => {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.url.split('/').pop() || '');
          return publicUrl;
        });

        // Redirect to photo gallery with the photos and student name
        navigate("/", { 
          state: { 
            photos: photoUrls,
            studentName: student.name,
            studentId: student.id,
            fromQR: true 
          } 
        });
      } catch (error) {
        console.error("Error verifying access code:", error);
        toast.error("Erro ao verificar código de acesso");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccessCode();
  }, [code, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img 
          src="https://fotografiaescolar.duploefeito.com/logo.jpg" 
          alt="Duplo Efeito" 
          className="w-32 h-auto mb-8"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
        />
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-4 text-gray-600">A verificar código de acesso...</p>
      </div>
    );
  }

  return null;
};

export default AccessPage;