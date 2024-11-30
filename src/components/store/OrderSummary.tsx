import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  orderDetails: {
    orderId: string;
    name: string;
    email: string;
    phone: string;
    shippingMethod: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingCost?: number;
  };
  className?: string;
}

export const OrderSummary = ({ orderDetails, className }: OrderSummaryProps) => {
  const subtotal = orderDetails.total - (orderDetails.shippingCost || 0);

  return (
    <Card className={cn("bg-white shadow-lg rounded-xl overflow-hidden animate-fade-up", className)}>
      <div className="p-6 space-y-6">
        <div className="border-b pb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resumo da Encomenda</h2>
        </div>
        
        <div className="grid gap-4 text-sm md:text-base">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <p className="flex flex-col md:flex-row md:items-center gap-1">
                <span className="text-gray-500">Número da Encomenda:</span>
                <span className="font-medium text-gray-900 break-all">{orderDetails.orderId}</span>
              </p>
              <p className="flex flex-col md:flex-row md:items-center gap-1">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-medium text-gray-900">{orderDetails.name}</span>
              </p>
              <p className="flex flex-col md:flex-row md:items-center gap-1">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 break-all">{orderDetails.email}</span>
              </p>
              <p className="flex flex-col md:flex-row md:items-center gap-1">
                <span className="text-gray-500">Telefone:</span>
                <span className="font-medium text-gray-900">{orderDetails.phone}</span>
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="flex flex-col md:flex-row md:items-center gap-1">
              <span className="text-gray-500">Método de Envio:</span>
              <span className="font-medium text-gray-900">{orderDetails.shippingMethod}</span>
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Itens</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">{item.price}€</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{subtotal}€</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Portes de Envio</span>
            <span>{orderDetails.shippingCost || 0}€</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
            <span>Total</span>
            <span>{orderDetails.total}€</span>
          </div>
        </div>
      </div>
    </Card>
  );
};