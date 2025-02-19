
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
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

    const totalProperties = properties.length;
    let processedProperties = 0;

    // Crear un único toast que actualizaremos
    const toastId = toast({
      id: 'pdf-progress',
      title: "Generando reportes",
      description: (
        <div className="w-full">
          <Progress 
            value={0} 
            className="w-full h-2" 
          />
          <p className="text-xs mt-2">0 de {totalProperties} reportes generados</p>
        </div>
      ),
      duration: Infinity,
    });

    try {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const doc = await generatePropertyPDF(property);
        const pdfOutput = await doc.output('arraybuffer');
        reportFolder.file(`propiedad_${property.propertyId}.pdf`, pdfOutput);
        
        processedProperties = i + 1;
        const progress = (processedProperties / totalProperties) * 100;
        
        // Actualizar el toast existente con el nuevo progreso
        toast({
          id: 'pdf-progress',
          title: "Generando reportes",
          description: (
            <div className="w-full">
              <Progress 
                value={progress} 
                className="w-full h-2" 
              />
              <p className="text-xs mt-2">{`${processedProperties} de ${totalProperties} reportes generados`}</p>
            </div>
          ),
          duration: Infinity,
        });
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
