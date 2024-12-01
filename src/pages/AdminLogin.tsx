import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      // Get the intended destination from the URL, or default to /admin
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirectTo') || '/admin';
      navigate(redirectTo, { replace: true });
    }
  }, [session, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
          <p className="text-muted-foreground mt-2">
            Faça login para acessar o painel
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;