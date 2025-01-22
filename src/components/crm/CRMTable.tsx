import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const statusMap = {
  contacted: { label: "Contactado", color: "bg-blue-500" },
  interested: { label: "Interesado", color: "bg-green-500" },
  not_interested: { label: "No Interesado", color: "bg-red-500" },
  scheduled_call: { label: "Llamada Programada", color: "bg-yellow-500" },
  pending_followup: { label: "Seguimiento Pendiente", color: "bg-purple-500" },
  closed_won: { label: "Cerrado Ganado", color: "bg-emerald-500" },
  closed_lost: { label: "Cerrado Perdido", color: "bg-gray-500" },
}

interface CRMTableProps {
  interactions?: any[]
  onInteractionUpdate?: () => void
}

export function CRMTable({ interactions = [], onInteractionUpdate }: CRMTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (interactionId: string, newStatus: string) => {
    try {
      setUpdating(interactionId)
      const { error } = await supabase
        .from("crm_interactions")
        .update({ status: newStatus })
        .eq("id", interactionId)

      if (error) throw error

      toast.success("Estado actualizado correctamente")
      onInteractionUpdate?.()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Propiedad</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead>Fecha Llamada</TableHead>
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interactions.map((interaction) => (
            <TableRow key={interaction.id}>
              <TableCell>{interaction.Propiedades?.address_formattedStreet}</TableCell>
              <TableCell>{interaction.Propiedades?.owner_fullName}</TableCell>
              <TableCell>
                <Select
                  disabled={updating === interaction.id}
                  value={interaction.status}
                  onValueChange={(value) => handleStatusChange(interaction.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <Badge 
                        className={statusMap[interaction.status as keyof typeof statusMap].color}
                      >
                        {statusMap[interaction.status as keyof typeof statusMap].label}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        <Badge className={statusMap[value as keyof typeof statusMap].color}>
                          {label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{interaction.notes}</TableCell>
              <TableCell>
                {interaction.scheduled_call_date && 
                  format(new Date(interaction.scheduled_call_date), "PPp", { locale: es })}
              </TableCell>
              <TableCell>
                {format(new Date(interaction.created_at), "PP", { locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}