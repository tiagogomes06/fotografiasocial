import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  onPhotoUploaded: (photoUrl: string) => void;
}

const StudentPhotoUpload = ({ studentId, studentName, onPhotoUploaded }: StudentPhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        // Convert the file to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          onPhotoUploaded(base64String);
          toast.success(`Photo ${file.name} uploaded successfully`);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-1" />
          Upload Photos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photos for {studentName}</DialogTitle>
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
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, GIF. You can select multiple photos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUpload;