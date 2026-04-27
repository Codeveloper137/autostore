import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Auto Store Motors.",
};

export default function PrivacidadPage() {
  const updated = "22 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Política de privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {updated}</p>
      </div>

      <div className="prose prose-sm max-w-none text-foreground dark:prose-invert space-y-8">

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">1. Responsable del tratamiento</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Auto Store Motors</strong> es el responsable del
            tratamiento de los datos personales que usted nos proporciona a través de nuestro sitio
            web <strong>autostoremotors.com</strong> y sus formularios de contacto.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">2. Datos que recopilamos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            Recopilamos los siguientes datos personales únicamente cuando usted los proporciona
            voluntariamente:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono (opcional)</li>
            <li>Mensajes o consultas enviadas a través del formulario de contacto</li>
            <li>Datos de autenticación si crea una cuenta (contraseña almacenada de forma cifrada)</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            También recopilamos datos de navegación anónimos (páginas visitadas, vehículos consultados)
            con fines estadísticos internos, sin identificar al usuario individualmente.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">3. Finalidad del tratamiento</h2>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Responder a sus consultas y solicitudes de información sobre vehículos.</li>
            <li>Gestionar su cuenta de usuario si decide registrarse.</li>
            <li>Enviarle comunicaciones relacionadas con sus consultas previas.</li>
            <li>Mejorar nuestros servicios mediante análisis estadístico de uso del sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">4. Base legal</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El tratamiento de sus datos se realiza con base en su consentimiento libre e informado,
            otorgado al completar y enviar cualquier formulario de este sitio web, de acuerdo con
            la <strong className="text-foreground">Ley 1581 de 2012</strong> y el
            <strong className="text-foreground"> Decreto 1377 de 2013</strong> de la República de Colombia.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">5. Conservación de los datos</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sus datos se conservarán mientras sea necesario para la finalidad para la que fueron
            recopilados, o hasta que usted solicite su eliminación. Los mensajes de contacto se
            conservan por un período máximo de 2 años.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">6. Compartición con terceros</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            No vendemos, arrendamos ni compartimos sus datos personales con terceros para fines
            comerciales. Únicamente los compartimos con proveedores de servicios técnicos
            (alojamiento web, correo electrónico) bajo contratos de confidencialidad, y cuando
            sea requerido por autoridades competentes conforme a la ley colombiana.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">7. Sus derechos (ARCO)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            De acuerdo con la Ley 1581 de 2012, usted tiene derecho a:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li><strong className="text-foreground">Acceder</strong> a sus datos personales.</li>
            <li><strong className="text-foreground">Rectificar</strong> datos incorrectos o incompletos.</li>
            <li><strong className="text-foreground">Cancelar</strong> el tratamiento de sus datos.</li>
            <li><strong className="text-foreground">Oponerse</strong> al tratamiento en ciertos supuestos.</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Para ejercer estos derechos, escríbanos a través del{" "}
            <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
              formulario de contacto
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">8. Seguridad</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Implementamos medidas técnicas y organizativas para proteger sus datos contra acceso
            no autorizado, pérdida o destrucción. Las contraseñas se almacenan cifradas mediante
            bcrypt y nunca en texto plano.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">9. Cambios en esta política</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nos reservamos el derecho de actualizar esta política cuando sea necesario.
            La fecha de última actualización siempre estará visible al inicio de este documento.
          </p>
        </section>

      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/terminos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Términos y condiciones →
        </Link>
        <Link href="/tratamiento-datos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Tratamiento de datos →
        </Link>
      </div>
    </div>
  );
}