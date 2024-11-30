import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera, ArrowRight } from "lucide-react";
import PhotoGallery from "@/components/PhotoGallery";

const PhotoAccess = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [studentName, setStudentName] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("Por favor, insira o código de acesso");
      return;
    }

    setIsLoading(true);
    try {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, name, class_id")
        .eq("access_code", accessCode.trim())
        .single();

      if (studentError || !student) {
        toast.error("Código de acesso inválido");
        return;
      }

      const { data: photos, error: photosError } = await supabase
        .from("photos")
        .select("url")
        .eq("student_id", student.id);

      if (photosError) {
        toast.error("Erro ao carregar as fotos");
        return;
      }

      if (!photos.length) {
        toast.error("Ainda não existem fotos disponíveis");
        return;
      }

      localStorage.setItem("studentId", student.id);
      setPhotos(photos.map((p) => p.url));
      setStudentName(student.name);
      setShowGallery(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ocorreu um erro ao processar o pedido");
    } finally {
      setIsLoading(false);
    }
  };

  if (showGallery && photos.length > 0) {
    return <PhotoGallery photos={photos} studentName={studentName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 shadow-xl border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Bem-vindo(a)
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Insira o seu código de acesso para ver as suas fotografias
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700">
                Código de Acesso
              </Label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-primary focus:ring-primary"
                placeholder="Digite seu código aqui"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Ver Minhas Fotos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoAccess;