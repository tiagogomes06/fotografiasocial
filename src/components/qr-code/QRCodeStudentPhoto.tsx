import React, { useState } from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Failed to load QR code student photo:", photoUrl);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="w-32 h-32 mx-auto overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-sm text-gray-500 text-center px-2">
          Foto não disponível
        </span>
      </div>
    );
  }

  return (
    <div className="w-32 h-32 mx-auto overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
      <img 
        src={photoUrl} 
        alt={studentName}
        className="max-w-full max-h-full object-contain"
        crossOrigin="anonymous"
        loading="lazy"
        onError={handleImageError}
      />
    </div>
  );
};

export default QRCodeStudentPhoto;