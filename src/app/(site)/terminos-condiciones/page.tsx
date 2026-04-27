import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Auto Store Motors.",
};

export default function TerminosPage() {
  const updated = "22 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Términos y condiciones</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {updated}</p>
      </div>

      <div className="space-y-8">

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">1. Aceptación de los términos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Al acceder y utilizar el sitio web de <strong className="text-foreground">Auto Store Motors</strong>,
            usted acepta quedar vinculado por estos términos y condiciones. Si no está de acuerdo
            con alguno de ellos, le pedimos que no utilice nuestro sitio.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">2. Descripción del servicio</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Auto Store Motors es un concesionario de vehículos nuevos y usados que ofrece a través
            de este sitio web un catálogo informativo de su inventario disponible, así como canales
            de contacto para consultas y asesoría. La publicación de un vehículo en el sitio no
            constituye una oferta vinculante de venta.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">3. Precios y disponibilidad</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Los precios publicados en el sitio son orientativos y están sujetos a cambio sin previo
            aviso. La disponibilidad de los vehículos puede variar. Auto Store Motors no se
            responsabiliza por errores tipográficos en precios o especificaciones técnicas.
            El precio definitivo y las condiciones de venta se acordarán directamente con un asesor.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">4. Uso del sitio</h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            Usted se compromete a utilizar este sitio únicamente para fines lícitos y de acuerdo
            con estos términos. Queda expresamente prohibido:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Utilizar el sitio para enviar comunicaciones no solicitadas (spam).</li>
            <li>Intentar acceder sin autorización a las áreas administrativas.</li>
            <li>Reproducir o distribuir el contenido del sitio sin autorización escrita.</li>
            <li>Realizar cualquier acción que pueda comprometer la seguridad del sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">5. Cuentas de usuario</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Si crea una cuenta en nuestro sitio, es responsable de mantener la confidencialidad
            de sus credenciales y de todas las actividades realizadas bajo su cuenta. Notifíquenos
            inmediatamente si sospecha de uso no autorizado de su cuenta.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">6. Propiedad intelectual</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todo el contenido de este sitio web —incluyendo textos, imágenes, logotipos y diseño—
            es propiedad de Auto Store Motors o de sus respectivos titulares, y está protegido por
            las leyes de propiedad intelectual colombianas e internacionales.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">7. Limitación de responsabilidad</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Auto Store Motors no será responsable por daños directos, indirectos o consecuentes
            derivados del uso o imposibilidad de uso de este sitio web. El sitio se ofrece
            "tal cual" sin garantías de disponibilidad ininterrumpida.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">8. Ley aplicable y jurisdicción</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier
            controversia derivada de su interpretación o aplicación se someterá a los jueces y
            tribunales competentes de Colombia.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">9. Modificaciones</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Los cambios entrarán en vigor desde su publicación en este sitio.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">10. Contacto</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Para cualquier consulta sobre estos términos, contáctenos a través del{" "}
            <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
              formulario de contacto
            </Link>
            .
          </p>
        </section>

      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/privacidad" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Política de privacidad →
        </Link>
        <Link href="/tratamiento-datos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Tratamiento de datos →
        </Link>
      </div>
    </div>
  );
}