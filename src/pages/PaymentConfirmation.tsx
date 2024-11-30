import { useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/store/OrderSummary";
import { Card } from "@/components/ui/card";

const PaymentConfirmation = () => {
  const location = useLocation();
  const paymentDetails = location.state?.paymentDetails;
  const orderDetails = location.state?.orderDetails;

  if (!paymentDetails || !orderDetails) {
    return <Navigate to="/" replace />;
  }

  const { entity, reference, amount } = paymentDetails;

  return (
    <div className="min-h-screen bg-gradient-soft py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Loja
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden animate-fade-up order-2 md:order-1">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-primary mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Dados para Pagamento
                </h1>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Entidade</p>
                    <p className="text-xl font-semibold text-gray-900">{entity}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Referência</p>
                    <p className="text-xl font-semibold text-gray-900">{reference}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Montante</p>
                    <p className="text-xl font-semibold text-gray-900">{amount}€</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-center text-blue-600">
                  Por favor efetue o pagamento utilizando os dados acima. 
                  Após confirmação do pagamento, receberá um email com os detalhes da sua encomenda.
                </p>
              </div>
            </div>
          </Card>

          <div className="order-1 md:order-2">
            <OrderSummary orderDetails={orderDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;