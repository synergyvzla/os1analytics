
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Admin() {
  const { isSuperUser, isLoading: isRoleLoading } = useRole();
  const [loading, setLoading] = useState(false);

  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      return profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'normal'
      })) || [];
    }
  });

  const handleRoleChange = async (userId: string, newRole: 'normal' | 'super') => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast.success('Rol actualizado correctamente');
      refetchUsers();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (isRoleLoading || isUsersLoading) {
    return <div>Cargando...</div>;
  }

  if (!isSuperUser) {
    return <div>No tienes permiso para ver esta página</div>;
  }

  return (
    <DashboardSidebar>
      <div className="flex h-full flex-col gap-4 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Administración de Usuarios</CardTitle>
            <CardDescription>
              Gestiona los roles y permisos de los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleRoleChange(
                          user.id,
                          user.role === 'super' ? 'normal' : 'super'
                        )}
                      >
                        {user.role === 'super' ? 'Hacer Normal' : 'Hacer Super'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardSidebar>
  );
}
