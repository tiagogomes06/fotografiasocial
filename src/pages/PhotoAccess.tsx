import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PhotoGallery from "@/components/PhotoGallery";

const PhotoAccess = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    photos?: string[],
    studentName?: string,
    studentId?: string,
    fromQR?: boolean,
    authenticated?: boolean
  };

  useEffect(() => {
    // Check if we have a stored access code
    const storedAccessCode = localStorage.getItem("accessCode");
    if (storedAccessCode && !state?.authenticated) {
      handleAccessCodeVerification(storedAccessCode);
    }
  }, []);

  const handleAccessCodeVerification = async (code: string) => {
    setIsLoading(true);
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
        return;
      }

      localStorage.setItem("studentId", student.id);
      localStorage.setItem("accessCode", code);

      const photoUrls = student.photos.map((photo: { url: string }) => {
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(photo.url.split('/').pop() || '');
        return publicUrl;
      });

      navigate("/", { 
        state: { 
          photos: photoUrls,
          studentName: student.name,
          studentId: student.id,
          authenticated: true
        },
        replace: true
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ocorreu um erro ao verificar o código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAccessCodeVerification(accessCode);
  };

  // If we have photos in the state and are authenticated, show the gallery
  if (state?.photos && state?.studentName && state?.authenticated) {
    return <PhotoGallery photos={state.photos} studentName={state.studentName} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <img
        src="https://fotografiaescolar.duploefeito.com/logo.jpg"
        alt="Duplo Efeito"
        className="w-32 h-auto mb-8"
      />
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Insira o código de acesso"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="text-center"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "A verificar..." : "Aceder às minhas fotos"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhotoAccess;