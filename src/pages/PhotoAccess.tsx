import { useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import PhotoGallery from "@/components/PhotoGallery";
import AccessCodeForm from "@/components/auth/AccessCodeForm";
import { verifyAccessCode } from "@/utils/authHelpers";
import { motion } from "framer-motion";

const PhotoAccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  
  const state = location.state as { 
    photos?: string[],
    studentName?: string,
    studentId?: string,
    fromQR?: boolean,
    authenticated?: boolean
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const storedAccessCode = localStorage.getItem("accessCode");
      
      if (code) {
        try {
          const result = await verifyAccessCode(code);
          if (result.success) {
            // Update the route state with the authentication result
            navigate("/", { 
              state: { 
                photos: result.photos,
                studentName: result.studentName,
                studentId: result.studentId,
                fromQR: true,
                authenticated: true
              },
              replace: true
            });
            return;
          }
        } catch (error) {
          console.error("Error verifying access code:", error);
        }
      } else if (isAuthenticated === "true" && storedAccessCode) {
        try {
          await verifyAccessCode(storedAccessCode);
        } catch (error) {
          console.error("Error verifying stored access code:", error);
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("accessCode");
        }
      }
    };

    if (!state?.authenticated) {
      checkAuthentication();
    }
  }, [state?.authenticated, code, navigate]);

  if (state?.photos && state?.studentName && state?.authenticated) {
    return <PhotoGallery photos={state.photos} studentName={state.studentName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full h-screen px-4 py-12 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <img
            src="https://fotografiaescolar.duploefeito.com/logo.jpg"
            alt="Duplo Efeito"
            className="w-32 h-auto mb-4 mx-auto"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo(a)!</h1>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Aceda às suas fotografias e a loja online usando o código fornecido.
          </p>
        </motion.div>

        <AccessCodeForm />

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Duplo Efeito Fotografia © {new Date().getFullYear()}</p>
          <p className="mt-1">
            <a href="mailto:pedidos@duploefeito.com" className="hover:text-primary">
              pedidos@duploefeito.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PhotoAccess;