"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Profile, TemaPerfil } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { perfilSchema, type PerfilInput } from "@/lib/validaciones/perfil";
import { AVATARES_DISPONIBLES, AVATAR_POR_DEFECTO } from "@/lib/avatares";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const TEMA_A_NEXT_THEMES: Record<TemaPerfil, string> = {
  CLARO: "light",
  OSCURO: "dark",
  SISTEMA: "system",
};

export function FormularioPerfil({
  perfil,
  redirigirA = "/perfiles",
}: {
  perfil?: Profile;
  redirigirA?: string;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const form = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: perfil?.nombre ?? "",
      avatar: perfil?.avatar ?? AVATAR_POR_DEFECTO,
      idiomaPreferido: perfil?.idiomaPreferido ?? "SUB",
      calidadPorDefecto: perfil?.calidadPorDefecto ?? "P1080",
      autoplay: perfil?.autoplay ?? true,
      esInfantil: perfil?.esInfantil ?? false,
      tema: perfil?.tema ?? "SISTEMA",
      notificacionesActivas: perfil?.notificacionesActivas ?? true,
    },
  });

  async function onSubmit(datos: PerfilInput) {
    setErrorGlobal(null);
    const url = perfil ? `/api/perfiles/${perfil.id}` : "/api/perfiles";
    const respuesta = await fetch(url, {
      method: perfil ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      setErrorGlobal(cuerpo?.error ?? "No pudimos guardar el perfil.");
      return;
    }

    setTheme(TEMA_A_NEXT_THEMES[datos.tema]);
    router.push(redirigirA);
    router.refresh();
  }

  async function eliminar() {
    if (!perfil) return;
    setEliminando(true);
    const respuesta = await fetch(`/api/perfiles/${perfil.id}`, { method: "DELETE" });
    if (respuesta.ok) {
      router.push("/perfiles");
      router.refresh();
    } else {
      setEliminando(false);
      setErrorGlobal("No pudimos eliminar el perfil.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {AVATARES_DISPONIBLES.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => field.onChange(url)}
                      className={cn(
                        "relative size-14 overflow-hidden rounded-lg ring-2 ring-transparent transition hover:ring-primary/60",
                        field.value === url && "ring-primary"
                      )}
                    >
                      <Image src={url} alt="" fill sizes="56px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del perfil" maxLength={20} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="idiomaPreferido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma preferido</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SUB">Subtitulado</SelectItem>
                    <SelectItem value="DUB">Doblado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calidadPorDefecto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calidad por defecto</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="P480">480p</SelectItem>
                    <SelectItem value="P720">720p</SelectItem>
                    <SelectItem value="P1080">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SISTEMA">Sistema</SelectItem>
                  <SelectItem value="OSCURO">Oscuro</SelectItem>
                  <SelectItem value="CLARO">Claro</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoplay"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <FormLabel className="cursor-pointer">Reproducir siguiente episodio automáticamente</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="esInfantil"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <FormLabel className="cursor-pointer">
                Perfil infantil (solo contenido apto para todo público)
              </FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificacionesActivas"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <FormLabel className="cursor-pointer">
                Notificarme de episodios nuevos
              </FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {errorGlobal && <p className="text-sm text-destructive">{errorGlobal}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          {perfil && (
            <Button
              type="button"
              variant="destructive"
              disabled={eliminando}
              onClick={eliminar}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
