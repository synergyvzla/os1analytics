
import jsPDF from 'jspdf';
import { supabase } from "@/integrations/supabase/client";

interface Property {
  propertyId: string;
  address_formattedStreet: string | null;
  address_city: string | null;
  address_zip: number | null;
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

const formatAddress = (property: Property): string => {
  const street = property.address_formattedStreet || 'N/A';
  const city = property.address_city || 'N/A';
  const zip = property.address_zip || 'N/A';
  return `${street}, ${city}, FL ${zip}`;
};

export const generatePropertyPDF = async (property: Property): Promise<jsPDF> => {
  const doc = new jsPDF();
  
  // Agregar borde superior verde
  doc.setDrawColor(218, 242, 31);
  doc.setFillColor(218, 242, 31);
  doc.rect(0, 0, 210, 19, 'F');
  
  // Agregar footer color #EBDDCC con mayor altura
  doc.setDrawColor(235, 221, 204);
  doc.setFillColor(235, 221, 204);
  doc.rect(0, 265, 210, 32, 'F');
  
  let yPos = 30;

  // Título centrado y con fuente más profesional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const title = 'Reporte de Daño de Propiedad';
  const titleWidth = doc.getStringUnitWidth(title) * 20 / doc.internal.scaleFactor;
  const pageWidth = doc.internal.pageSize.width;
  doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  yPos += 20;

  // Información básica
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Dirección: ${formatAddress(property)}`, 20, yPos);
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
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  // Centrar y dar formato al texto del footer
  const footerY = 285;
  
  // Formato más elegante para las redes sociales
  doc.setFont('helvetica', 'bold');
  const socialText = '@welldonemitigation';
  const socialWidth = doc.getStringUnitWidth(socialText) * 12 / doc.internal.scaleFactor;
  doc.text(socialText, pageWidth - 20 - socialWidth, footerY - 8);
  
  // URL del sitio web
  doc.setFont('helvetica', 'normal');
  const webText = 'www.welldonemitigation.com';
  const webWidth = doc.getStringUnitWidth(webText) * 12 / doc.internal.scaleFactor;
  doc.text(webText, pageWidth - 20 - webWidth, footerY);

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
