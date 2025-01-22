import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Documentation = () => {
  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-secondary p-8">
        <div className="container mx-auto space-y-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-primary">Documentación del Dashboard</h1>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-8 pr-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-primary">👋 ¡Bienvenido al Dashboard!</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Esta guía te ayudará a entender todas las funcionalidades disponibles en nuestro dashboard de análisis de propiedades.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">📊 Resumen General</h2>
                  <p className="text-gray-600 leading-relaxed">
                    En la parte superior encontrarás tarjetas de resumen que muestran:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li><span className="font-medium">Cantidad de potenciales leads:</span> El número total de propiedades que cumplen con los criterios de búsqueda.</li>
                    <li><span className="font-medium">Códigos ZIP mapeados:</span> La cantidad de códigos postales únicos en nuestra base de datos.</li>
                    <li><span className="font-medium">Score de propiedades:</span> Distribución de propiedades según su nivel de riesgo.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">🎯 Filtros de Búsqueda</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Puedes refinar tu búsqueda utilizando tres tipos de filtros:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li><span className="font-medium">Códigos Postales:</span> Selecciona uno o varios códigos ZIP para filtrar propiedades por ubicación.</li>
                    <li><span className="font-medium">Scores:</span> Filtra por nivel de riesgo (1: Alto, 2: Medio, 3: Bajo).</li>
                    <li><span className="font-medium">Rango de Precio Estimado:</span> Ajusta el rango de precios para encontrar propiedades dentro de tu presupuesto.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">🗺️ Mapa Interactivo</h2>
                  <p className="text-gray-600 leading-relaxed">
                    El mapa muestra todas las propiedades filtradas con las siguientes características:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Marcadores de colores según el nivel de riesgo (Rojo: Alto, Naranja: Medio, Verde: Bajo).</li>
                    <li>Al hacer clic en un marcador, verás información detallada de la propiedad.</li>
                    <li>Puedes hacer zoom y desplazarte por el mapa para explorar diferentes áreas.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">📝 Tabla de Propiedades</h2>
                  <p className="text-gray-600 leading-relaxed">
                    La tabla proporciona una vista detallada de todas las propiedades que coinciden con tus filtros:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Ordena las columnas haciendo clic en los encabezados.</li>
                    <li>Descarga los datos filtrados en formato CSV usando el botón "Descarga".</li>
                    <li>Visualiza información detallada como dirección, valor estimado, score y más.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">💡 Consejos de Uso</h2>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Combina diferentes filtros para obtener resultados más precisos.</li>
                    <li>Utiliza el mapa para una vista geográfica y la tabla para análisis detallado.</li>
                    <li>Exporta los datos para análisis adicional en otras herramientas.</li>
                    <li>Revisa regularmente los scores para identificar propiedades de alto riesgo.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardSidebar>
  );
};