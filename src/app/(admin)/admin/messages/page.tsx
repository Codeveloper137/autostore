"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type QuoteRow = {
  id: string; fullName: string; email: string; phone: string | null;
  message: string; status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";
  createdAt: string;
  user: { id: string; name: string | null; email: string | null } | null;
  vehicle: { id: string; title: string } | null;
};

const LABELS: Record<QuoteRow["status"], string> = {
  PENDING: "Pendiente", IN_PROGRESS: "En proceso", RESOLVED: "Resuelto", ARCHIVED: "Archivado",
};
const NEXT: Record<QuoteRow["status"], QuoteRow["status"]> = {
  PENDING: "IN_PROGRESS", IN_PROGRESS: "RESOLVED", RESOLVED: "ARCHIVED", ARCHIVED: "PENDING",
};
const BADGE_VARIANT: Record<QuoteRow["status"], "destructive" | "secondary" | "outline"> = {
  PENDING: "destructive", IN_PROGRESS: "outline", RESOLVED: "secondary", ARCHIVED: "outline",
};

async function fetchMessages(): Promise<QuoteRow[]> {
  const res = await fetch("/api/admin/messages");
  if (!res.ok) throw new Error("Error al cargar mensajes");
  return res.json();
}

// ─── Modal de detalle + respuesta ──────────────────────────────────────────

function MessageDetailDialog({
  message,
  open,
  onOpenChange,
  onStatusChange,
}: {
  message: QuoteRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStatusChange: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replying, setReplying] = useState(false);

  const patchStatus = useMutation({
    mutationFn: async (status: string) => {
      if (!message) return;
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
    },
    onSuccess: onStatusChange,
  });

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    setReplyError(null);
    setReplySuccess(false);
    setReplying(true);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), replyText: replyText.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setReplyError(data.error ?? "Error al enviar"); return; }
      setReplySuccess(true);
      setReplyText("");
      setSubject("");
      onStatusChange(); // refrescar la lista (el estado puede haber cambiado a IN_PROGRESS)
    } finally { setReplying(false); }
  }

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-4 left-1/2 flex max-h-[calc(100vh-2rem)] w-[min(100vw-2rem,42rem)] -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0">
        <div className="overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Detalle del mensaje</DialogTitle>
          </DialogHeader>

          {/* Info del remitente */}
          <div className="mt-4 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Remitente</p>
                <p className="text-sm font-medium">{message.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{message.email}</p>
              </div>
              {message.phone ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{message.phone}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-medium text-muted-foreground">Fecha</p>
                <p className="text-sm tabular-nums">
                  {new Date(message.createdAt).toLocaleDateString("es-CO", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              {message.user ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Usuario registrado</p>
                  <p className="text-sm">{message.user.name ?? message.user.email}</p>
                </div>
              ) : null}
              {message.vehicle ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Vehículo de interés</p>
                  <p className="text-sm">{message.vehicle.title}</p>
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estado</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(["PENDING", "IN_PROGRESS", "RESOLVED", "ARCHIVED"] as QuoteRow["status"][]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patchStatus.mutate(s)}
                    className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                      message.status === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mensaje completo */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Mensaje</p>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
            </div>
          </div>

          {/* Formulario de respuesta */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium">Responder por email</p>
            </div>
            <form onSubmit={(e) => void sendReply(e)} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reply-subject">Asunto (opcional)</Label>
                <Input
                  id="reply-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`Re: Tu consulta en Auto Store Motors`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reply-body">Mensaje</Label>
                <Textarea
                  id="reply-body"
                  rows={6}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Hola ${message.fullName.split(" ")[0]},\n\nGracias por contactarnos...`}
                />
              </div>
              {replyError ? (
                <p className="text-sm text-destructive">{replyError}</p>
              ) : null}
              {replySuccess ? (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Respuesta enviada correctamente a {message.email}.
                </p>
              ) : null}
              <Button type="submit" disabled={replying} className="inline-flex items-center gap-2">
                {replying ? "Enviando…" : "Enviar respuesta"}
              </Button>
            </form>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/40 px-6 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [selected, setSelected] = useState<QuoteRow | null>(null);
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: fetchMessages,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });

  const patchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
    },
    onSuccess: invalidate,
  });

  const filtered = filter === "all" ? (data ?? []) : (data ?? []).filter((m) => m.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedMessages = filtered.slice((page - 1) * perPage, page * perPage);
 
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Mensajes</h1>
        <p className="text-sm text-muted-foreground">Consultas del formulario de contacto. Haz clic en un mensaje para ver el detalle y responder.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {["all", "PENDING", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} 
          onClick={() => { setFilter(s); setPage(1); }}>
            {s === "all" ? "Todos" : LABELS[s as QuoteRow["status"]]}
            {s !== "all" && data ? (
              <span className="ml-1.5 tabular-nums opacity-70">
                {data.filter((m) => m.status === s).length}
              </span>
            ) : null}
          </Button>
        ))}
      </div>

      {/* Modal de detalle */}
      <MessageDetailDialog
        message={selected}
        open={selected !== null}
        onOpenChange={(v) => { if (!v) setSelected(null); }}
        onStatusChange={() => { invalidate(); }}
      />

      {isPending ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-4 text-destructive" />
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Remitente</TableHead>
                <TableHead>Extracto del mensaje</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción rápida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No hay mensajes con este filtro.
                  </TableCell>
                </TableRow>
              ) : pagedMessages.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(m)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{m.fullName}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-55">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{m.message}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.user ? (m.user.name ?? m.user.email ?? "—") : (
                      <span className="italic">Anónimo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={BADGE_VARIANT[m.status]}>{LABELS[m.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => patchStatus.mutate({ id: m.id, status: NEXT[m.status] })}
                    >
                      → {LABELS[NEXT[m.status]]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {filtered.length > perPage ? (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}
            </span>{" "}
            de <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm tabular-nums text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    
    </div>
  );
}