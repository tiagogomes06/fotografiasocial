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
        // Pre-load the logo image before capturing
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = "/logo.jpg";

        // Wait for logo to load and a bit extra time for other elements
        await new Promise((resolve) => {
          logoImg.onload = () => setTimeout(resolve, 500);
          logoImg.onerror = () => resolve(null);
        });
        
        const canvas = await html2canvas(container, {
          backgroundColor: "white",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: function(clonedDoc) {
            const images = clonedDoc.getElementsByTagName('img');
            for (let img of images) {
              img.crossOrigin = "anonymous";
              img.style.display = 'block';
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