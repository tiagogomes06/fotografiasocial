import React, { useState } from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Failed to load QR code student photo:", {
      url: photoUrl,
      error: "Image failed to load",
      studentName: studentName,
      timestamp: new Date().toISOString()
    });
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="w-32 h-32 mx-auto overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-sm text-gray-500 text-center px-2">
          Foto não disponível. Por favor, tente novamente mais tarde.
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
        onLoad={() => {
          console.log("Successfully loaded student photo:", {
            url: photoUrl,
            studentName: studentName,
            timestamp: new Date().toISOString()
          });
        }}
      />
    </div>
  );
};

export default QRCodeStudentPhoto;