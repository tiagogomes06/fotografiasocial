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

  // Remove duplicates from photos array and filter out any invalid URLs
  const uniquePhotos = [...new Set(photos.filter(Boolean))];

  const goToStore = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }

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