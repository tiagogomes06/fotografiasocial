import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/admin");
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Please sign in to access the admin panel
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  background: "hsl(var(--primary))",
                  color: "white",
                  borderRadius: "var(--radius)",
                },
                anchor: {
                  color: "hsl(var(--primary))",
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