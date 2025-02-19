import jsPDF from 'jspdf';
import { supabase } from "@/integrations/supabase/client";
import { PDFDocument } from 'pdf-lib';

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

async function getTemplateFromSupabase(): Promise<ArrayBuffer | null> {
  try {
    console.log('Intentando obtener el template desde Supabase...');
    
    // Verificar si podemos listar el contenido del bucket primero
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('pdf-templates')
      .list();

    if (bucketError) {
      console.error('Error al listar el bucket:', bucketError);
      return null;
    }

    console.log('Archivos en el bucket:', bucketFiles);

    const { data, error } = await supabase.storage
      .from('pdf-templates')
      .download('template.pdf');

    if (error) {
      console.error('Error downloading template:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        name: error.name
      });
      return null;
    }

    if (!data) {
      console.error('No se encontró el template en el bucket');
      return null;
    }

    console.log('Template encontrado, convirtiendo a ArrayBuffer...');
    const arrayBuffer = await data.arrayBuffer();
    console.log('Template convertido exitosamente');
    return arrayBuffer;
  } catch (error) {
    console.error('Error in getTemplateFromSupabase:', error);
    return null;
  }
}

export const generatePropertyPDF = async (property: Property): Promise<jsPDF> => {
  // Intentar cargar el template
  console.log('Iniciando generación de PDF...');
  const templateBuffer = await getTemplateFromSupabase();
  
  if (!templateBuffer) {
    console.log('No se pudo cargar el template, usando generación estándar del PDF');
    return generateStandardPDF(property);
  }

  console.log('Template cargado correctamente, procediendo a generar PDF con template...');

  try {
    // Cargar el PDF template usando pdf-lib
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Obtener las dimensiones de la página
    const { width, height } = firstPage.getSize();
    
    // Definir posiciones para el contenido (ajustar según tu template)
    const contentY = height - 200; // Ajusta según donde quieras que comience el contenido
    
    // Agregar el contenido al template
    firstPage.drawText(formatAddress(property), {
      x: 50,
      y: contentY,
      size: 12,
    });

    firstPage.drawText(`Propietario: ${property.owner_fullName || 'N/A'}`, {
      x: 50,
      y: contentY - 20,
      size: 12,
    });

    // Agregar información de ráfagas
    let gustY = contentY - 60;
    if (property.top_gust_1) {
      firstPage.drawText(`1. ${property.top_gust_1} mph (${new Date(property.top_gust_1_date!).toLocaleDateString()})`, {
        x: 50,
        y: gustY,
        size: 12,
      });
      gustY -= 20;
    }
    if (property.top_gust_2) {
      firstPage.drawText(`2. ${property.top_gust_2} mph (${new Date(property.top_gust_2_date!).toLocaleDateString()})`, {
        x: 50,
        y: gustY,
        size: 12,
      });
      gustY -= 20;
    }
    if (property.top_gust_3) {
      firstPage.drawText(`3. ${property.top_gust_3} mph (${new Date(property.top_gust_3_date!).toLocaleDateString()})`, {
        x: 50,
        y: gustY,
        size: 12,
      });
      gustY -= 20;
    }
    if (property.top_gust_4) {
      firstPage.drawText(`4. ${property.top_gust_4} mph (${new Date(property.top_gust_4_date!).toLocaleDateString()})`, {
        x: 50,
        y: gustY,
        size: 12,
      });
      gustY -= 20;
    }
    if (property.top_gust_5) {
      firstPage.drawText(`5. ${property.top_gust_5} mph (${new Date(property.top_gust_5_date!).toLocaleDateString()})`, {
        x: 50,
        y: gustY,
        size: 12,
      });
      gustY -= 20;
    }

    // Intentar agregar la imagen de la propiedad
    try {
      const fileName = `${property.propertyId}.png`;
      const { data: imageData, error } = await supabase.storage
        .from('property-images')
        .download(fileName);

      if (!error && imageData) {
        const imageBytes = await imageData.arrayBuffer();
        const image = await pdfDoc.embedPng(imageBytes);
        
        // Calcular dimensiones de la imagen manteniendo la proporción
        const imgDims = image.scale(0.5); // Ajusta el factor de escala según necesites
        
        firstPage.drawImage(image, {
          x: (width - imgDims.width) / 2,
          y: gustY - imgDims.height - 20,
          width: imgDims.width,
          height: imgDims.height,
        });
      }
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }

    // Serializar el PDF modificado y devolverlo directamente
    const pdfBytes = await pdfDoc.save();
    
    // Crear un nuevo documento jsPDF
    const doc = new jsPDF();
    
    // Eliminar la página en blanco por defecto y agregar una nueva
    doc.addPage();
    doc.deletePage(1);
    
    // Convertir el ArrayBuffer a una cadena base64
    const base64String = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(pdfBytes))));
    
    // Agregar el PDF como una imagen
    doc.addPage();
    doc.setPage(1);
    doc.addImage('data:application/pdf;base64,' + base64String, 'JPEG', 0, 0, 210, 297);

    return doc;
  } catch (error) {
    console.error('Error procesando el PDF template:', error);
    return generateStandardPDF(property);
  }
};

// Función de respaldo que genera el PDF sin template
const generateStandardPDF = async (property: Property): Promise<jsPDF> => {
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

    // Convertir Blob a Base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageData);
    });

    // Cargar imagen
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Ajustar tamaño y posición de la imagen
        const imgWidth = 100;
        const imgHeight = (img.height * imgWidth) / img.width;
        const xPos = (pageWidth - imgWidth) / 2;
        
        doc.addImage(base64, 'PNG', xPos, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15; // Añadir espacio después de la imagen
        resolve(null);
      };
      img.onerror = reject;
      img.src = base64;
    });

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
