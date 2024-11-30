import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { OrderSummary } from "@/components/store/OrderSummary";
import { ArrowLeft, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-soft py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à Loja
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden animate-fade-up order-2 md:order-1">
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
                      Tempo Restante
                    </h2>
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <p className="text-center font-medium text-gray-700">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </p>
                </div>
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

export default MBWayConfirmation;