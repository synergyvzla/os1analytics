
import jsPDF from 'jspdf';
import { supabase } from "@/integrations/supabase/client";

interface Property {
  propertyId: string;
  address_formattedStreet: string | null;
  address_street: string | null;
  address_houseNumber: number | null;
  address_city: string | null;
  address_zip: number | null;
  address_latitude: number | null;
  address_longitude: number | null;
  valuation_estimatedValue: number | null;
  owner_fullName: string | null;
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

const formatAddress = (property: Property): string => {
  if (!property.address_street || !property.address_city || !property.address_zip) {
    return 'Dirección no disponible';
  }
  return `${property.address_street}, ${property.address_city}, FL ${property.address_zip}`;
};

export const generatePropertyPDF = async (property: Property): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageCenter = pageWidth / 2;
  
  // Agregar borde superior verde
  doc.setDrawColor(218, 242, 31);
  doc.setFillColor(218, 242, 31);
  doc.rect(0, 0, 210, 19, 'F');
  
  // Agregar footer color #EBDDCC con mayor altura
  doc.setDrawColor(235, 221, 204);
  doc.setFillColor(235, 221, 204);
  doc.rect(0, 265, 210, 32, 'F');
  
  let yPos = 35;

  // Título centrado y con fuente más profesional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const title = 'Reporte de Daño de Propiedad';
  const titleWidth = doc.getStringUnitWidth(title) * 22 / doc.internal.scaleFactor;
  doc.text(title, (pageWidth - titleWidth) / 2, yPos);
  yPos += 25;

  // Información básica con mejor espaciado
  doc.setFontSize(12);
  
  // Dirección en negrita
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const addressStart = doc.getStringUnitWidth('Dirección: ') * 12 / doc.internal.scaleFactor + 8;
  doc.text(formatAddress(property), 20 + addressStart, yPos);
  yPos += 15;

  // Propietario en negrita
  doc.setFont('helvetica', 'bold');
  doc.text('Propietario(s):', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const ownerStart = doc.getStringUnitWidth('Propietario(s): ') * 12 / doc.internal.scaleFactor + 8;
  doc.text(property.owner_fullName || 'N/A', 20 + ownerStart, yPos);
  yPos += 15;

  // Información de ráfagas con mejor formato
  doc.setFont('helvetica', 'bold');
  doc.text('Principales ráfagas de viento registradas:', 20, yPos);
  yPos += 12;
  
  doc.setFont('helvetica', 'normal');
  if (property.top_gust_1) {
    doc.text(`1. ${property.top_gust_1} mph (${new Date(property.top_gust_1_date!).toLocaleDateString()})`, 30, yPos);
    yPos += 8;
  }
  if (property.top_gust_2) {
    doc.text(`2. ${property.top_gust_2} mph (${new Date(property.top_gust_2_date!).toLocaleDateString()})`, 30, yPos);
    yPos += 8;
  }
  if (property.top_gust_3) {
    doc.text(`3. ${property.top_gust_3} mph (${new Date(property.top_gust_3_date!).toLocaleDateString()})`, 30, yPos);
    yPos += 8;
  }
  if (property.top_gust_4) {
    doc.text(`4. ${property.top_gust_4} mph (${new Date(property.top_gust_4_date!).toLocaleDateString()})`, 30, yPos);
    yPos += 8;
  }
  if (property.top_gust_5) {
    doc.text(`5. ${property.top_gust_5} mph (${new Date(property.top_gust_5_date!).toLocaleDateString()})`, 30, yPos);
    yPos += 20;
  }

  // Intentar agregar la imagen centrada primero
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

    // Ajustar tamaño y posición de la imagen
    const imgWidth = 100;
    const imgHeight = (img.height * imgWidth) / img.width;
    const xPos = (pageWidth - imgWidth) / 2;
      
    doc.addImage(base64, 'PNG', xPos, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 15; // Añadir espacio después de la imagen

    // Mensaje de contacto justo después de la imagen
    const contactMessage = 'Si está interesado en programar una inspección detallada, por favor contáctenos al 0800-458-6893';
    const emailMessage = 'o al mail: customerservice@welldonemitigation.com';
    
    doc.setFont('helvetica', 'normal');
    doc.text(contactMessage, pageCenter, yPos, { align: 'center' });
    yPos += 8;
    doc.text(emailMessage, pageCenter, yPos, { align: 'center' });

  } catch (error) {
    console.error('Error al procesar la imagen de la propiedad:', error);
    
    // Si hay error con la imagen, aún mostrar el mensaje de contacto
    const contactMessage = 'Si está interesado en programar una inspección detallada, por favor contáctenos al 0800-458-6893';
    const emailMessage = 'o al mail: customerservice@welldonemitigation.com';
    
    doc.setFont('helvetica', 'normal');
    doc.text(contactMessage, pageCenter, yPos, { align: 'center' });
    yPos += 8;
    doc.text(emailMessage, pageCenter, yPos, { align: 'center' });
  }

  // Footer con información de redes sociales
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const footerY = 285;
  
  // Formato más elegante para las redes sociales
  doc.setFont('helvetica', 'bold');
  const socialText = '@welldonemitigation';
  const webText = 'www.welldonemitigation.com';
  
  doc.text(socialText, pageCenter, footerY - 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(webText, pageCenter, footerY, { align: 'center' });

  return doc;
};
