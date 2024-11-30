import { Button } from "@/components/ui/button";

interface StoreBottomBarProps {
  selectedCount: number;
  onAddToCart: () => void;
  disabled: boolean;
}

const StoreBottomBar = ({ selectedCount, onAddToCart, disabled }: StoreBottomBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 shadow-lg z-10 animate-slide-in">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {selectedCount} {selectedCount === 1 ? 'foto selecionada' : 'fotos selecionadas'}
        </span>
        <Button
          onClick={onAddToCart}
          disabled={disabled}
          className="bg-primary hover:bg-primary/90 text-white transition-all duration-200"
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
};

export default StoreBottomBar;