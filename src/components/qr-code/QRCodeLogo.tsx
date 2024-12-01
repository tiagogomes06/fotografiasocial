import React from "react";

const QRCodeLogo = () => {
  return (
    <img 
      src="https://fotografiaescolar.duploefeito.com/logo.jpg"
      alt="Duplo Efeito" 
      className="w-32 h-auto mb-4"
      crossOrigin="anonymous"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = 'none';
      }}
    />
  );
};

export default QRCodeLogo;