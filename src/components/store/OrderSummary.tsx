import { Card } from "@/components/ui/card";

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
}

export const OrderSummary = ({ orderDetails }: OrderSummaryProps) => {
  const subtotal = orderDetails.total - (orderDetails.shippingCost || 0);

  return (
    <Card className="bg-white p-6 space-y-4">
      <h2 className="text-xl font-semibold">Resumo da Encomenda</h2>
      
      <div className="space-y-2">
        <p><span className="font-medium">Número da Encomenda:</span> {orderDetails.orderId}</p>
        <p><span className="font-medium">Cliente:</span> {orderDetails.name}</p>
        <p><span className="font-medium">Email:</span> {orderDetails.email}</p>
        <p><span className="font-medium">Telefone:</span> {orderDetails.phone}</p>
        <p><span className="font-medium">Método de Envio:</span> {orderDetails.shippingMethod}</p>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">Itens</h3>
        <div className="space-y-3">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
              </div>
              <p className="font-medium">{item.price}€</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{subtotal}€</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Portes de Envio</span>
          <span>{orderDetails.shippingCost || 0}€</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{orderDetails.total}€</span>
        </div>
      </div>
    </Card>
  );
};