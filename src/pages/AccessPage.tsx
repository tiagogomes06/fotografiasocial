import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const code = searchParams.get("code");

  useEffect(() => {
    const verifyAccessCode = async () => {
      if (!code) {
        setError("Código de acesso não fornecido");
        return;
      }

      try {
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("access_code", code)
          .single();

        if (studentError || !student) {
          setError("Código de acesso inválido");
          return;
        }

        // Store the student ID in localStorage
        localStorage.setItem("studentId", student.id);
        
        // Redirect to store with the student ID
        navigate(`/store`);
      } catch (error) {
        console.error("Error verifying access code:", error);
        setError("Erro ao verificar código de acesso");
      }
    };

    verifyAccessCode();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img src="/logo.png" alt="Duplo Efeito" className="w-32 h-auto mb-8" />
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <img src="/logo.png" alt="Duplo Efeito" className="w-32 h-auto mb-8" />
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <p className="mt-4 text-gray-600">A verificar código de acesso...</p>
    </div>
  );
};

export default AccessPage;