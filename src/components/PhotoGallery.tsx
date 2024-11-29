import { useState } from "react";
import { Button } from "./ui/button";
import { Download, ShoppingBag, X } from "lucide-react";
import { downloadSinglePhoto, downloadAllPhotos } from "@/utils/downloadUtils";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleSingleDownload = (photoUrl: string, index: number) => {
    downloadSinglePhoto(photoUrl, `${studentName}_foto_${index + 1}.jpg`);
  };

  const handleAllDownload = () => {
    downloadAllPhotos(photos, studentName);
  };

  const goToStore = () => {
    navigate('/store', { state: { photos, studentName } });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Fotos de {studentName}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAllDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Transferir Todas
          </Button>
          <Button onClick={goToStore} className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ir para a Loja
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer aspect-square">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg hover:opacity-95 transition-opacity"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-auto max-h-[90vh] p-0">
                <div className="relative group">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                      if (closeButton) closeButton.click();
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSingleDownload(photo, index)}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Transferir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;