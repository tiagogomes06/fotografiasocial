import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download, ShoppingBag, X } from "lucide-react";
import { downloadSinglePhoto, downloadAllPhotos } from "@/utils/downloadUtils";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "", className: "" });

  // Remove duplicates from photos array
  const uniquePhotos = [...new Set(photos)];

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) return;

      const { data, error } = await supabase
        .from('students')
        .select(`
          class:classes (
            name,
            school:schools (
              name
            )
          )
        `)
        .eq('id', studentId)
        .single();

      if (data) {
        setSchoolInfo({
          schoolName: data.class.school.name,
          className: data.class.name
        });
      }
    };

    fetchSchoolInfo();
  }, []);

  const handleSingleDownload = (photoUrl: string, index: number) => {
    downloadSinglePhoto(photoUrl, `${studentName}_foto_${index + 1}.jpg`);
  };

  const handleAllDownload = () => {
    downloadAllPhotos(uniquePhotos, studentName);
  };

  const goToStore = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }
    navigate('/store', { state: { photos: uniquePhotos, studentName, studentId } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{schoolInfo.schoolName}</span>
                {schoolInfo.schoolName && schoolInfo.className && (
                  <>
                    <span>•</span>
                    <span>{schoolInfo.className}</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {studentName}
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <Button 
                onClick={handleAllDownload} 
                variant="outline" 
                className="w-full sm:w-auto hover:bg-gray-100"
              >
                <Download className="mr-2 h-4 w-4" />
                Transferir Todas
              </Button>
              <Button 
                onClick={goToStore} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ir para a Loja
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniquePhotos.map((photo, index) => (
          <Card 
            key={photo} 
            className="group overflow-hidden bg-white/95 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <CardContent className="p-4 space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-auto p-0 overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center bg-black/50">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                    <Button
                      onClick={() => {
                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                        if (closeButton) closeButton.click();
                      }}
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="secondary"
                onClick={() => handleSingleDownload(photo, index)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Transferir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;