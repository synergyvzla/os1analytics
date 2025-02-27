
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { downloadPropertyReports } from '@/utils/pdfUtils'
import { toast } from "@/hooks/use-toast"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "propertyId",
    header: "ID",
  },
  {
    accessorKey: "address_city",
    header: "Ciudad",
  },
  {
    accessorKey: "address_zip",
    header: "Código Postal",
  },
  {
    accessorKey: "owner_fullName",
    header: "Propietario",
  },
  {
    accessorKey: "combined_score",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Score
          <Badge
            variant="outline"
            className="ml-2 rounded-sm border-2 border-muted"
          >
            EQ
          </Badge>
        </div>
      )
    },
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("combined_score"))
      const badgeColor = score > 0.7 ? "green" : score > 0.4 ? "yellow" : "red"
      return (
        <div className="flex items-center">
          {score.toFixed(2)}
          <Badge
            variant="secondary"
            className={`ml-2 rounded-sm text-white bg-${badgeColor}-500`}
          >
            {score > 0.7 ? "Alto" : score > 0.4 ? "Medio" : "Bajo"}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Reportes",
    cell: ({ row }) => {
      const property = row.original;

      const handleDownload = async () => {
        try {
          const zip = await downloadPropertyReports([property], (progress) => {
            // Progress no se muestra para descargas individuales
          });
          
          if (!zip) {
            throw new Error('Error al generar el archivo ZIP');
          }

          const url = window.URL.createObjectURL(zip);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reportes_propiedad_${property.propertyId}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: "Éxito",
            description: "Los reportes han sido descargados correctamente"
          });
        } catch (error) {
          console.error('Error al descargar los reportes:', error);
          toast({
            title: "Error",
            description: "Hubo un error al descargar los reportes",
            variant: "destructive"
          });
        }
      };

      return (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar
        </Button>
      );
    },
  }
]
