import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadPhoto } from "@/utils/supabaseHelpers";
import { Progress } from "@/components/ui/progress";
import imageCompression from "browser-image-compression";

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

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: (progress: number) => {
        console.log('Compressão:', Math.round(progress * 100) + '%');
        setUploadProgress(Math.round(progress * 50)); // Use metade da barra para compressão
      }
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Compressão concluída:', {
        originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
        filename: file.name
      });
      return compressedFile;
    } catch (error) {
      console.error("Erro na compressão:", error);
      return file;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      let completedFiles = 0;

      // Processar arquivos em lotes de 3
      const batchSize = 3;
      for (let i = 0; i < fileArray.length; i += batchSize) {
        const batch = fileArray.slice(i, i + batchSize);
        
        const uploadPromises = batch.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            toast.error(`O arquivo ${file.name} não é uma imagem válida`);
            return null;
          }

          setCurrentFile(file.name);
          
          // Comprimir imagem antes do upload
          const compressedFile = await compressImage(file);
          
          // Upload da imagem comprimida
          const photo = await uploadPhoto(compressedFile, studentId);
          completedFiles++;
          
          // Atualizar progresso (50-100% para uploads)
          setUploadProgress(50 + ((completedFiles / totalFiles) * 50));
          
          return photo;
        });

        const results = await Promise.all(uploadPromises);
        
        // Notificar uploads bem sucedidos
        results.filter(Boolean).forEach(photo => {
          if (photo) {
            onPhotoUploaded(photo.url);
            toast.success(`Fotografia ${currentFile} carregada com sucesso`);
          }
        });
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(`Falha ao carregar fotografias: ${error.message}`);
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
                {uploadProgress <= 50 ? 'Comprimindo...' : 'Carregando...'} {Math.round(uploadProgress)}%
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
            As imagens serão automaticamente otimizadas para melhor performance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUpload;