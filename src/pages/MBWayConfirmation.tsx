import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { OrderSummary } from "@/components/store/OrderSummary";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";

const MBWayConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    const checkOrderDetails = () => {
      if (!location.state || !orderDetails) {
        toast.error("Informação da encomenda não encontrada");
        navigate("/cart");
        return false;
      }
      return true;
    };

    if (checkOrderDetails()) {
      setIsLoading(false);
    }
  }, [location.state, orderDetails, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">A processar o seu pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Carrinho
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden order-2 lg:order-1">
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento MBWay em Processamento
                </h1>
                <p className="text-gray-600">
                  Foi enviado um pedido de pagamento para o seu telemóvel
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Aguardando Confirmação
                    </h2>
                  </div>
                  <Progress value={100} className="h-3" />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-center text-blue-600">
                    Por favor, verifique o seu telemóvel e aceite o pagamento na aplicação MBWay
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="order-1 lg:order-2">
            <OrderSummary orderDetails={orderDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MBWayConfirmation;