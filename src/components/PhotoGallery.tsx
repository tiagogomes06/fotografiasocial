import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PhotoCard from "./gallery/PhotoCard";
import GalleryHeader from "./gallery/GalleryHeader";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const schoolInfo = useSchoolInfo();

  // Ensure all photos are using S3 URLs
  const processedPhotos = photos.map(photo => {
    if (photo.includes('supabase')) {
      const filename = photo.split('/').pop();
      return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    return photo;
  });

  // Remove duplicates from photos array
  const uniquePhotos = [...new Set(processedPhotos)];

  const goToStore = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }
    // Pass the processed photos to maintain consistency
    navigate('/store', { 
      state: { 
        photos: uniquePhotos, 
        studentName, 
        studentId 
      },
      replace: true // Add replace: true to prevent navigation loop
    });
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