import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1487958449943-2429e8be8625')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative container mx-auto px-4 py-32 text-center text-white animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Expertos en Reparación de Techos en Orlando
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Soluciones confiables para clientes de confianza
        </p>
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => navigate("/contact")}
        >
          Contáctanos
        </Button>
      </div>
    </div>
  );
};