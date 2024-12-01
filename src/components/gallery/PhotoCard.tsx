import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogTrigger } from "../ui/dialog";
import PhotoModal from "./PhotoModal";

interface PhotoCardProps {
  photo: string;
  index: number;
  onDownload: (photo: string, index: number) => void;
}

const PhotoCard = ({ photo, index, onDownload }: PhotoCardProps) => {
  return (
    <Card className="group overflow-hidden bg-white/95 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300 rounded-xl">
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
          <PhotoModal photo={photo} index={index} />
        </Dialog>
        
        <Button
          variant="secondary"
          onClick={() => onDownload(photo, index)}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Transferir
        </Button>
      </CardContent>
    </Card>
  );
};

export default PhotoCard;