import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import html2canvas from "html2canvas";

interface QRCodeImageProps {
  qrValue: string;
  containerRef: React.RefObject<HTMLDivElement>;
  studentName: string;
}

const QRCodeImage = ({ qrValue, containerRef, studentName }: QRCodeImageProps) => {
  useEffect(() => {
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
            const images = clonedDoc.getElementsByTagName('img');
            for (let img of images) {
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

    generateQRCodePNG();
  }, [containerRef, studentName]);

  return <QRCodeSVG value={qrValue} size={256} />;
};

export default QRCodeImage;