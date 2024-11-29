import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Key } from "lucide-react";
import { toast } from "sonner";
import PhotoGallery from "@/components/PhotoGallery";
import { supabase } from "@/integrations/supabase/client";

const PhotoAccess = () => {
  const [accessCode, setAccessCode] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [studentName, setStudentName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find student by access code
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name')
        .eq('access_code', accessCode)
        .single();

      if (studentError || !student) {
        toast.error("Invalid access code");
        return;
      }

      // Get student's photos
      const { data: photoData, error: photosError } = await supabase
        .from('photos')
        .select('url')
        .eq('student_id', student.id);

      if (photosError) {
        toast.error("Failed to fetch photos");
        return;
      }

      setPhotos(photoData.map(p => p.url));
      setStudentName(student.name);
      setIsAuthenticated(true);
      toast.success("Access granted!");
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-8">
        <PhotoGallery photos={photos} studentName={studentName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Access Your Photos</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <button type="button" className="w-full p-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan QR Code
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-secondary text-muted-foreground">or enter code</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">
                Access Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your access code"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={!accessCode}
            >
              Access Photos
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PhotoAccess;