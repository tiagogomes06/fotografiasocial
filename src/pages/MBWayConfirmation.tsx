import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const MBWayConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [progress, setProgress] = useState(100);

  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    if (!orderDetails) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderDetails, navigate]);

  useEffect(() => {
    setProgress((timeLeft / 240) * 100);
    if (timeLeft === 0) {
      toast.error("Tempo limite excedido. Por favor, tente novamente.");
      navigate("/");
    }
  }, [timeLeft, navigate]);

  if (!orderDetails) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pagamento MBWay em Processamento
              </h1>
              <p className="text-gray-600">
                Foi enviado um pedido de pagamento para o seu telemóvel
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tempo Restante
                </h2>
                <Progress value={progress} className="h-3" />
                <p className="text-center mt-2 text-lg font-medium text-gray-700">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detalhes da Encomenda
                </h2>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Número da Encomenda</dt>
                    <dd className="text-gray-900 font-medium">{orderDetails.orderId}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Total</dt>
                    <dd className="text-gray-900 font-medium">{orderDetails.total}€</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Nome</dt>
                    <dd className="text-gray-900">{orderDetails.name}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Email</dt>
                    <dd className="text-gray-900">{orderDetails.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Telefone</dt>
                    <dd className="text-gray-900">{orderDetails.phone}</dd>
                  </div>
                  {orderDetails.address && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-gray-600">Morada</dt>
                      <dd className="text-gray-900">
                        {orderDetails.address}, {orderDetails.postalCode} {orderDetails.city}
                      </dd>
                    </div>
                  )}
                  <div className="py-3 flex justify-between">
                    <dt className="text-gray-600">Método de Envio</dt>
                    <dd className="text-gray-900">{orderDetails.shippingMethod}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto"
              >
                Voltar à Página Inicial
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MBWayConfirmation;