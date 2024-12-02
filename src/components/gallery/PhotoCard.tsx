import { useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import PhotoModal from "./PhotoModal";
import { toast } from "sonner";

interface PhotoCardProps {
  photo: string;
  index: number;
}

const PhotoCard = ({ photo, index }: PhotoCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error("Falha ao carregar imagem:", {
      url: photo,
      error: "Imagem não carregou",
      timestamp: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    });
    setImageError(true);
    toast.error("Não foi possível carregar uma imagem. Por favor, atualize a página.");
  };

  const handleImageLoad = () => {
    console.log("Imagem carregada com sucesso:", {
      url: photo,
      timestamp: new Date().toISOString(),
      userAgent: window.navigator.userAgent
    });
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <Card className="group overflow-hidden bg-white/95 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300 rounded-xl">
        <CardContent className="p-4 space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-500 text-center px-2">
              Não foi possível carregar esta imagem
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden bg-white/95 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300 rounded-xl">
      <CardContent className="p-4 space-y-3">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer aspect-square rounded-lg overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                crossOrigin="anonymous"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          </DialogTrigger>
          <PhotoModal photo={photo} index={index} />
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PhotoCard;