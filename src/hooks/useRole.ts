
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
          console.log("No user found");
          return 'normal' as UserRole;
        }

        console.log("Checking role for user:", user.email);
        console.log("User ID:", user.id);

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching role:", error);
          return 'normal' as UserRole;
        }

        console.log("Role data received:", roleData);
        return (roleData?.role || 'normal') as UserRole;
      } catch (error) {
        console.error("Unexpected error in useRole:", error);
        return 'normal' as UserRole;
      }
    },
    staleTime: 0,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const isSuperUser = role === 'super';
  
  console.log("Final role state:", { role, isLoading, isSuperUser });

  return {
    role,
    isLoading,
    isSuperUser,
    refetch
  };
};
