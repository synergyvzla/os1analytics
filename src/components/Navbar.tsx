import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="/signal.png" 
              alt="Logo" 
              className="h-9 w-9 transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="flex flex-col">
              <span className="text-[#0EA5E9] font-bold text-xl tracking-tight">
                Signal Orlando
              </span>
              <span className="text-gray-500 text-xs font-medium">
                Property Intelligence
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="border-2 border-[#0EA5E9] bg-white text-[#0EA5E9] hover:text-white hover:bg-[#0EA5E9] transition-all duration-300 font-medium px-6 py-2 rounded-full shadow-sm"
            onClick={() => navigate("/login")}
          >
            {user ? "Dashboard" : "Iniciar sesión"}
          </Button>
        </div>
      </div>
    </nav>
  );
};