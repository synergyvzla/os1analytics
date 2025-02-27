
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { downloadPropertyReports } from '@/utils/pdfUtils'
import { toast } from "@/hooks/use-toast"

export type Property = {
  combined_score: number
  address_street: string
  address_zip: number
  valuation_estimatedValue: number
  top_gust_1?: number
  top_gust_2?: number
  top_gust_3?: number
  top_gust_4?: number
  top_gust_5?: number
  top_gust_1_date?: string
  top_gust_2_date?: string
  top_gust_3_date?: string
  top_gust_4_date?: string
  top_gust_5_date?: string
  'Google Maps'?: string
  propertyId?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatTopGusts = (property: Property) => {
  const gusts = [
    property.top_gust_1,
    property.top_gust_2,
    property.top_gust_3,
    property.top_gust_4,
    property.top_gust_5
  ].filter(gust => gust !== undefined)

  return `[${gusts.join(', ')}]`
}

const formatGustDates = (property: Property) => {
  const dates = [
    property.top_gust_1_date,
    property.top_gust_2_date,
    property.top_gust_3_date,
    property.top_gust_4_date,
    property.top_gust_5_date
  ].filter(date => date !== undefined)
  .map(date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  });

  return `[${dates.join(', ')}]`;
}

export const columns: ColumnDef<Property>[] = [
  {
    accessorKey: "combined_score",
    header: "Score",
  },
  {
    accessorKey: "address_street",
    header: "Dirección",
  },
  {
    accessorKey: "address_zip",
    header: "Código Postal",
  },
  {
    accessorKey: "valuation_estimatedValue",
    header: "Valor Estimado",
    cell: ({ row }) => formatCurrency(row.getValue("valuation_estimatedValue")),
  },
  {
    id: "top_gusts",
    header: "Top 5 Ráfagas",
    cell: ({ row }) => formatTopGusts(row.original),
  },
  {
    id: "gust_dates",
    header: "Fechas Ráfagas",
    cell: ({ row }) => formatGustDates(row.original),
  },
  {
    id: "download_reports",
    header: "Reportes",
    cell: ({ row }) => {
      const property = row.original;
      
      const handleDownload = async () => {
        try {
          // Comprobamos que exista propertyId
          if (!property.propertyId) {
            toast({
              title: "Error",
              description: "Esta propiedad no tiene un ID válido para descargar reportes",
              variant: "destructive"
            });
            return;
          }
          
          const zip = await downloadPropertyReports([{
            propertyId: property.propertyId
          }], (progress) => {
            // No mostramos progreso para descargas individuales
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
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="gap-1"
          disabled={!property.propertyId}
        >
          <Download className="h-3 w-3" />
          Descargar
        </Button>
      );
    },
  },
  {
    accessorKey: "Google Maps",
    header: "Google Maps",
    cell: ({ row }) => {
      const maps = row.getValue("Google Maps")
      if (!maps) return null
      return (
        <a 
          href={maps as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Ver en Maps
        </a>
      )
    },
  },
]
