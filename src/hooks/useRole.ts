
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'normal' | 'super';

export const useRole = () => {
  const { data: role, isLoading, refetch } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return 'normal' as UserRole;
        }
        
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching role:", error);
          return 'normal' as UserRole;
        }

        return (roleData?.role || 'normal') as UserRole;
      } catch (error) {
        console.error("Unexpected error in useRole:", error);
        return 'normal' as UserRole;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
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
