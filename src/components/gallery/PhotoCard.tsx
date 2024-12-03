import { useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import PhotoModal from "./PhotoModal";
import RetryImage from "../RetryImage";

interface PhotoCardProps {
  photo: string;
  index: number;
}

const PhotoCard = ({ photo, index }: PhotoCardProps) => {
  const [imageError, setImageError] = useState(false);

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
            <div className="cursor-pointer aspect-square rounded-lg overflow-hidden">
              <RetryImage
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                crossOrigin="anonymous"
                loading="eager"
                onLoadError={() => setImageError(true)}
                maxRetries={10}
                retryDelay={500}
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