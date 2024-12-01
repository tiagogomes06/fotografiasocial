import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import QRCodeImage from "./QRCodeImage";
import QRCodeLogo from "./QRCodeLogo";
import QRCodeStudentInfo from "./QRCodeStudentInfo";
import QRCodeStudentPhoto from "./QRCodeStudentPhoto";

interface QRCodeContentProps {
  studentId: string;
  studentName: string;
  accessCode: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const QRCodeContent = ({ studentId, studentName, accessCode, containerRef }: QRCodeContentProps) => {
  const [schoolInfo, setSchoolInfo] = useState<{ schoolName: string; className: string }>();
  const [randomPhoto, setRandomPhoto] = useState<string>();
  // Use window.location.origin to get the current domain
  const baseUrl = window.location.origin;
  const qrValue = `${baseUrl}/access?code=${accessCode}`;

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          class_id,
          classes:classes (
            name,
            schools:schools (
              name
            )
          ),
          photos (url)
        `)
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('Error fetching student info:', error);
        return;
      }

      if (data) {
        setSchoolInfo({
          schoolName: data.classes.schools.name,
          className: data.classes.name
        });

        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          let photoUrl = data.photos[randomIndex].url;
          if (photoUrl.includes('supabase')) {
            const filename = photoUrl.split('/').pop();
            photoUrl = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
          }
          setRandomPhoto(photoUrl);
        }
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center p-8 space-y-6 bg-white"
      style={{ minWidth: '400px' }}
    >
      <QRCodeLogo />

      {schoolInfo && (
        <QRCodeStudentInfo
          schoolName={schoolInfo.schoolName}
          className={schoolInfo.className}
          studentName={studentName}
        />
      )}

      {randomPhoto && (
        <QRCodeStudentPhoto
          photoUrl={randomPhoto}
          studentName={studentName}
        />
      )}

      <QRCodeImage 
        qrValue={qrValue}
        containerRef={containerRef}
        studentName={studentName}
      />

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Código de Acesso</span>
          <span className="mx-2">:</span>
          <span>{accessCode}</span>
        </p>
        <div className="text-sm text-gray-600">
          <p className="font-medium">Site para</p>
          <p>acesso : {new URL(qrValue).host}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeContent;