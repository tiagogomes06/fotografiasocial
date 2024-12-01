import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { verifyAccessCode } from "@/utils/authHelpers";
import { motion } from "framer-motion";

const AccessCodeForm = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyAccessCode(accessCode);
      if (result.success) {
        navigate("/", { 
          state: { 
            photos: result.photos,
            studentName: result.studentName,
            studentId: result.studentId,
            authenticated: true
          },
          replace: true
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ocorreu um erro ao verificar o código");
      localStorage.removeItem("isAuthenticated");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-sm"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="access-code" className="text-sm font-medium text-gray-700">
              Código de Acesso
            </label>
            <Input
              id="access-code"
              type="text"
              placeholder="Insira o código de acesso"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="text-center"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "A verificar..." : "Aceder às minhas fotos"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AccessCodeForm;