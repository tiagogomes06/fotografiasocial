import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/store/OrderSummary";
import { Card } from "@/components/ui/card";

const PaymentConfirmation = () => {
  const location = useLocation();
  const paymentDetails = location.state?.paymentDetails;
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!paymentDetails || !orderDetails) {
    return <Navigate to="/" replace />;
  }

  const { entity, reference, amount } = paymentDetails;

  return (
    <div className="min-h-screen bg-gradient-soft py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Loja
        </Button>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-up">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Dados para Pagamento
              </h1>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
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

            <div className="mt-6 flex items-center gap-2 bg-amber-50 text-amber-700 p-4 rounded-xl">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                Por favor efetue o pagamento nas próximas 24 horas. Após este período, a referência poderá expirar.
              </p>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-center text-blue-600">
                Foi enviado um email com os dados de pagamento e o resumo da sua encomenda.
                Após confirmação do pagamento, receberá um email com os detalhes da sua encomenda.
              </p>
            </div>
          </div>

          <OrderSummary orderDetails={orderDetails} />
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;