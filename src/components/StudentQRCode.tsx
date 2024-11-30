import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";

interface StudentQRCodeProps {
  accessCode: string;
  studentName: string;
  studentId: string;
}

const StudentQRCode = ({ accessCode, studentName, studentId }: StudentQRCodeProps) => {
  const qrValue = `${window.location.origin}/access?code=${accessCode}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [schoolInfo, setSchoolInfo] = useState<{ schoolName: string; className: string }>();
  const [randomPhoto, setRandomPhoto] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleClick = async () => {
    setIsOpen(true);
    setTimeout(generateQRCodePNG, 500);
  };

  const generateQRCodePNG = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: "white",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: function(clonedDoc) {
          const img = clonedDoc.querySelector('img');
          if (img) {
            img.crossOrigin = "anonymous";
          }
        }
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode-${studentName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleClick}>
          <QrCode className="h-4 w-4 mr-1" />
          Código QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR para {studentName}</DialogTitle>
        </DialogHeader>
        <div 
          ref={containerRef}
          className="flex flex-col items-center justify-center p-6 space-y-4 bg-white"
        >
          <img 
            src="https://fotografiaescolar.duploefeito.com/logo.jpg"
            alt="Duplo Efeito" 
            className="w-32 h-auto mb-4"
            crossOrigin="anonymous"
          />

          {schoolInfo && (
            <div className="text-center space-y-1">
              <p className="font-semibold">{schoolInfo.schoolName}</p>
              <p>{schoolInfo.className}</p>
              <p>{studentName}</p>
            </div>
          )}

          {randomPhoto && (
            <img 
              src={randomPhoto} 
              alt={studentName}
              className="w-32 h-32 object-cover rounded-lg"
              crossOrigin="anonymous"
            />
          )}

          <QRCodeSVG value={qrValue} size={256} />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Código de Acesso: {accessCode}</p>
            <p className="text-sm text-muted-foreground">Site para acesso: fotografiaescolar.duploefeito.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCode;