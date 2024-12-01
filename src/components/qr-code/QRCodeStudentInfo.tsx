import React from "react";

interface QRCodeStudentInfoProps {
  schoolName: string;
  className: string;
  studentName: string;
}

const QRCodeStudentInfo = ({ schoolName, className, studentName }: QRCodeStudentInfoProps) => {
  return (
    <div className="text-center space-y-1">
      <p className="font-semibold text-lg">{schoolName}</p>
      <p className="text-base">{className}</p>
      <p className="text-base font-medium">{studentName}</p>
    </div>
  );
};

export default QRCodeStudentInfo;