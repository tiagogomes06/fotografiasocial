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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = files.length;
      let completedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`O ficheiro ${file.name} não é uma imagem`);
          continue;
        }

        const photo = await uploadPhoto(file, studentId);
        await onPhotoUploaded(photo.url);
        completedFiles++;
        setUploadProgress((completedFiles / totalFiles) * 100);
        toast.success(`Fotografia ${file.name} carregada com sucesso`);
      }

      setIsOpen(false);
    } catch (error) {
      toast.error('Falha ao carregar fotografias');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
                A carregar... {Math.round(uploadProgress)}%
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