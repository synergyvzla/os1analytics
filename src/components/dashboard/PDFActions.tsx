
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { downloadPropertyReports } from '@/utils/pdfUtils';

interface PDFActionsProps {
  properties: any[];
}

export const PDFActions = ({
  properties
}: PDFActionsProps) => {
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGeneratePDF = async () => {
    if (!properties || properties.length === 0) {
      toast({
        title: "Error",
        description: "No hay propiedades para generar reportes",
        variant: "destructive"
      });
      return;
    }
    setGeneratingPDFs(true);
    setProgress(0);
    try {
      const zip = await downloadPropertyReports(properties, currentProgress => {
        setProgress(currentProgress);
      });
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
        description: "Los reportes han sido descargados correctamente"
      });
    } catch (error) {
      console.error('Error al descargar los reportes:', error);
      toast({
        title: "Error",
        description: "Hubo un error al descargar los reportes",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDFs(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!properties || properties.length === 0) return;

    // Lista de columnas a excluir
    const excludeColumns = [
      'address_houseNumber',
      'address_countyFipsCode',
      'address_zipPlus4',
      'address_longitude',
      'address_latitude',
      'address_formattedStreet',
      'address_streetNoUnit',
      'building_effectiveYearBuilt',
      'sale_priorSale_price',
      'valuation_estimatedValue',
      'Station1_ID',
      'Station2_ID',
      'score_base',
      'wind_score',
      'max_gust',
      'mean_gust',
      'station_used',
      'top_gust_1',
      'top_gust_1_date',
      'top_gust_2',
      'top_gust_2_date',
      'top_gust_3',
      'top_gust_3_date',
      'top_gust_4',
      'top_gust_4_date',
      'top_gust_5',
      'top_gust_5_date',
      'structural_score',
      'building_roofCover',
      'building_roofType',
      'general_propertyTypeDetail'
    ];

    // Filtrar las propiedades para excluir las columnas no deseadas
    const filteredProperties = properties.map(prop => {
      const filteredProp = { ...prop };
      excludeColumns.forEach(column => {
        delete filteredProp[column];
      });
      return filteredProp;
    });

    // Generar el CSV con las propiedades filtradas
    const headers = Object.keys(filteredProperties[0]).join(',');
    const rows = filteredProperties.map(prop => Object.values(prop).join(','));
    const csv = [headers, ...rows].join('\n');

    // Crear y descargar el archivo CSV
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'propiedades.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return <div className="flex flex-col gap-4">
      {generatingPDFs && <div className="w-full space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-gray-500">
            Descargando reportes... {Math.round(progress)}%
          </p>
        </div>}
      <div className="flex justify-end gap-2 rounded-lg">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Descarga CSV
        </Button>
        <Button 
          onClick={handleGeneratePDF} 
          className="gap-2 border-2 border-primary hover:border-primary/80" 
          variant="secondary" 
          disabled={generatingPDFs}
        >
          <FileText className="h-4 w-4" />
          Descargar PDFs
        </Button>
      </div>
    </div>;
};
