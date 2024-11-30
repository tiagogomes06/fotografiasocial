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
  const qrRef = useRef<SVGSVGElement>(null);
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

        // Get a random photo if available
        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          setRandomPhoto(data.photos[randomIndex].url);
        }
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  const downloadQRCode = () => {
    const svg = qrRef.current;
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match SVG
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;

    // Create a Blob from the SVG data
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });

    // Create an Image object to draw the SVG to canvas
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
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
      });
    };
    img.src = URL.createObjectURL(svgBlob);
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
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
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
          <QRCodeSVG ref={qrRef} value={qrValue} size={256} />
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