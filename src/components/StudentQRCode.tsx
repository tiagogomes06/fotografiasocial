import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface StudentQRCodeProps {
  accessCode: string;
  studentName: string;
}

const StudentQRCode = ({ accessCode, studentName }: StudentQRCodeProps) => {
  const qrValue = `${window.location.origin}/access?code=${accessCode}`;

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
          <QRCodeSVG value={qrValue} size={256} />
          <p className="mt-4 text-sm text-muted-foreground">Access Code: {accessCode}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCode;