"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restablecerSchema, type RestablecerInput } from "@/lib/validaciones/auth";
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

export function RestablecerForm({ token }: { token: string }) {
  const router = useRouter();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const form = useForm<RestablecerInput>({
    resolver: zodResolver(restablecerSchema),
    defaultValues: { token, password: "", confirmarPassword: "" },
  });

  async function onSubmit(datos: RestablecerInput) {
    setErrorGlobal(null);
    const respuesta = await fetch("/api/auth/restablecer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      setErrorGlobal(cuerpo?.error ?? "No pudimos restablecer tu contraseña.");
      return;
    }

    setListo(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (listo) {
    return (
      <p className="py-4 text-center text-sm">
        Listo, ya podés{" "}
        <Link href="/login" className="text-primary hover:underline">
          iniciar sesión
        </Link>
        .
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
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
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errorGlobal && <p className="text-sm text-destructive">{errorGlobal}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </Form>
  );
}
