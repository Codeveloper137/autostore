"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el mensaje.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <section id="contacto" className="scroll-mt-24 border-t border-border bg-muted/20 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Contacto</p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">¿En qué podemos ayudarte?</h2>
          <p className="text-sm text-muted-foreground">
            Déjanos tus datos y un asesor se pondrá en contacto contigo lo antes posible.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="mx-auto mt-10 max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contact-name">Nombre completo</Label>
              <Input
                id="contact-name"
                name="fullName"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Correo electrónico</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Teléfono (opcional)</Label>
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 …"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Mensaje</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos qué vehículo te interesa o en qué podemos asesorarte."
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {status === "success" ? (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.
            </p>
          ) : null}
          <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden />
                Enviar mensaje
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
