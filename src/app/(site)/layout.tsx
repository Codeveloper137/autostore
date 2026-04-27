import { LocationSection } from "@/components/location-section";
// import { FloatingWhatsApp } from "@/components/public/floating-whatsapp";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <LocationSection/>
      <SiteFooter />
      {/* <FloatingWhatsApp /> */}
    </div>
  );
}
