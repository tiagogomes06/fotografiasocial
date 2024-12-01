import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import QRCodeImage from "./QRCodeImage";

interface QRCodeContentProps {
  studentId: string;
  studentName: string;
  accessCode: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const QRCodeContent = ({ studentId, studentName, accessCode, containerRef }: QRCodeContentProps) => {
  const [schoolInfo, setSchoolInfo] = useState<{ schoolName: string; className: string }>();
  const [randomPhoto, setRandomPhoto] = useState<string>();
  const qrValue = `https://fotografiasocial.duploefeito.com/access?code=${accessCode}`;

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
          const photoUrl = data.photos[randomIndex].url;
          const { data: publicUrl } = supabase.storage
            .from('photos')
            .getPublicUrl(photoUrl.split('/').pop() || '');
          setRandomPhoto(publicUrl.publicUrl);
        }
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center p-6 space-y-4 bg-white"
      style={{ minWidth: '400px' }}
    >
      <img 
        src="https://fotografiasocial.duploefeito.com/logo.jpg"
        alt="Duplo Efeito" 
        className="w-32 h-auto mb-4"
        crossOrigin="anonymous"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
        }}
      />

      {schoolInfo && (
        <div className="text-center space-y-1">
          <p className="font-semibold text-lg">{schoolInfo.schoolName}</p>
          <p className="text-base">{schoolInfo.className}</p>
          <p className="text-base font-medium">{studentName}</p>
        </div>
      )}

      {randomPhoto && (
        <img 
          src={randomPhoto} 
          alt={studentName}
          className="w-32 h-32 object-cover rounded-lg"
          crossOrigin="anonymous"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
        />
      )}

      <QRCodeImage 
        qrValue={qrValue}
        containerRef={containerRef}
        studentName={studentName}
      />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Código de Acesso: {accessCode}</p>
        <p className="text-sm text-muted-foreground">Site para acesso: fotografiasocial.duploefeito.com</p>
      </div>
    </div>
  );
};

export default QRCodeContent;