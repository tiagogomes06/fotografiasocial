interface CheckoutHeaderProps {
  isProcessing: boolean;
}

const CheckoutHeader = ({ isProcessing }: CheckoutHeaderProps) => {
  return (
    <div className="flex items-center gap-4 pb-4 border-b">
      <h1 className="text-xl md:text-2xl font-bold">Finalizar Compra</h1>
    </div>
  );
};

export default CheckoutHeader;