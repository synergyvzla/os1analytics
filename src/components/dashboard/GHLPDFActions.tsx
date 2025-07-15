import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { supabase } from "@/integrations/supabase/client";

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
    try {
      // Load the PDF template
      const templateResponse = await fetch('/Synergy Data Analytics.pdf');
      if (!templateResponse.ok) {
        throw new Error('Could not load PDF template');
      }
      
      const templateBytes = await templateResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Get the first page of the template
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      // Try to get property image using the same method as Dashboard
      let propertyImage = null;
      console.log('Looking for image for property:', property.propertyId);
      
      try {
        // First, get all property images and transform them like Dashboard does
        const { data: allImages, error } = await supabase
          .from('property_images')
          .select('*');
        
        console.log('All images from DB:', allImages?.length || 0);
        
        if (allImages && allImages.length > 0) {
          // Transform data like Dashboard does - extract property_id from image filename
          const transformedImages = allImages.map(img => ({
            ...img,
            property_id: img.image_url.split('/').pop()?.split('.')[0] || img.property_id
          }));
          
          console.log('First few transformed images:', transformedImages.slice(0, 3));
          
          // Find image for this specific property
          const propertyImageData = transformedImages.find(img => 
            img.property_id === property.propertyId
          );
          
          console.log('Found image for property:', propertyImageData);
          
          if (propertyImageData?.image_url) {
            console.log('Fetching image from:', propertyImageData.image_url);
            const imageResponse = await fetch(propertyImageData.image_url);
            if (imageResponse.ok) {
              const imageBytes = await imageResponse.arrayBuffer();
              const image = await pdfDoc.embedJpg(imageBytes);
              propertyImage = image;
              console.log('Property image embedded successfully');
            }
          }
        }
        
        // Fallback to placeholder if no property image found
        if (!propertyImage) {
          console.log('No property image found, using placeholder');
          const placeholderUrl = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';
          const imageResponse = await fetch(placeholderUrl);
          if (imageResponse.ok) {
            const imageBytes = await imageResponse.arrayBuffer();
            const image = await pdfDoc.embedJpg(imageBytes);
            propertyImage = image;
            console.log('Placeholder image embedded successfully');
          }
        }
      } catch (error) {
        console.error('Error loading image:', error);
        // Fallback to placeholder
        try {
          const placeholderUrl = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';
          const imageResponse = await fetch(placeholderUrl);
          if (imageResponse.ok) {
            const imageBytes = await imageResponse.arrayBuffer();
            const image = await pdfDoc.embedJpg(imageBytes);
            propertyImage = image;
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback image:', fallbackError);
        }
      }
      
      // Position data in the central white area (coordinates adjusted for better positioning)
      let yPosition = 500; // Start from middle area, leaving space for image
      const leftMargin = 80;
      const rightColumn = 350;
      
      // Add property image if available
      if (propertyImage) {
        const imageWidth = 200;
        const imageHeight = 150;
        firstPage.drawImage(propertyImage, {
          x: leftMargin,
          y: yPosition + 50,
          width: imageWidth,
          height: imageHeight,
        });
        yPosition -= 30; // Adjust position after image
      }
      
      // Property Score (prominent and larger)
      if (property.combined_score) {
        firstPage.drawText(`Score: ${property.combined_score}`, {
          x: leftMargin,
          y: yPosition,
          size: 18,
          color: rgb(0.16, 0.5, 0.73), // Blue color
        });
        yPosition -= 40;
      }

      // Address
      if (property.address_formattedStreet) {
        firstPage.drawText(`Dirección: ${property.address_formattedStreet}`, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 30;
      }

      // Zip Code
      if (property.address_zip) {
        firstPage.drawText(`Código Postal: ${property.address_zip}`, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 30;
      }

      // Estimated Value (formatted with decimals)
      if (property.valuation_estimatedValue) {
        const value = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(property.valuation_estimatedValue);
        firstPage.drawText(`Valor Estimado: ${value}`, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 40;
      }

      // Top 5 Wind Gusts - formatted as array
      const gustData = [
        { gust: property.top_gust_1, date: property.top_gust_1_date },
        { gust: property.top_gust_2, date: property.top_gust_2_date },
        { gust: property.top_gust_3, date: property.top_gust_3_date },
        { gust: property.top_gust_4, date: property.top_gust_4_date },
        { gust: property.top_gust_5, date: property.top_gust_5_date }
      ].filter(item => item.gust && item.date);

      if (gustData.length > 0) {
        firstPage.drawText('Top 5 Ráfagas de Viento:', {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 25;

        // Format as array with one decimal place
        const gustValues = gustData.map(item => Number(item.gust).toFixed(1)).join(', ');
        firstPage.drawText(`[${gustValues}]`, {
          x: leftMargin,
          y: yPosition,
          size: 11,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 25;

        firstPage.drawText('Fechas:', {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 20;

        // Format dates consistently
        const gustDates = gustData.map(item => {
          if (item.date) {
            const date = new Date(item.date);
            return date.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            });
          }
          return 'N/A';
        }).join(', ');
        
        firstPage.drawText(gustDates, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 35;
      }

      // Google Maps Link
      if (property["Google Maps"]) {
        firstPage.drawText('Google Maps:', {
          x: leftMargin,
          y: yPosition,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 20;
        
        // Truncate long URLs for better display
        const mapUrl = property["Google Maps"].length > 60 
          ? property["Google Maps"].substring(0, 60) + '...'
          : property["Google Maps"];
          
        firstPage.drawText(mapUrl, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          color: rgb(0.16, 0.5, 0.73), // Blue for link
        });
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error generating PDF with template:', error);
      throw new Error('Failed to generate PDF with template');
    }
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