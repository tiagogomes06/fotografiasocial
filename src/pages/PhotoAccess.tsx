import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Key } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PhotoGallery from "@/components/PhotoGallery";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PhotoAccess = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [studentName, setStudentName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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

      // Remove duplicate photos by creating a Set of unique URLs
      const uniquePhotos = Array.from(new Set(photoData.map(p => p.url)));
      
      setPhotos(uniquePhotos);
      setStudentName(student.name);
      setIsAuthenticated(true);
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentName', student.name);
      toast.success("Acesso concedido!");
    } catch (error) {
      toast.error("Ocorreu um erro");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
        <PhotoGallery photos={photos} studentName={studentName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center space-y-6 mb-8">
              <img 
                src="/lovable-uploads/aaa9f8e2-a81a-4911-817f-ef93b5c9f663.png" 
                alt="Duplo Efeito Fotografia" 
                className="w-48 mb-2"
              />
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Acesso às Fotos Escolares
                </h1>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Digite o código único fornecido para acessar as fotos escolares do aluno.
                </p>
                <p className="text-sm text-gray-500">
                  Ex: tiago2 ou 6732c05aa1690
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium text-gray-700 block">
                  Código
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-10 h-12"
                    placeholder="Digite seu código de acesso"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit"
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                  disabled={!accessCode || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Carregando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Acessar Fotos
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-12 border-gray-300"
                  disabled={isLoading}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Digitalizar QR Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PhotoAccess;