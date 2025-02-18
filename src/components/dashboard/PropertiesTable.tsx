
"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

// Función para generar el reporte individual
const generateSingleReport = async (property: any) => {
  const propertyImage = await getPropertyImage(property.propertyId);
  const reportImage = '/lovable-uploads/c4da36ed-a7b8-4e6e-a8dd-939b0400cc86.png';
  
  // Crear un div temporal para el reporte
  const reportDiv = document.createElement('div');
  reportDiv.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #c5f542; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">Reporte de Propiedad</h1>
        <p>Dirección: ${property.address_formattedStreet}</p>
        <p>Ciudad: ${property.address_city}</p>
        <p>Código Postal: ${property.address_zip}</p>
        <p>Score: ${property.combined_score}</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <div style="flex: 1;">
            <h3>Imagen de la Propiedad</h3>
            ${propertyImage ? `<img src="${propertyImage}" style="max-width: 100%; height: auto;" />` : 'No hay imagen disponible'}
          </div>
          <div style="flex: 1; margin-left: 20px;">
            <img src="${reportImage}" style="max-width: 100%; height: auto;" />
          </div>
        </div>
      </div>
    </div>
  `;

  // Convertir a PDF usando html2pdf.js
  const html2pdf = (await import('html2pdf.js')).default;
  const opt = {
    margin: 1,
    filename: `reporte-${property.propertyId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  return html2pdf().set(opt).from(reportDiv).save();
};

// Función para obtener la imagen de la propiedad
const getPropertyImage = async (propertyId: string) => {
  const { data } = await supabase
    .from('property_images')
    .select('image_url')
    .eq('property_id', propertyId)
    .single();
  
  if (data?.image_url) {
    const { data: imageUrl } = supabase.storage
      .from('property-images')
      .getPublicUrl(data.image_url);
    return imageUrl.publicUrl;
  }
  return null;
};

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleGenerateReport = async (row: any) => {
    try {
      await generateSingleReport(row);
      toast({
        title: "Reporte generado",
        description: "El reporte se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full border-collapse text-xs">
          <thead className="bg-white" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-2 text-left align-middle font-medium text-gray-500 bg-gray-50 border-b"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
                <th className="h-10 px-2 text-left align-middle font-medium text-gray-500 bg-gray-50 border-b">
                  Acciones
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleGenerateReport(row.original)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Reporte
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="h-24 text-center text-sm text-gray-500">
                  No hay resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
