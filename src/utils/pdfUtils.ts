
import jsPDF from 'jspdf';
import { supabase } from "@/integrations/supabase/client";

interface Property {
  propertyId: string;
  address_formattedStreet: string | null;
  address_latitude: number | null;
  address_longitude: number | null;
  valuation_estimatedValue: number | null;
  top_gust_1: number | null;
  top_gust_1_date: string | null;
  top_gust_2: number | null;
  top_gust_2_date: string | null;
  top_gust_3: number | null;
  top_gust_3_date: string | null;
  top_gust_4: number | null;
  top_gust_4_date: string | null;
  top_gust_5: number | null;
  top_gust_5_date: string | null;
}

const formatCurrency = (value: number | null) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export const generatePropertyPDF = async (property: Property): Promise<jsPDF> => {
  const doc = new jsPDF();
  let yPos = 20;

  console.log("Generando PDF para propiedad:", property.propertyId);

  // Título
  doc.setFontSize(16);
  doc.text('Reporte de Propiedad', 20, yPos);
  yPos += 15;

  // Información básica
  doc.setFontSize(12);
  doc.text(`Dirección: ${property.address_formattedStreet || 'N/A'}`, 20, yPos);
  doc.setTextColor(0, 0, 255);
  doc.textWithLink('Ver en Google Maps', 150, yPos, {
    url: `https://www.google.com/maps/search/?api=1&query=${property.address_latitude},${property.address_longitude}`
  });
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.text(`Valor estimado: ${formatCurrency(property.valuation_estimatedValue)}`, 20, yPos);
  yPos += 15;

  // Información de ráfagas
  doc.text('Top 5 ráfagas de viento:', 20, yPos);
  yPos += 10;
  
  if (property.top_gust_1) {
    doc.text(`1. ${property.top_gust_1} mph (${new Date(property.top_gust_1_date!).toLocaleDateString()})`, 25, yPos);
    yPos += 7;
  }
  // ... agregar el resto de las ráfagas

  // Intentar agregar la imagen
  try {
    const { data: imageData } = await supabase.storage
      .from('property-images')
      .download(`${property.propertyId}.png`);
      
    if (imageData) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageData);
      });

      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = base64;
      });

      const imgWidth = 170;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      doc.addImage(base64, 'PNG', 20, yPos, imgWidth, imgHeight);
    }
  } catch (error) {
    console.error('Error al cargar la imagen de la propiedad:', error);
  }

  return doc;
};
