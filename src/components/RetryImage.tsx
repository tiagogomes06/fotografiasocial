import { useState, useEffect } from "react";
import { toast } from "sonner";

interface RetryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  maxRetries?: number;
  retryDelay?: number;
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

const RetryImage = ({
  src,
  alt,
  className,
  maxRetries = 3,
  retryDelay = 2000,
  onLoadSuccess,
  onLoadError,
  ...props
}: RetryImageProps) => {
  const [retries, setRetries] = useState(0);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRetries(0);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    console.error(`Erro ao carregar imagem (tentativa ${retries + 1}/${maxRetries}):`, {
      src,
      timestamp: new Date().toISOString()
    });

    if (retries < maxRetries) {
      setTimeout(() => {
        setRetries(prev => prev + 1);
        setError(false);
      }, retryDelay);
    } else {
      setError(true);
      onLoadError?.();
      toast.error("Não foi possível carregar a imagem após várias tentativas");
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    onLoadSuccess?.();
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center p-4">
        Não foi possível carregar esta imagem
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default RetryImage;