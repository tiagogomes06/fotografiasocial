import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoreHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const StoreHeader = ({ cartItemCount, onCartClick }: StoreHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="gap-2 hover:bg-secondary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>
      {cartItemCount > 0 && (
        <Button 
          onClick={onCartClick}
          className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 animate-fade-in"
        >
          Ver Carrinho ({cartItemCount})
        </Button>
      )}
    </div>
  );
};

export default StoreHeader;