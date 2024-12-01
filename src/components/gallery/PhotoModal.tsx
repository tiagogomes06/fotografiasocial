import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogContent, DialogClose } from "../ui/dialog";
import { toast } from "sonner";

interface PhotoModalProps {
  photo: string;
  index: number;
}

const PhotoModal = ({ photo, index }: PhotoModalProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error("Falha ao carregar imagem no modal:", {
      url: photo,
      error: "Imagem não carregou",
      timestamp: new Date().toISOString()
    });
    setImageError(true);
    toast.error("Não foi possível carregar a imagem em tamanho grande");
  };

  const handleImageLoad = () => {
    console.log("Imagem do modal carregada com sucesso:", {
      url: photo,
      timestamp: new Date().toISOString()
    });
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <DialogContent className="max-w-[95vw] w-auto p-0 bg-transparent border-none">
        <div className="relative w-full h-[90vh] flex items-center justify-center bg-black/80">
          <span className="text-white">Imagem não disponível</span>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-[95vw] w-auto p-0 bg-transparent border-none">
      <div className="relative w-full h-[90vh] flex items-center justify-center bg-black/80">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        <img
          src={photo}
          alt={`Foto ${index + 1}`}
          className={`h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain select-none transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
          crossOrigin="anonymous"
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

export default PhotoModal;