import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentDetails } = location.state || {};

  if (!paymentDetails) {
    navigate('/');
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Loja
        </Button>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Pagamento por Multibanco</h1>
            <p className="text-gray-500">
              Use os dados abaixo para efetuar o pagamento. O pagamento pode demorar até 24h para ser processado.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Entidade</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(paymentDetails.entity, 'Entidade')}
                  className="gap-2"
                >
                  <span className="text-lg font-mono">{paymentDetails.entity}</span>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Referência</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(paymentDetails.reference, 'Referência')}
                  className="gap-2"
                >
                  <span className="text-lg font-mono">{paymentDetails.reference}</span>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Valor</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(paymentDetails.amount.toFixed(2) + '€', 'Valor')}
                  className="gap-2"
                >
                  <span className="text-lg font-mono">{paymentDetails.amount.toFixed(2)}€</span>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Guarde estes dados. Após o pagamento, receberá um email de confirmação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;