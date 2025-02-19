
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'normal' | 'super';

export const useRole = () => {
  const { data: isSuperUser, isLoading, refetch } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_super_user')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user profile:", error);
          return false;
        }

        return profile?.is_super_user || false;
      } catch (error) {
        console.error("Unexpected error in useRole:", error);
        return false;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    role: isSuperUser ? 'super' : 'normal' as UserRole,
    isLoading,
    isSuperUser: Boolean(isSuperUser),
    refetch
  };
};
