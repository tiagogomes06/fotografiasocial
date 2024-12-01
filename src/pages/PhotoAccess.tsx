import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PhotoGallery from "@/components/PhotoGallery";
import { motion } from "framer-motion";

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
    const checkAuthentication = async () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const storedAccessCode = localStorage.getItem("accessCode");
      
      if (isAuthenticated === "true" && storedAccessCode && !state?.authenticated) {
        await handleAccessCodeVerification(storedAccessCode);
      }
    };

    checkAuthentication();
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
        localStorage.removeItem("isAuthenticated");
        return;
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
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAccessCodeVerification(accessCode);
  };

  if (state?.photos && state?.studentName && state?.authenticated) {
    return <PhotoGallery photos={state.photos} studentName={state.studentName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full h-screen px-4 py-12 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <img
            src="https://fotografiaescolar.duploefeito.com/logo.jpg"
            alt="Duplo Efeito"
            className="w-32 h-auto mb-4 mx-auto"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo(a)!</h1>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Aceda às suas fotografias escolares usando o código fornecido.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="access-code" className="text-sm font-medium text-gray-700">
                  Código de Acesso
                </label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Insira o código de acesso"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="text-center"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "A verificar..." : "Aceder às minhas fotos"}
              </Button>
            </form>
          </div>
        </motion.div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Duplo Efeito Fotografia © {new Date().getFullYear()}</p>
          <p className="mt-1">
            <a href="mailto:pedidos@duploefeito.com" className="hover:text-primary">
              pedidos@duploefeito.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PhotoAccess;