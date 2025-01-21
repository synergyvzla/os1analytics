import { Card, CardContent } from "@/components/ui/card";

export const AboutSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Sobre Nosotros
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Experiencia</h3>
              <p className="text-gray-600">
                Más de 15 años de experiencia en reparación y mantenimiento de techos en Orlando.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Calidad</h3>
              <p className="text-gray-600">
                Utilizamos materiales de primera calidad y las mejores prácticas de la industria.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Garantía</h3>
              <p className="text-gray-600">
                Respaldamos nuestro trabajo con garantías sólidas y servicio post-venta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};