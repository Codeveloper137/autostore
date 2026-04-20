/** Enlace wa.me con mensaje prellenado (solo dígitos del número, con código de país). */
export function buildWhatsAppLink(phoneDigits: string, message: string) {
  const n = phoneDigits.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
