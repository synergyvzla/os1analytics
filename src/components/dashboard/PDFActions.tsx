
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import JSZip from 'jszip';
import { generatePropertyPDF } from '@/utils/pdfUtils';

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

    setGeneratingPDFs(true);
    setProgress(0);

    try {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const doc = await generatePropertyPDF(property);
        const pdfOutput = await doc.output('arraybuffer');
        reportFolder.file(`propiedad_${property.propertyId}.pdf`, pdfOutput);
        
        // Actualizar el progreso
        setProgress(((i + 1) / properties.length) * 100);
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
            Generando reportes PDF... {Math.round(progress)}%
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
          Generar PDF
        </Button>
      </div>
    </div>
  );
};
