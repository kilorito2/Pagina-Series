"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cambiarPasswordSchema, type CambiarPasswordInput } from "@/lib/validaciones/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function FormularioCambiarPassword({ tieneContraseña }: { tieneContraseña: boolean }) {
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const form = useForm<CambiarPasswordInput>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: { passwordActual: "", passwordNueva: "", confirmarPassword: "" },
  });

  async function onSubmit(datos: CambiarPasswordInput) {
    setErrorGlobal(null);
    const respuesta = await fetch("/api/auth/cambiar-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      setErrorGlobal(cuerpo?.error ?? "No pudimos cambiar tu contraseña.");
      return;
    }

    toast.success("Contraseña actualizada");
    form.reset({ passwordActual: "", passwordNueva: "", confirmarPassword: "" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4">
        {tieneContraseña && (
          <FormField
            control={form.control}
            name="passwordActual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña actual</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="passwordNueva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña nueva</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmarPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña nueva</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errorGlobal && <p className="text-sm text-destructive">{errorGlobal}</p>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </form>
    </Form>
  );
}
