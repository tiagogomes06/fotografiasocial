import { Download, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface GalleryHeaderProps {
  schoolInfo: {
    schoolName: string;
    className: string;
  };
  studentName: string;
  onDownloadAll: () => void;
  onGoToStore: () => void;
}

const GalleryHeader = ({ schoolInfo, studentName, onDownloadAll, onGoToStore }: GalleryHeaderProps) => {
  return (
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
              onClick={onDownloadAll} 
              variant="outline" 
              className="w-full sm:w-auto hover:bg-gray-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Transferir Todas
            </Button>
            <Button 
              onClick={onGoToStore} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ir para a Loja
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryHeader;