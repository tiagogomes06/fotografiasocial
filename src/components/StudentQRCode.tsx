import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          setRandomPhoto(data.photos[randomIndex].url);
        }
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  const downloadQRCode = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      // Create a canvas with the same dimensions as the container
      const canvas = document.createElement("canvas");
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert the container to a data URL using html2canvas
      const html2canvas = (await import("html2canvas")).default;
      const canvasImage = await html2canvas(container, {
        backgroundColor: "white",
        scale: 2, // Higher quality
      });

      // Create download link
      canvasImage.toBlob((blob) => {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="Duplo Efeito" 
            className="w-32 h-auto mb-4"
          />

          {/* School and Class Info */}
          {schoolInfo && (
            <div className="text-center space-y-1">
              <p className="font-semibold">{schoolInfo.schoolName}</p>
              <p>{schoolInfo.className}</p>
              <p>{studentName}</p>
            </div>
          )}

          {/* Random Photo */}
          {randomPhoto && (
            <img 
              src={randomPhoto} 
              alt={studentName}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}

          {/* QR Code */}
          <QRCodeSVG value={qrValue} size={256} />
          <p className="mt-2 text-sm text-muted-foreground">Código de Acesso: {accessCode}</p>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={downloadQRCode}
          >
            <Download className="h-4 w-4 mr-1" />
            Descarregar Código QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCode;