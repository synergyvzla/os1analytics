
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { downloadPropertyReports } from '@/utils/pdfUtils';

interface PDFActionsProps {
  properties: any[];
}

export const PDFActions = ({ properties }: PDFActionsProps) => {
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGeneratePDF = async () => {
    if (!properties || properties.length === 0) {
      toast({
        title: "Error",
        description: "No hay propiedades para generar reportes",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPDFs(true);
    setProgress(0);

    try {
      const zip = await downloadPropertyReports(properties);
      
      if (!zip) {
        throw new Error('Error al generar el archivo ZIP');
      }

      const url = window.URL.createObjectURL(zip);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes_propiedades.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Éxito",
        description: "Los reportes han sido descargados correctamente",
      });
    } catch (error) {
      console.error('Error al descargar los reportes:', error);
      toast({
        title: "Error",
        description: "Hubo un error al descargar los reportes",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDFs(false);
      setProgress(0);
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
    <div className="flex flex-col gap-4">
      {generatingPDFs && (
        <div className="w-full space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-gray-500">
            Descargando reportes... {Math.round(progress)}%
          </p>
        </div>
      )}
      <div className="flex justify-end gap-2">
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
          disabled={generatingPDFs}
        >
          <FileText className="h-4 w-4" />
          Descargar PDFs
        </Button>
      </div>
    </div>
  );
};
