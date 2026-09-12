"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BotonBorrarTodo() {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);

  async function borrarTodo() {
    setBorrando(true);
    const respuesta = await fetch("/api/progreso?todo=true", { method: "DELETE" });
    setBorrando(false);
    if (!respuesta.ok) {
      toast.error("No pudimos borrar el historial.");
      return;
    }
    toast.success("Historial borrado");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm">
            <Trash2 className="size-4" />
            Borrar todo
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar todo el historial?</AlertDialogTitle>
          <AlertDialogDescription>
            Se va a borrar el progreso guardado de todos los episodios de este perfil. No se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={borrarTodo} disabled={borrando}>
            Borrar todo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
