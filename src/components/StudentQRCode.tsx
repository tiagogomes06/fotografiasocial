import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { useRef } from "react";

interface StudentQRCodeProps {
  accessCode: string;
  studentName: string;
}

const StudentQRCode = ({ accessCode, studentName }: StudentQRCodeProps) => {
  const qrValue = `${window.location.origin}/access?code=${accessCode}`;
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQRCode = () => {
    const svg = qrRef.current;
    if (!svg) return;

    // Create a canvas element
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
      
      // Convert canvas to blob and download
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
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {studentName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <QRCodeSVG ref={qrRef} value={qrValue} size={256} />
          <p className="mt-4 text-sm text-muted-foreground">Access Code: {accessCode}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={downloadQRCode}
          >
            <Download className="h-4 w-4 mr-1" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCode;