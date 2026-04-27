import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tratamiento de datos",
  description: "Política de tratamiento de datos personales de Auto Store Motors conforme a la Ley 1581 de 2012.",
};

export default function TratamientoDatosPage() {
  const updated = "22 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Política de tratamiento de datos personales
        </h1>
        <p className="text-sm text-muted-foreground">
          Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 — Última actualización: {updated}
        </p>
      </div>

      {/* Banner legal */}
      <div className="mb-8 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Este documento da cumplimiento al artículo 15 de la Constitución Política de Colombia
        y a la <strong className="text-foreground">Ley Estatutaria 1581 de 2012</strong> sobre
        protección de datos personales.
      </div>

      <div className="space-y-8">

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">1. Identificación del responsable</h2>
          <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-1">
            <p><strong className="text-foreground">Razón social:</strong> <span className="text-muted-foreground">Auto Store Motors</span></p>
            <p><strong className="text-foreground">Actividad:</strong> <span className="text-muted-foreground">Comercialización de vehículos nuevos y usados</span></p>
            <p><strong className="text-foreground">País:</strong> <span className="text-muted-foreground">Colombia</span></p>
            <p>
              <strong className="text-foreground">Canal de contacto:</strong>{" "}
              <Link href="/#contacto" className="text-primary underline-offset-4 hover:underline">
                Formulario de contacto
              </Link>
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">2. Datos personales tratados</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Dato</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Finalidad</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">Obligatorio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                {[
                  ["Nombre completo", "Identificación en comunicaciones", "Sí"],
                  ["Correo electrónico", "Responder consultas y notificaciones", "Sí"],
                  ["Teléfono", "Contacto directo por llamada o WhatsApp", "No"],
                  ["Contraseña (cifrada)", "Autenticación en la plataforma", "Sí (si crea cuenta)"],
                  ["Historial de navegación anónimo", "Estadísticas internas de uso", "Automático"],
                ].map(([dato, fin, ob]) => (
                  <tr key={dato}>
                    <td className="px-4 py-2 font-medium text-foreground">{dato}</td>
                    <td className="px-4 py-2">{fin}</td>
                    <td className="px-4 py-2">{ob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">3. Principios aplicables</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            El tratamiento de datos se rige por los siguientes principios establecidos en la Ley 1581:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Legalidad", desc: "El tratamiento se ajusta a las disposiciones legales vigentes." },
              { title: "Finalidad", desc: "Los datos se recopilan con propósitos determinados, explícitos y legítimos." },
              { title: "Libertad", desc: "El tratamiento solo se realiza con el consentimiento previo del titular." },
              { title: "Veracidad", desc: "Los datos deben ser verídicos, completos y actualizados." },
              { title: "Transparencia", desc: "El titular puede conocer la información sobre el tratamiento de sus datos." },
              { title: "Seguridad", desc: "Se adoptan medidas técnicas para proteger los datos contra accesos no autorizados." },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">4. Derechos del titular (ARCO)</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Conforme al artículo 8 de la Ley 1581 de 2012, usted tiene los siguientes derechos:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              ["Acceso", "Conocer qué datos personales suyos estamos tratando."],
              ["Rectificación", "Solicitar la corrección de datos inexactos o incompletos."],
              ["Supresión", "Pedir la eliminación de sus datos cuando no sean necesarios."],
              ["Oposición", "Negarse al tratamiento cuando exista una causa legítima."],
              ["Revocación", "Retirar el consentimiento otorgado en cualquier momento."],
              ["Queja", "Presentar reclamaciones ante la Superintendencia de Industria y Comercio (SIC)."],
            ].map(([right, desc]) => (
              <li key={right} className="flex gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground" />
                <span><strong className="text-foreground">{right}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Para ejercer estos derechos, envíe su solicitud a través del{" "}
            <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
              formulario de contacto
            </Link>
            {" "}indicando: nombre completo, tipo y número de documento, y el derecho que desea ejercer.
            Responderemos en un plazo máximo de <strong className="text-foreground">15 días hábiles</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">5. Transferencia y transmisión</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Auto Store Motors no realiza transferencias internacionales de datos personales.
            Los datos pueden ser transmitidos a proveedores tecnológicos que actúan como encargados
            del tratamiento (alojamiento web, servicios de correo electrónico), quienes están
            obligados contractualmente a garantizar niveles adecuados de protección.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">6. Vigencia</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Esta política rige a partir de su fecha de publicación. Los datos personales se
            conservarán mientras persista la finalidad que justificó su recopilación o hasta
            que el titular ejerza su derecho de supresión, lo que ocurra primero.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">7. Autoridad de control</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Si considera que sus derechos han sido vulnerados, puede presentar una queja ante la{" "}
            <strong className="text-foreground">
              Superintendencia de Industria y Comercio (SIC)
            </strong>
            {" "}a través de{" "}
            <a
              href="https://www.sic.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              www.sic.gov.co
            </a>
            .
          </p>
        </section>

      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/privacidad" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Política de privacidad →
        </Link>
        <Link href="/terminos" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Términos y condiciones →
        </Link>
      </div>
    </div>
  );
}