
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { generatePropertyPDF } from '@/utils/pdfUtils';

interface PDFActionsProps {
  properties: any[];
}

export const PDFActions = ({ properties }: PDFActionsProps) => {
  const handleGeneratePDF = async () => {
    if (!properties || properties.length === 0) {
      toast({
        title: "Error",
        description: "No hay propiedades para generar reportes",
        variant: "destructive",
      });
      return;
    }

    const zip = new JSZip();
    const reportFolder = zip.folder("reportes");

    if (!reportFolder) {
      toast({
        title: "Error",
        description: "Error al crear el archivo ZIP",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Iniciando generación",
      description: "Comenzando a generar los reportes PDF...",
    });

    try {
      for (const property of properties) {
        const doc = await generatePropertyPDF(property);
        const pdfOutput = await doc.output('arraybuffer');
        reportFolder.file(`propiedad_${property.propertyId}.pdf`, pdfOutput);
      }

      const content = await zip.generateAsync({type: "blob"});
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes_propiedades.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Éxito",
        description: "Los reportes han sido generados y empaquetados correctamente",
      });
    } catch (error) {
      console.error('Error al generar los reportes:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar los reportes",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!properties || properties.length === 0) return;
    
    const headers = Object.keys(properties[0]).join(',');
    const rows = properties.map(prop => Object.values(prop).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'propiedades.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-end mt-4 gap-2">
      <Button 
        onClick={handleDownload}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Descarga CSV
      </Button>
      <Button 
        onClick={handleGeneratePDF}
        className="gap-2"
        variant="secondary"
      >
        <FileText className="h-4 w-4" />
        Generar PDF
      </Button>
    </div>
  );
};
