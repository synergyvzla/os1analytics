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
  building_roofType?: string;
  count_gusts?: number;
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
        // NUEVO: Intentar obtener imagen directamente del storage bucket
        console.log('Trying to get image from storage bucket for property:', property.propertyId);
        
        // Intentar varios formatos posibles de nombre de archivo
        const possibleFilenames = [
          `${property.propertyId}.jpg`,
          `${property.propertyId}.jpeg`,
          `${property.propertyId}.png`,
          `${property.propertyId}.webp`
        ];
        
        let imageFound = false;
        
        for (const filename of possibleFilenames) {
          try {
            console.log(`Trying to download: ${filename}`);
            const { data: imageData, error } = await supabase.storage
              .from('property-images')
              .download(filename);
            
            if (!error && imageData) {
              console.log(`Found image: ${filename}`);
              const imageBytes = await imageData.arrayBuffer();
              
              // Detectar el tipo de imagen basado en la extensión
              let image;
              if (filename.toLowerCase().endsWith('.png')) {
                image = await pdfDoc.embedPng(imageBytes);
              } else {
                image = await pdfDoc.embedJpg(imageBytes);
              }
              
              propertyImage = image;
              imageFound = true;
              console.log('Storage image embedded successfully');
              break;
            }
          } catch (storageError) {
            console.log(`No image found with name ${filename}`);
          }
        }
        
        // Fallback: si no encontramos en storage, intentar con la tabla property_images (método anterior)
        if (!imageFound) {
          console.log('No image found in storage, trying property_images table...');
          const { data: allImages, error } = await supabase
            .from('property_images')
            .select('*');
          
          console.log('All images from DB:', allImages?.length || 0);
          
          if (allImages && allImages.length > 0) {
            const transformedImages = allImages.map(img => ({
              ...img,
              property_id: img.image_url.split('/').pop()?.split('.')[0] || img.property_id
            }));
            
            const propertyImageData = transformedImages.find(img => 
              img.property_id === property.propertyId
            );
            
            if (propertyImageData?.image_url) {
              console.log('Fetching image from URL:', propertyImageData.image_url);
              const imageResponse = await fetch(propertyImageData.image_url);
              if (imageResponse.ok) {
                const imageBytes = await imageResponse.arrayBuffer();
                const image = await pdfDoc.embedJpg(imageBytes);
                propertyImage = image;
                imageFound = true;
                console.log('URL image embedded successfully');
              }
            }
          }
        }
        
        // Solo usar placeholder si realmente no encontramos ninguna imagen
        if (!imageFound) {
          console.log('No property image found anywhere, using placeholder');
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
        // Fallback final a placeholder
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
      
      // Title centered at top
      firstPage.drawText('Reporte de daño a la propiedad', {
        x: 150,
        y: 1100,
        size: 24,
        color: rgb(0, 0, 0),
      });

      // Layout: Image on left, property details on right
      const imageX = 80;
      const imageY = 850;
      const imageWidth = 280;
      const imageHeight = 180;
      
      const detailsX = 400;
      let detailsY = 1030;

      // Add property image if available
      if (propertyImage) {
        firstPage.drawImage(propertyImage, {
          x: imageX,
          y: imageY,
          width: imageWidth,
          height: imageHeight,
        });
      }

      // Property details on the right side
      if (property.address_formattedStreet) {
        firstPage.drawText(`Dirección: ${property.address_formattedStreet}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 25;
      }

      if (property.address_city) {
        firstPage.drawText(`Ciudad: ${property.address_city}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 25;
      }

      if (property.address_zip) {
        firstPage.drawText(`Código Postal: ${property.address_zip}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 25;
      }

      if (property.building_yearBuilt) {
        firstPage.drawText(`Año de Construcción: ${property.building_yearBuilt}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 25;
      }

      if (property.building_roofType) {
        firstPage.drawText(`Tipo de Techo: ${property.building_roofType}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 25;
      }

      if (property.owner_fullName) {
        firstPage.drawText(`Propietario (s): ${property.owner_fullName}`, {
          x: detailsX,
          y: detailsY,
          size: 12,
          color: rgb(0, 0, 0),
        });
        detailsY -= 35;
      }

      // Explanatory text about wind analysis
      const explanationY = 770;
      firstPage.drawText('Nuestros analistas identificaron ', {
        x: 80,
        y: explanationY,
        size: 12,
        color: rgb(0, 0, 0),
      });

      if (property.count_gusts) {
        firstPage.drawText(`${property.count_gusts} ráfagas de vientos mayores a 40 millas por hora en su zona, lo cual trae posibles`, {
          x: 248,
          y: explanationY,
          size: 12,
          color: rgb(0.8, 0, 0), // Red color for emphasis
        });
      }

      firstPage.drawText('daños al techo de su propiedad, entre ellas las siguientes:', {
        x: 80,
        y: explanationY - 20,
        size: 12,
        color: rgb(0, 0, 0),
      });

      // Top 5 Wind Gusts as numbered list
      const gustData = [
        { gust: property.top_gust_1, date: property.top_gust_1_date },
        { gust: property.top_gust_2, date: property.top_gust_2_date },
        { gust: property.top_gust_3, date: property.top_gust_3_date },
        { gust: property.top_gust_4, date: property.top_gust_4_date },
        { gust: property.top_gust_5, date: property.top_gust_5_date }
      ].filter(item => item.gust && item.date);

      let listY = 710;
      gustData.forEach((item, index) => {
        if (item.gust && item.date) {
          const date = new Date(item.date);
          const formattedDate = date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          
          firstPage.drawText(`${index + 1}. ${Number(item.gust).toFixed(1)} mph (${formattedDate})`, {
            x: 120,
            y: listY,
            size: 12,
            color: rgb(0, 0, 0),
          });
          listY -= 25;
        }
      });

      // Contact information at bottom
      const contactY = 570;
      firstPage.drawText('Si está interesado en programar una inspección detallada, por favor contáctenos al 0800-458-6893', {
        x: 80,
        y: contactY,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText('o al email: customerservice@welldonemitigation.com', {
        x: 80,
        y: contactY - 20,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
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