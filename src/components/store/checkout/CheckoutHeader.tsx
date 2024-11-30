import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CheckoutHeaderProps {
  onBack: () => void;
  isProcessing: boolean;
}

const CheckoutHeader = ({ onBack, isProcessing }: CheckoutHeaderProps) => {
  return (
    <div className="flex items-center gap-4 pb-4 border-b">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onBack}
        className="gap-2 hover:bg-white/50"
        disabled={isProcessing}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Carrinho
      </Button>
      <h1 className="text-xl md:text-2xl font-bold">Finalizar Compra</h1>
    </div>
  );
};

export default CheckoutHeader;