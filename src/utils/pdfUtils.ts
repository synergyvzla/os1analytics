
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
  
  // Agregar borde superior verde
  doc.setDrawColor(218, 242, 31);
  doc.setFillColor(218, 242, 31);
  doc.rect(0, 0, 210, 19, 'F');
  
  // Agregar footer color #EBDDCC
  doc.setDrawColor(235, 221, 204);
  doc.setFillColor(235, 221, 204);
  doc.rect(0, 278, 210, 19, 'F');
  
  let yPos = 30;

  // Título
  doc.setFontSize(16);
  doc.text('Reporte de Propiedad', 20, yPos);
  yPos += 15;

  // Información básica
  doc.setFontSize(12);
  doc.text(`Dirección: ${property.address_formattedStreet || 'N/A'}`, 20, yPos);
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
  if (property.top_gust_2) {
    doc.text(`2. ${property.top_gust_2} mph (${new Date(property.top_gust_2_date!).toLocaleDateString()})`, 25, yPos);
    yPos += 7;
  }
  if (property.top_gust_3) {
    doc.text(`3. ${property.top_gust_3} mph (${new Date(property.top_gust_3_date!).toLocaleDateString()})`, 25, yPos);
    yPos += 7;
  }
  if (property.top_gust_4) {
    doc.text(`4. ${property.top_gust_4} mph (${new Date(property.top_gust_4_date!).toLocaleDateString()})`, 25, yPos);
    yPos += 7;
  }
  if (property.top_gust_5) {
    doc.text(`5. ${property.top_gust_5} mph (${new Date(property.top_gust_5_date!).toLocaleDateString()})`, 25, yPos);
    yPos += 7;
  }

  // Footer con información de redes sociales
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Texto de redes sociales alineado a la derecha
  const footerY = 290;
  doc.text('@welldonemitigation', 160, footerY - 8);
  doc.text('www.welldonemitigation.com', 160, footerY);

  // Intentar agregar la imagen
  try {
    const fileName = `${property.propertyId}.png`;
    const { data: imageData, error } = await supabase.storage
      .from('property-images')
      .download(fileName);

    if (error) {
      console.error('Error al descargar la imagen:', error);
      return doc;
    }

    if (!imageData) {
      console.log('No se encontró la imagen:', fileName);
      return doc;
    }
      
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
  } catch (error) {
    console.error('Error al procesar la imagen de la propiedad:', error);
  }

  return doc;
};
