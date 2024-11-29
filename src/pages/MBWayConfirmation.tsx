import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, ArrowLeft } from "lucide-react";

const MBWayConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds

  useEffect(() => {
    if (!orderDetails) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderDetails, navigate]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 240) * 100;

  if (!orderDetails) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Página Inicial
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 space-y-6"
        >
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Pedido Confirmado!</h1>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              O seu pedido foi registado com sucesso. Por favor, confirme o pagamento na sua app MB WAY.
            </p>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">
                  Tempo restante: {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h2 className="text-lg font-semibold">Resumo da Encomenda</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nº da Encomenda:</span> {orderDetails.orderId}</p>
              <p><span className="font-medium">Nome:</span> {orderDetails.name}</p>
              {orderDetails.address && (
                <p><span className="font-medium">Morada:</span> {orderDetails.address}</p>
              )}
              <p><span className="font-medium">Email:</span> {orderDetails.email}</p>
              <p><span className="font-medium">Contacto:</span> {orderDetails.phone}</p>
              <p><span className="font-medium">Método de Pagamento:</span> MB WAY</p>
              <p><span className="font-medium">Método de Envio:</span> {orderDetails.shippingMethod}</p>
              <p><span className="font-medium">Total:</span> {orderDetails.total}€</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MBWayConfirmation;