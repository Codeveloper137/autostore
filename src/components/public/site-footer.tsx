import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faXTwitter } from "@fortawesome/free-brands-svg-icons";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="font-heading text-sm font-semibold tracking-tight">Auto Store Motors</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Concesionario de vehículos nuevos y usados. Asesoría transparente, inventario verificado y acompañamiento
              en cada paso de tu compra.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Navegación</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
              <li><Link href="/vehiculos" className="hover:text-foreground">Catálogo de vehículos</Link></li>
              <li><Link href="/#contacto" className="hover:text-foreground">Contacto</Link></li>
              <li><Link href="/blogs" className="hover:text-foreground">Blogs</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-foreground">Sobre nosotros</Link></li>
              <li><Link href="/admin/inventory" className="hover:text-foreground">Administración</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#contacto" className="hover:text-foreground">Política de privacidad</Link></li>
              <li><Link href="/#contacto" className="hover:text-foreground">Términos y condiciones</Link></li>
              <li><Link href="/#contacto" className="hover:text-foreground">Tratamiento de datos</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Contacto</p>
            <address className="not-italic text-sm text-muted-foreground">
              <p>Horario de atención: lunes a sábado, 9:00 a.m. – 6:00 p.m.</p>
              <p className="mt-2">
                Escríbenos desde el{" "}
                <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
                  formulario de contacto
                </Link>{" "}
                o por WhatsApp.
              </p>
            </address>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Auto Store Motors. Todos los derechos reservados.</p>
          
          {/* Iconos de Redes Sociales con FontAwesome */}
          <div className="flex items-center gap-4">
            <Link href="https://facebook.com" target="_blank" className="hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
            </Link>
            <Link href="https://x.com" target="_blank" className="hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
            </Link>
          </div>

          <p className="sm:text-right">Precios y disponibilidad sujetos a cambio sin previo aviso.</p>
        </div>
      </div>
    </footer>
  );
}