"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validaciones/auth";
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

const MENSAJES_ERROR: Record<string, string> = {
  credenciales_invalidas: "Email o contraseña incorrectos.",
  cuenta_baneada: "Esta cuenta está suspendida.",
  demasiados_intentos: "Demasiados intentos. Esperá un minuto y volvé a probar.",
  email_no_verificado: "Todavía no confirmaste tu email.",
  CredentialsSignin: "Email o contraseña incorrectos.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [mostrarReenviar, setMostrarReenviar] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(datos: LoginInput) {
    setErrorGlobal(null);
    setMostrarReenviar(false);
    const resultado = await signIn("credentials", { ...datos, redirect: false });

    if (resultado?.error) {
      setErrorGlobal(MENSAJES_ERROR[resultado.error] ?? "No pudimos iniciar sesión.");
      setMostrarReenviar(resultado.error === "email_no_verificado");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/perfiles");
    router.refresh();
  }

  async function reenviarVerificacion() {
    await fetch("/api/auth/reenviar-verificacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.getValues("email") }),
    });
    setReenviado(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="vos@ejemplo.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Contraseña</FormLabel>
                <Link href="/recuperar" className="text-xs text-muted-foreground hover:text-primary">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {errorGlobal && (
          <div className="space-y-1.5">
            <p className="text-sm text-destructive">{errorGlobal}</p>
            {mostrarReenviar && !reenviado && (
              <button
                type="button"
                onClick={reenviarVerificacion}
                className="text-xs text-primary hover:underline"
              >
                Reenviar email de verificación
              </button>
            )}
            {reenviado && (
              <p className="text-xs text-muted-foreground">
                Te reenviamos el email si la cuenta existe. Revisá tu bandeja.
              </p>
            )}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
