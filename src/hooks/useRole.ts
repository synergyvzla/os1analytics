
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'normal' | 'super';

export const useRole = () => {
  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      return roleData?.role as UserRole;
    }
  });

  const isSuperUser = role === 'super';

  return {
    role,
    isLoading,
    isSuperUser
  };
};
