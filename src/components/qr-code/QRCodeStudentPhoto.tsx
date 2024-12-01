import React, { useState } from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null;
  }

  return (
    <div className="w-32 h-32 mx-auto overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
      <img 
        src={photoUrl} 
        alt={studentName}
        className="max-w-full max-h-full object-contain"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("Error loading image:", e);
          setImageError(true);
        }}
      />
    </div>
  );
};

export default QRCodeStudentPhoto;