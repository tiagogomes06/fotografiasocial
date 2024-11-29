import { useState } from "react";
import { Button } from "./ui/button";
import { Download, ShoppingBag } from "lucide-react";
import { downloadSinglePhoto, downloadAllPhotos } from "@/utils/downloadUtils";
import { useNavigate } from "react-router-dom";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleSingleDownload = (photoUrl: string, index: number) => {
    downloadSinglePhoto(photoUrl, `${studentName}_photo_${index + 1}.jpg`);
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
        <h2 className="text-xl md:text-2xl font-bold">Photos for {studentName}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAllDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          <Button onClick={goToStore} className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Go to Store
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSingleDownload(photo, index)}
                className="w-36"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;