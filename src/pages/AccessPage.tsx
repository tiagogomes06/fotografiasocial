import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    const verifyAccessCode = async () => {
      if (!code) {
        toast.error("Código de acesso inválido");
        navigate("/");
        return;
      }

      try {
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

        // Store authentication data
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("accessCode", code);
        localStorage.setItem("isAuthenticated", "true");
        
        // Get photo URLs
        const photoUrls = student.photos.map((photo: { url: string }) => {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.url.split('/').pop() || '');
          return publicUrl;
        });

        // Redirect to photo gallery with authentication state
        navigate("/", { 
          state: { 
            photos: photoUrls,
            studentName: student.name,
            studentId: student.id,
            fromQR: true,
            authenticated: true
          },
          replace: true
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Ocorreu um erro ao verificar o código");
        navigate("/");
      }
    };

    verifyAccessCode();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <img
        src="/logo.jpg"
        alt="Duplo Efeito"
        className="w-32 h-auto mb-8"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
        }}
      />
      <div className="text-center">
        <p>A verificar código de acesso...</p>
      </div>
    </div>
  );
};

export default AccessPage;