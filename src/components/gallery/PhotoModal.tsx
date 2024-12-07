import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogContent, DialogClose } from "../ui/dialog";
import RetryImage from "../RetryImage";

interface PhotoModalProps {
  photo: string;
  index: number;
}

const PhotoModal = ({ photo, index }: PhotoModalProps) => {
  const [imageError, setImageError] = useState(false);

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
        <div className="relative h-full w-full flex items-center justify-center">
          <RetryImage
            src={photo}
            alt={`Foto ${index + 1}`}
            className="max-h-[90vh] w-auto max-w-[95vw] object-contain select-none"
            style={{ margin: 0 }}
            onContextMenu={(e) => e.preventDefault()}
            draggable="false"
            crossOrigin="anonymous"
            loading="eager"
            onLoadError={() => setImageError(true)}
            maxRetries={10}
            retryDelay={500}
          />
        </div>
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