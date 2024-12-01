import React from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  return (
    <img 
      src={photoUrl} 
      alt={studentName}
      className="w-32 h-32 object-cover rounded-lg"
      crossOrigin="anonymous"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = 'none';
      }}
    />
  );
};

export default QRCodeStudentPhoto;