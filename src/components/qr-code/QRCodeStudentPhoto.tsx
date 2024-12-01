import React from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  return (
    <div className="w-24 h-24 mx-auto overflow-hidden rounded-lg bg-gray-100">
      <img 
        src={photoUrl} 
        alt={studentName}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
        }}
      />
    </div>
  );
};

export default QRCodeStudentPhoto;