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

  // Ensure all photos are using S3 URLs and are valid
  const processedPhotos = photos
    .filter(Boolean) // Remove any null/undefined values
    .map(photo => {
      try {
        // If it's already an S3 URL, return it
        if (photo.includes('amazonaws.com')) {
          return photo;
        }
        
        // If it's a Supabase URL or just a filename, extract the filename
        const filename = photo.includes('supabase') 
          ? photo.split('/').pop()
          : photo.includes('/') 
            ? photo.split('/').pop() 
            : photo;

        if (!filename) {
          console.error('Invalid photo URL:', photo);
          return null;
        }

        // Construct S3 URL
        return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
      } catch (error) {
        console.error('Error processing photo URL:', photo, error);
        return null;
      }
    })
    .filter(Boolean) as string[]; // Remove any null values after processing

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
      replace: true
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