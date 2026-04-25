"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, RotateCcw, ShieldOff, UserX } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type UserRow = {
  id: string; name: string | null; email: string | null;
  role: "ADMIN" | "CLIENT"; image: string | null; createdAt: string;
  bannedAt: string | null; archivedAt: string | null;
  accounts: { provider: string }[];
};

async function fetchUsers(): Promise<UserRow[]> {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
}

function UserInitials({ name, email }: { name: string | null; email: string | null }) {
  const t = name ?? email ?? "?";
  const i = t.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">{i}</div>
  );
}

function CreateUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) { setError(d.error ?? "Error"); return; }
      setOpen(false); setName(""); setEmail(""); setPassword(""); setRole("CLIENT");
      onCreated();
    } finally { setPending(false); }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <Plus className="size-4" /> Nuevo usuario
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Crear usuario</DialogTitle></DialogHeader>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="u-name">Nombre</Label>
              <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">Correo</Label>
              <Input id="u-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-pw">Contraseña</Label>
              <Input id="u-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "CLIENT")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Cliente</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>{pending ? "Creando…" : "Crear usuario"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers });
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const patch = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Error");
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Clientes y administradores registrados.</p>
        </div>
        <CreateUserDialog onCreated={invalidate} />
      </div>

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
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{data?.length ?? 0}</span> usuario{data?.length === 1 ? "" : "s"}
          </p>
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((u) => {
                  const isBanned = Boolean(u.bannedAt);
                  const isArchived = Boolean(u.archivedAt);
                  const isCreds = u.accounts.length === 0;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserInitials name={u.name} email={u.email} />
                          <span className="font-medium">{u.name ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(v) => patch.mutate({ id: u.id, payload: { role: v } })}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLIENT">Cliente</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {isBanned ? <Badge variant="destructive">Baneado</Badge> : null}
                          {isArchived ? <Badge variant="outline">Archivado</Badge> : null}
                          {!isBanned && !isArchived ? <Badge variant="secondary">Activo</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm capitalize text-muted-foreground">
                        {isCreds ? "correo" : u.accounts.map((a) => a.provider).join(", ")}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon-sm" variant="ghost" title={isBanned ? "Desbanear" : "Banear"}
                            onClick={() => { if (window.confirm(`¿${isBanned ? "Desbanear" : "Banear"} a ${u.name ?? u.email}?`)) patch.mutate({ id: u.id, payload: { banned: !isBanned } }); }}>
                            <ShieldOff className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" title={isArchived ? "Restaurar" : "Archivar"}
                            onClick={() => { if (window.confirm(`¿${isArchived ? "Restaurar" : "Archivar"} a ${u.name ?? u.email}?`)) patch.mutate({ id: u.id, payload: { archived: !isArchived } }); }}>
                            {isArchived ? <RotateCcw className="size-4" /> : <UserX className="size-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}