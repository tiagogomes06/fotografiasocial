import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="py-4 px-4 border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
        <div className="container flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">Painel de Administração</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>
      </header>

      <main className="container pt-24 pb-8 px-4">
        {children}
      </main>
    </div>
  );
};