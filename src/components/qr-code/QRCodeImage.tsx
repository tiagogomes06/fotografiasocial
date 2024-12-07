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
        // Pre-load all images before capturing
        const images = container.getElementsByTagName('img');
        await Promise.all(
          Array.from(images).map((img) => {
            return new Promise((resolve) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
              img.crossOrigin = "anonymous";
            });
          })
        );

        // Add a small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const canvas = await html2canvas(container, {
          backgroundColor: "white",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: function(clonedDoc) {
            const clonedImages = clonedDoc.getElementsByTagName('img');
            for (let img of clonedImages) {
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

  return (
    <div className="w-64 h-64 flex items-center justify-center">
      <QRCodeSVG value={qrValue} size={256} />
    </div>
  );
};

export default QRCodeImage;