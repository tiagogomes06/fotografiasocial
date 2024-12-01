import React from "react";

const QRCodeLogo = () => {
  return (
    <div className="flex justify-center w-full mb-4">
      <img 
        src="/logo.jpg"
        alt="Duplo Efeito" 
        className="h-16 w-auto"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
        }}
      />
    </div>
  );
};

export default QRCodeLogo;