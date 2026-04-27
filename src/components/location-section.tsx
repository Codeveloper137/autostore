import { MapPin, Clock, Phone } from "lucide-react";

export function LocationSection() {
  return (
    <section className="w-full bg-background py-12 border-t">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold mb-8">Visita nuestra sede</h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Información de Contacto */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-semibold">Dirección</h3>
                <p className="text-muted-foreground">Tu dirección física aquí, Ciudad, País</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-semibold">Horario</h3>
                <p className="text-muted-foreground">Lunes a Sábado: 9:00 a.m. – 6:00 p.m.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-muted-foreground">+57 300 000 0000</p>
              </div>
            </div>
          </div>

          {/* Mapa embebido */}
          <div className="w-full h-80 rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4718.67059846478!2d-74.808273!3d10.9049313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef5d3971e4b47b3%3A0xd5d34c2caaa4918e!2sIndexArts!5e1!3m2!1ses-419!2sus!4v1777308641416!5m2!1ses-419!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}