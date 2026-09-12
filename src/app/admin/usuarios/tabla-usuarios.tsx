"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RolUsuario } from "@prisma/client";
import { Ban, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Usuario = {
  id: string;
  email: string;
  role: RolUsuario;
  baneado: boolean;
  emailVerified: Date | string | null;
  _count: { perfiles: number };
};

export function TablaUsuarios({
  usuarios,
  usuarioActualId,
}: {
  usuarios: Usuario[];
  usuarioActualId?: string;
}) {
  const router = useRouter();
  const [enCurso, setEnCurso] = useState<string | null>(null);

  async function actualizar(id: string, datos: { role?: RolUsuario; baneado?: boolean }) {
    setEnCurso(id);
    const r = await fetch(`/api/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    setEnCurso(null);
    if (!r.ok) {
      const cuerpo = await r.json().catch(() => null);
      toast.error(cuerpo?.error ?? "No pudimos actualizar el usuario.");
      return;
    }
    toast.success("Usuario actualizado");
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Perfiles</TableHead>
          <TableHead>Verificado</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => {
          const esUsuarioActual = usuario.id === usuarioActualId;
          return (
            <TableRow key={usuario.id}>
              <TableCell className="max-w-56 truncate">{usuario.email}</TableCell>
              <TableCell>
                <Select
                  value={usuario.role}
                  onValueChange={(v) => v && actualizar(usuario.id, { role: v as RolUsuario })}
                  disabled={esUsuarioActual || enCurso === usuario.id}
                >
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="MOD">MOD</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{usuario._count.perfiles}</TableCell>
              <TableCell>{usuario.emailVerified ? "Sí" : "No"}</TableCell>
              <TableCell>
                {usuario.baneado ? (
                  <Badge variant="destructive">Baneado</Badge>
                ) : (
                  <Badge variant="secondary">Activo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={esUsuarioActual || enCurso === usuario.id}
                  onClick={() => actualizar(usuario.id, { baneado: !usuario.baneado })}
                >
                  {usuario.baneado ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Desbanear
                    </>
                  ) : (
                    <>
                      <Ban className="size-4" />
                      Banear
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
