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
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      // Convert the file to base64 for now (in a real app, you'd upload to a server)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onPhotoUploaded(base64String);
        toast.success('Photo uploaded successfully');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload photo');
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-1" />
          Upload Photo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photo for {studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentPhotoUpload;