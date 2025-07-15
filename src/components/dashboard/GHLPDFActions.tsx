import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import jsPDF from 'jspdf';
import JSZip from 'jszip';

interface Property {
  propertyId: string;
  address_street?: string;
  address_formattedStreet?: string;
  address_city?: string;
  address_zip?: number;
  owner_fullName?: string;
  combined_score?: number;
  wind_score?: number;
  structural_score?: number;
  valuation_estimatedValue?: number;
  top_gust_1?: number;
  top_gust_1_date?: string;
  top_gust_2?: number;
  top_gust_2_date?: string;
  top_gust_3?: number;
  top_gust_3_date?: string;
  top_gust_4?: number;
  top_gust_4_date?: string;
  top_gust_5?: number;
  top_gust_5_date?: string;
  address_latitude?: number;
  address_longitude?: number;
  building_yearBuilt?: number;
  building_totalBuildingAreaSquareFeet?: number;
  "Google Maps"?: string;
}

interface GHLPDFActionsProps {
  properties: Property[];
}

export const GHLPDFActions = ({ properties }: GHLPDFActionsProps) => {
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePropertyPDF = async (property: Property): Promise<Blob> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Try to load the Synergy template image
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        templateImg.onload = () => resolve();
        templateImg.onerror = () => reject(new Error('Failed to load template'));
        // Try the public folder path
        templateImg.src = '/Synergy Data Analytics.png';
      });

      // Add template as background - full page
      doc.addImage(templateImg, 'PNG', 0, 0, 210, 297);

      // Overlay data in the central white area
      let yPosition = 85; // Starting position in the white content area
      
      // Set text properties for data overlay
      doc.setTextColor(51, 51, 51); // Dark gray text
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // Property Score (prominent)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text(`Score: ${property.combined_score || 'N/A'}`, 20, yPosition);
      yPosition += 15;

      // Address
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text(`Dirección: ${property.address_formattedStreet || 'N/A'}`, 20, yPosition);
      yPosition += 8;

      // Zip Code
      doc.setFont('helvetica', 'normal');
      doc.text(`Código Postal: ${property.address_zip || 'N/A'}`, 20, yPosition);
      yPosition += 8;

      // Estimated Value
      doc.text(`Valor Estimado: ${property.valuation_estimatedValue ? 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
          .format(property.valuation_estimatedValue) : 'N/A'}`, 20, yPosition);
      yPosition += 12;

      // Top 5 Wind Gusts
      doc.setFont('helvetica', 'bold');
      doc.text('Top 5 Ráfagas de Viento:', 20, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      const gustData = [
        { gust: property.top_gust_1, date: property.top_gust_1_date },
        { gust: property.top_gust_2, date: property.top_gust_2_date },
        { gust: property.top_gust_3, date: property.top_gust_3_date },
        { gust: property.top_gust_4, date: property.top_gust_4_date },
        { gust: property.top_gust_5, date: property.top_gust_5_date }
      ].filter(item => item.gust && item.date);

      if (gustData.length > 0) {
        const gustValues = gustData.map(item => item.gust).join(', ');
        doc.text(`[${gustValues}]`, 20, yPosition);
        yPosition += 8;

        // Gust Dates
        doc.setFont('helvetica', 'bold');
        doc.text('Fechas Ráfagas:', 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        const gustDates = gustData.map(item => 
          item.date ? new Date(item.date).toLocaleDateString('es-ES') : 'N/A'
        ).join(', ');
        doc.text(`${gustDates}`, 20, yPosition);
        yPosition += 8;
      } else {
        doc.text('No hay datos de ráfagas disponibles', 20, yPosition);
        yPosition += 8;
      }

      yPosition += 8;

      // Google Maps Link
      if (property["Google Maps"]) {
        doc.setFont('helvetica', 'bold');
        doc.text('Google Maps:', 20, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(41, 128, 185); // Blue for link
        doc.text(property["Google Maps"], 20, yPosition);
      }

    } catch (error) {
      console.error('Error loading template image:', error);
      
      // Fallback: Create PDF without template
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SYNERGY DATA ANALYTICS', 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Propiedad', 105, 55, { align: 'center' });

      let yPos = 75;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const data = [
        `Score: ${property.combined_score || 'N/A'}`,
        `Dirección: ${property.address_formattedStreet || 'N/A'}`,
        `Código Postal: ${property.address_zip || 'N/A'}`,
        `Valor Estimado: ${property.valuation_estimatedValue ? 
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(property.valuation_estimatedValue) : 'N/A'}`
      ];

      data.forEach(item => {
        doc.text(item, 15, yPos);
        yPos += 10;
      });
    }

    return doc.output('blob');
  };

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
      if (properties.length === 1) {
        // Generate single PDF
        const pdfBlob = await generatePropertyPDF(properties[0]);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `synergy_report_${properties[0].propertyId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Generate multiple PDFs in ZIP
        const zip = new JSZip();
        const totalProperties = properties.length;

        for (let i = 0; i < properties.length; i++) {
          const property = properties[i];
          const pdfBlob = await generatePropertyPDF(property);
          zip.file(`synergy_report_${property.propertyId}.pdf`, pdfBlob);
          
          setProgress(((i + 1) / totalProperties) * 100);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synergy_reports.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Éxito",
        description: "Los reportes han sido generados correctamente"
      });
    } catch (error) {
      console.error('Error al generar los reportes:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar los reportes",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDFs(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!properties || properties.length === 0) return;

    // Lista de columnas a excluir (mantengo la misma lógica del componente original)
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
            Generando reportes... {Math.round(progress)}%
          </p>
        </div>
      )}
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
          Generar PDFs Synergy
        </Button>
      </div>
    </div>
  );
};