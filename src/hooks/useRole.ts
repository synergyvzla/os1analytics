
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
          console.log("No user found, returning normal role");
          return 'normal' as UserRole;
        }

        console.log("Fetching role for user:", user.email);
        
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching roles:", error);
          return 'normal' as UserRole;
        }

        console.log("Roles data received:", roles);

        // Check if the user has a super role
        const isSuperRole = roles?.some(r => r.role === 'super');
        const finalRole = isSuperRole ? 'super' : 'normal';
        
        console.log("Final determined role:", finalRole);
        return finalRole as UserRole;
      } catch (error) {
        console.error("Unexpected error in useRole:", error);
        return 'normal' as UserRole;
      }
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const isSuperUser = role === 'super';
  
  console.log("useRole hook state:", { role, isLoading, isSuperUser });

  return {
    role,
    isLoading,
    isSuperUser,
    refetch
  };
};

