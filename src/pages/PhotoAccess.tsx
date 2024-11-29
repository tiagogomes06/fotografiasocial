import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Key } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PhotoGallery from "@/components/PhotoGallery";
import { supabase } from "@/integrations/supabase/client";

const PhotoAccess = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [studentName, setStudentName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name')
        .eq('access_code', accessCode)
        .single();

      if (studentError || !student) {
        toast.error("Código de acesso inválido");
        return;
      }

      const { data: photoData, error: photosError } = await supabase
        .from('photos')
        .select('url')
        .eq('student_id', student.id);

      if (photosError) {
        toast.error("Falha ao obter as fotos");
        return;
      }

      setPhotos(photoData.map(p => p.url));
      setStudentName(student.name);
      setIsAuthenticated(true);
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentName', student.name);
      toast.success("Acesso concedido!");
    } catch (error) {
      toast.error("Ocorreu um erro");
      console.error(error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <PhotoGallery photos={photos} studentName={studentName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto p-4 md:p-8 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Aceder às Suas Fotos</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <button 
            type="button" 
            className="w-full p-3 md:p-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <QrCode className="w-4 h-4 md:w-5 md:h-5" />
            Digitalizar Código QR
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-2 bg-secondary text-muted-foreground">ou introduza o código</span>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium block">
                Código de Acesso
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                  placeholder="Introduza o seu código de acesso"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full p-2.5 md:p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm md:text-base font-medium"
              disabled={!accessCode}
            >
              Aceder às Fotos
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PhotoAccess;