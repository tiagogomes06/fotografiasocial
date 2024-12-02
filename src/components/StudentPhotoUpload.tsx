import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadPhoto } from "@/utils/supabaseHelpers";
import { Progress } from "@/components/ui/progress";

interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  onPhotoUploaded: (photoUrl: string) => void;
}

const StudentPhotoUpload = ({ studentId, studentName, onPhotoUploaded }: StudentPhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      let completedFiles = 0;

      // Process files in batches of 3
      const batchSize = 3;
      for (let i = 0; i < fileArray.length; i += batchSize) {
        const batch = fileArray.slice(i, i + batchSize);
        
        const uploadPromises = batch.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            toast.error(`O arquivo ${file.name} não é uma imagem válida`);
            return null;
          }

          setCurrentFile(file.name);
          
          const photo = await uploadPhoto(file, studentId);
          completedFiles++;
          setUploadProgress((completedFiles / totalFiles) * 100);
          
          return photo;
        });

        const results = await Promise.all(uploadPromises);
        
        results.filter(Boolean).forEach(photo => {
          if (photo) {
            onPhotoUploaded(photo.url);
            toast.success(`Fotografia ${currentFile} carregada com sucesso`);
          }
        });
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFile("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-1" />
          Carregar Fotografias
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carregar Fotografias para {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full"
          />
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Carregando... {Math.round(uploadProgress)}%
                {currentFile && (
                  <span className="block text-xs">
                    Processando: {currentFile}
                  </span>
                )}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Formatos suportados: JPG, PNG, GIF. Pode selecionar várias fotografias.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUpload;