import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadPhoto } from "@/utils/supabaseHelpers";

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

        const photo = await uploadPhoto(file, studentId);
        onPhotoUploaded(photo.url);
        toast.success(`Photo ${file.name} uploaded successfully`);
      }
    } catch (error) {
      toast.error('Failed to upload photos');
      console.error(error);
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