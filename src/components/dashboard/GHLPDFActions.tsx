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
}

interface GHLPDFActionsProps {
  properties: Property[];
}

export const GHLPDFActions = ({ properties }: GHLPDFActionsProps) => {
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePropertyPDF = async (property: Property): Promise<Blob> => {
    console.log('Iniciando generación de PDF para propiedad:', property.propertyId);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Create header with company branding
    pdf.setFillColor(0, 51, 102); // Dark blue header
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Add company title
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text('SYNERGY DATA ANALYTICS', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text('Property Risk Assessment Report', pageWidth / 2, 25, { align: 'center' });

    // Reset to black text for content
    pdf.setTextColor(0, 0, 0);
    
    // Property Header Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROPERTY INFORMATION', 20, 50);
    
    // Property Address
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const address = `${property.address_street || ''}, ${property.address_city || ''} ${property.address_zip || ''}`.trim();
    pdf.text(`Address: ${address}`, 20, 60);

    // Property ID
    pdf.setFontSize(10);
    pdf.text(`Property ID: ${property.propertyId}`, 20, 70);

    // Owner Information
    if (property.owner_fullName) {
      pdf.text(`Owner: ${property.owner_fullName}`, 20, 80);
    }

    // Scores Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('RISK ASSESSMENT SCORES', 20, 100);
    
    // Score box background
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(15, 105, pageWidth - 30, 45, 'F');
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    let yPos = 115;
    if (property.combined_score !== undefined) {
      pdf.text(`Combined Risk Score: ${property.combined_score}`, 20, yPos);
      yPos += 10;
    }
    if (property.wind_score !== undefined) {
      pdf.text(`Wind Risk Score: ${property.wind_score}`, 20, yPos);
      yPos += 10;
    }
    if (property.structural_score !== undefined) {
      pdf.text(`Structural Risk Score: ${property.structural_score}`, 20, yPos);
      yPos += 10;
    }

    // Property Details Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('PROPERTY DETAILS', 20, 170);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    yPos = 180;
    if (property.building_yearBuilt) {
      pdf.text(`Year Built: ${property.building_yearBuilt}`, 20, yPos);
      yPos += 8;
    }
    if (property.building_totalBuildingAreaSquareFeet) {
      pdf.text(`Building Area: ${property.building_totalBuildingAreaSquareFeet} sq ft`, 20, yPos);
      yPos += 8;
    }
    if (property.valuation_estimatedValue) {
      pdf.text(`Estimated Value: $${property.valuation_estimatedValue.toLocaleString()}`, 20, yPos);
      yPos += 8;
    }
    if (property.address_latitude && property.address_longitude) {
      pdf.text(`Coordinates: ${property.address_latitude.toFixed(6)}, ${property.address_longitude.toFixed(6)}`, 20, yPos);
      yPos += 8;
    }

    // Wind History Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('WIND GUST HISTORY', 20, yPos + 15);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    yPos += 25;
    
    let hasWindData = false;
    for (let i = 1; i <= 5; i++) {
      const gust = property[`top_gust_${i}` as keyof Property] as number;
      const date = property[`top_gust_${i}_date` as keyof Property] as string;
      
      if (gust) {
        hasWindData = true;
        const formattedDate = date ? new Date(date).toLocaleDateString() : 'N/A';
        pdf.text(`${i}. ${gust} mph - ${formattedDate}`, 25, yPos);
        yPos += 7;
      }
    }
    
    if (!hasWindData) {
      pdf.text('No wind gust data available', 25, yPos);
    }

    // Footer
    pdf.setFillColor(0, 51, 102);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Generated on ${new Date().toLocaleDateString()} - Synergy Data Analytics`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    console.log('PDF generado exitosamente');
    return pdf.output('blob');
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