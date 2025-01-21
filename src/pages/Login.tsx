import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación real
    if (email === "admin@example.com" && password === "password") {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: "Credenciales incorrectas",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Acceso Restringido</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            El acceso está restringido a usuarios autorizados. Las credenciales de inicio de sesión son proporcionadas directamente por el administrador de la empresa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};