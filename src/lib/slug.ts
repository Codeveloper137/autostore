/** Genera un slug URL seguro a partir de un texto legible. */
export function slugify(text: string) {
  const s = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "item";
}

export function categorySlug(kind: "BRAND" | "MODEL", name: string) {
  const prefix = kind === "BRAND" ? "marca" : "modelo";
  return `${prefix}-${slugify(name)}`;
}
