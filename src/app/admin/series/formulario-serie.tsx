"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Serie } from "@prisma/client";
import { serieSchema, type SerieInput } from "@/lib/validaciones/admin";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubirImagen } from "@/components/admin/subir-imagen";
import { SerieCard } from "@/components/shared/serie-card";

type GeneroOpcion = { id: string; nombre: string };

export function FormularioSerie({
  serie,
  generosDisponibles,
  generoIdsIniciales,
  valoresIniciales,
}: {
  serie?: Serie;
  generosDisponibles: GeneroOpcion[];
  generoIdsIniciales?: string[];
  /** Prefill al crear desde el importador. Se ignora si `serie` está presente. */
  valoresIniciales?: Partial<SerieInput>;
}) {
  const router = useRouter();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [slugTocadoAMano, setSlugTocadoAMano] = useState(!!serie);

  const base = serie ?? valoresIniciales;
  const form = useForm<SerieInput>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      titulo: base?.titulo ?? "",
      tituloAlternativo: base?.tituloAlternativo ?? "",
      tituloOriginal: base?.tituloOriginal ?? "",
      slug: serie?.slug ?? (base?.titulo ? slugify(base.titulo) : ""),
      sinopsis: base?.sinopsis ?? "",
      poster: base?.poster ?? "",
      banner: base?.banner ?? "",
      anio: base?.anio ?? new Date().getFullYear(),
      estado: base?.estado ?? "EMISION",
      tipo: base?.tipo ?? "TV",
      clasificacion: base?.clasificacion ?? "PG13",
      estudio: base?.estudio ?? "",
      destacada: serie?.destacada ?? false,
      generoIds: generoIdsIniciales ?? valoresIniciales?.generoIds ?? [],
    },
  });

  async function onSubmit(datos: SerieInput) {
    setErrorGlobal(null);
    const url = serie ? `/api/admin/series/${serie.id}` : "/api/admin/series";
    const respuesta = await fetch(url, {
      method: serie ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      setErrorGlobal(cuerpo?.error ?? "No pudimos guardar la serie.");
      return;
    }

    toast.success(serie ? "Serie actualizada" : "Serie creada");
    const resultado = await respuesta.json();
    const idFinal = serie?.id ?? resultado.serie.id;
    router.push(`/admin/series/${idFinal}/editar`);
    router.refresh();
  }

  const valores = form.watch();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!slugTocadoAMano) {
                            form.setValue("slug", slugify(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tituloAlternativo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título alternativo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tituloOriginal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título original</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          setSlugTocadoAMano(true);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sinopsis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinopsis</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="poster"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SubirImagen etiqueta="Poster (2:3)" valor={field.value} onCambiar={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SubirImagen
                        etiqueta="Banner (16:9, opcional)"
                        valor={field.value ?? ""}
                        onCambiar={field.onChange}
                        aspecto="aspect-video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clasificación</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="anio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMISION">En emisión</SelectItem>
                        <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                        <SelectItem value="PROXIMAMENTE">Próximamente</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="OVA">OVA</SelectItem>
                        <SelectItem value="PELICULA">Película</SelectItem>
                        <SelectItem value="ESPECIAL">Especial</SelectItem>
                        <SelectItem value="ONA">ONA</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clasificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clasificación</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="PG13">PG-13</SelectItem>
                        <SelectItem value="R">R</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estudio"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Estudio</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destacada"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <FormLabel className="cursor-pointer">Destacada en el hero</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Géneros</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="generoIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {generosDisponibles.map((genero) => {
                        const marcado = field.value.includes(genero.id);
                        return (
                          <label key={genero.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={marcado}
                              onCheckedChange={(v) => {
                                field.onChange(
                                  v
                                    ? [...field.value, genero.id]
                                    : field.value.filter((id) => id !== genero.id)
                                );
                              }}
                            />
                            {genero.nombre}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {errorGlobal && <p className="text-sm text-destructive">{errorGlobal}</p>}

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : serie ? "Guardar cambios" : "Crear serie"}
          </Button>
        </form>
      </Form>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Vista previa</p>
        <div className="w-40 pointer-events-none">
          <SerieCard
            serie={{
              slug: valores.slug || "preview",
              titulo: valores.titulo || "Título de la serie",
              poster: valores.poster || "https://picsum.photos/seed/preview/400/600",
              anio: valores.anio || new Date().getFullYear(),
              tipo: valores.tipo ?? "TV",
              ratingPromedio: serie?.ratingPromedio ?? 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
