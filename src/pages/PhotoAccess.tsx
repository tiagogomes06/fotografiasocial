import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PhotoAccess = () => {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: student, error } = await supabase
        .from("students")
        .select("id")
        .eq("access_code", accessCode)
        .single();

      if (error || !student) {
        toast.error("Código de acesso inválido");
        return;
      }

      // Store the student ID in localStorage
      localStorage.setItem("studentId", student.id);
      
      // Redirect to store
      navigate(`/store`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ocorreu um erro ao verificar o código");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <img
        src="https://fotografiaescolar.duploefeito.com/logo.jpg"
        alt="Duplo Efeito"
        className="w-32 h-auto mb-8"
      />
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Insira o código de acesso"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="text-center"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "A verificar..." : "Aceder às minhas fotos"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhotoAccess;