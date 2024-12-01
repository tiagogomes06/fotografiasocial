import React from "react";

interface QRCodeStudentPhotoProps {
  photoUrl: string;
  studentName: string;
}

const QRCodeStudentPhoto = ({ photoUrl, studentName }: QRCodeStudentPhotoProps) => {
  return (
    <div className="w-32 h-32 overflow-hidden rounded-lg">
      <img 
        src={photoUrl} 
        alt={studentName}
        className="w-full h-full object-contain bg-gray-100"
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