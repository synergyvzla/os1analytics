
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'normal' | 'super';

export const useRole = () => {
  const { data: role, isLoading, refetch } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log("Checking role for user:", user.email);

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        return 'normal' as UserRole;
      }

      console.log("Role data:", roleData);
      return roleData?.role as UserRole;
    },
    staleTime: 0, // Asegura que siempre obtengamos el rol más reciente
    retry: 1
  });

  const isSuperUser = role === 'super';

  return {
    role,
    isLoading,
    isSuperUser,
    refetch
  };
};
