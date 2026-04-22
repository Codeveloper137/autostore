"use client";

import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VehicleRow } from "@/components/admin/vehicle-form-dialog";
import { formatVehiclePrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type { VehicleRow };

type VehiclesTableProps = {
  vehicles: VehicleRow[];
  onEdit?: (vehicle: VehicleRow) => void;
  onArchive?: (vehicle: VehicleRow) => void;
};

export function VehiclesTable({ vehicles, onEdit, onArchive }: VehiclesTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-18">Foto</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead className="hidden lg:table-cell">Inventario</TableHead>
            <TableHead>Año</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-13 text-right">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => {
            const thumb = v.imageUrls[0];
            const label = `${v.brand.name} ${v.model.name}`;
            return (
              <TableRow key={v.id} className="group">
                <TableCell>
                  <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium leading-tight">{v.title}</span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {v.stockCode ?? "—"}
                </TableCell>
                <TableCell className="tabular-nums">{v.year}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatVehiclePrice(v.priceAmount, v.currency)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {v.archivedAt ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Archivado
                      </Badge>
                    ) : null}
                    {v.published ? (
                      <Badge variant="secondary">Publicado</Badge>
                    ) : (
                      <Badge variant="outline">Borrador</Badge>
                    )}
                    {v.featured ? <Badge variant="default">Destacado</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "opacity-60 group-hover:opacity-100",
                      )}
                      aria-label="Acciones"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onEdit?.(v)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          className={v.archivedAt ? "" : "text-destructive"}
                          onClick={() => {
                            const action = v.archivedAt ? "restaurar" : "archivar";
                            if (window.confirm(`¿Seguro que deseas ${action} este vehículo?`)) {
                              onArchive?.(v);
                            }
                          }}
                        >
                          {v.archivedAt ? "Restaurar" : "Archivar"}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
