import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { CRMTable } from "@/components/crm/CRMTable"
import { CRMStats } from "@/components/crm/CRMStats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewInteractionDialog } from "@/components/crm/NewInteractionDialog"

export default function CRM() {
  const [showNewInteractionDialog, setShowNewInteractionDialog] = useState(false)

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Propiedades")
        .select("*")
      if (error) throw error
      return data
    },
  })

  const { data: interactions, refetch: refetchInteractions } = useQuery({
    queryKey: ["interactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_interactions")
        .select(`
          *,
          Propiedades (
            propertyId,
            address_formattedStreet,
            owner_fullName
          )
        `)
      if (error) throw error
      return data
    },
  })

  return (
    <DashboardSidebar>
      <div className="flex h-full flex-col gap-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">CRM</h1>
          <Button onClick={() => setShowNewInteractionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Interacción
          </Button>
        </div>

        <CRMStats interactions={interactions} />
        <CRMTable interactions={interactions} onInteractionUpdate={refetchInteractions} />

        <NewInteractionDialog 
          open={showNewInteractionDialog}
          onOpenChange={setShowNewInteractionDialog}
          properties={properties || []}
          onInteractionCreated={refetchInteractions}
        />
      </div>
    </DashboardSidebar>
  )
}