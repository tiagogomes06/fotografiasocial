import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { useRef, useState } from "react";
import QRCodeContent from "./qr-code/QRCodeContent";

interface StudentQRCodeProps {
  accessCode: string;
  studentName: string;
  studentId: string;
}

const StudentQRCode = ({ accessCode, studentName, studentId }: StudentQRCodeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <QrCode className="h-4 w-4 mr-1" />
          Código QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR para {studentName}</DialogTitle>
        </DialogHeader>
        <QRCodeContent
          studentId={studentId}
          studentName={studentName}
          accessCode={accessCode}
          containerRef={containerRef}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCode;