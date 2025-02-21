
import JSZip from 'jszip';
import { supabase } from "@/integrations/supabase/client";

interface Property {
  propertyId: string;
}

export const downloadPropertyReports = async (
  properties: Property[], 
  onProgress: (progress: number) => void
): Promise<Blob | null> => {
  try {
    const zip = new JSZip();
    // Multiplicamos por 2 porque ahora descargamos 2 archivos por propiedad
    const totalFiles = properties.length * 2;
    let completedFiles = 0;

    console.log('Iniciando descarga de reportes...');

    for (const property of properties) {
      // Descargar versión en español
      const spanishReportName = `reporte_${property.propertyId}.pdf`;
      console.log(`Intentando descargar versión en español: ${spanishReportName}`);

      const { data: spanishData, error: spanishError } = await supabase.storage
        .from('reportes')
        .download(spanishReportName);

      if (spanishError) {
        console.error(`Error al descargar el reporte en español ${spanishReportName}:`, spanishError);
      } else if (spanishData) {
        zip.file(`español/${spanishReportName}`, spanishData);
        console.log(`Reporte en español ${spanishReportName} agregado al ZIP`);
      }

      completedFiles++;
      onProgress((completedFiles / totalFiles) * 100);

      // Descargar versión en inglés
      const englishReportName = `report_english_${property.propertyId}.pdf`;
      console.log(`Intentando descargar versión en inglés: ${englishReportName}`);

      const { data: englishData, error: englishError } = await supabase.storage
        .from('reportes')
        .download(englishReportName);

      if (englishError) {
        console.error(`Error al descargar el reporte en inglés ${englishReportName}:`, englishError);
      } else if (englishData) {
        zip.file(`english/${englishReportName}`, englishData);
        console.log(`Reporte en inglés ${englishReportName} agregado al ZIP`);
      }

      completedFiles++;
      onProgress((completedFiles / totalFiles) * 100);
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
