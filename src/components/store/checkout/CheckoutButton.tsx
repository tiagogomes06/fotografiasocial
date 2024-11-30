import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  isProcessing: boolean;
}

const CheckoutButton = ({ isProcessing }: CheckoutButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isProcessing}
      className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white"
    >
      {isProcessing ? "A processar..." : "Finalizar Compra"}
    </Button>
  );
};

export default CheckoutButton;