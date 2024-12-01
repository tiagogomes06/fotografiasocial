import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogContent, DialogClose } from "../ui/dialog";

interface PhotoModalProps {
  photo: string;
  index: number;
}

const PhotoModal = ({ photo, index }: PhotoModalProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Failed to load modal image:", photo);
    setImageError(true);
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
        <img
          src={photo}
          alt={`Foto ${index + 1}`}
          className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain select-none"
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
          crossOrigin="anonymous"
          loading="lazy"
          onError={handleImageError}
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