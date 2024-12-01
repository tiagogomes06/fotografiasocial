import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PhotoCard from "./gallery/PhotoCard";
import GalleryHeader from "./gallery/GalleryHeader";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const [schoolInfo, setSchoolInfo] = useState({ schoolName: "", className: "" });

  // Ensure all photos are using S3 URLs
  const processedPhotos = photos.map(photo => {
    if (photo.includes('supabase')) {
      // Extract filename from Supabase URL
      const filename = photo.split('/').pop();
      // Construct S3 URL
      return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    return photo;
  });

  // Remove duplicates from photos array
  const uniquePhotos = [...new Set(processedPhotos)];

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) return;

        // First, get the class_id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('class_id')
          .eq('id', studentId)
          .single();

        if (studentError) {
          console.error('Error fetching student:', studentError);
          return;
        }

        if (!studentData?.class_id) return;

        // Then, get the class and school info
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select(`
            name,
            schools!inner (
              name
            )
          `)
          .eq('id', studentData.class_id)
          .single();

        if (classError) {
          console.error('Error fetching class:', classError);
          return;
        }

        if (classData) {
          setSchoolInfo({
            schoolName: classData.schools.name,
            className: classData.name
          });
        }
      } catch (error) {
        console.error('Error in fetchSchoolInfo:', error);
      }
    };

    fetchSchoolInfo();
  }, []);

  const goToStore = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }
    navigate('/store', { state: { photos: uniquePhotos, studentName, studentId } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GalleryHeader
        schoolInfo={schoolInfo}
        studentName={studentName}
        onGoToStore={goToStore}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniquePhotos.map((photo, index) => (
          <PhotoCard
            key={photo}
            photo={photo}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;