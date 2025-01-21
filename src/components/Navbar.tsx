import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-primary font-bold text-xl">Orlando Roofing</span>
          </div>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
};