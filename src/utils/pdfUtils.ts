
import JSZip from 'jszip';
import { supabase } from "@/integrations/supabase/client";

interface Property {
  propertyId: string;
}

export const downloadPropertyReports = async (properties: Property[]): Promise<Blob | null> => {
  try {
    const zip = new JSZip();

    console.log('Iniciando descarga de reportes...');

    for (const property of properties) {
      const reportName = `reporte_${property.propertyId}.pdf`;
      console.log(`Intentando descargar: ${reportName}`);

      const { data, error } = await supabase.storage
        .from('reportes')
        .download(reportName);

      if (error) {
        console.error(`Error al descargar el reporte ${reportName}:`, error);
        continue;
      }

      if (!data) {
        console.log(`No se encontró el reporte para la propiedad ${property.propertyId}`);
        continue;
      }

      zip.file(reportName, data);
      console.log(`Reporte ${reportName} agregado al ZIP`);
    }

    console.log('Generando archivo ZIP...');
    const content = await zip.generateAsync({ type: "blob" });
    console.log('ZIP generado exitosamente');

    return content;
  } catch (error) {
    console.error('Error al procesar los reportes:', error);
    return null;
  }
};
