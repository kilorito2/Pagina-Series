import "server-only";
import { Resend } from "resend";
import { siteConfig } from "@/lib/config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const remitente = process.env.EMAIL_FROM ?? `${siteConfig.nombre} <no-reply@animeverse.app>`;

async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    // Sin RESEND_API_KEY configurada: no rompemos el flujo, solo lo logueamos.
    // Útil en desarrollo para copiar el link de verificación/reset a mano.
    console.log(`\n📧 [email simulado] Para: ${to}\n   Asunto: ${subject}\n${html}\n`);
    return;
  }

  await resend.emails.send({ from: remitente, to, subject, html });
}

function layoutEmail(titulo: string, cuerpoHtml: string) {
  return `
    <div style="font-family: -apple-system, Arial, sans-serif; background:#0A0A0F; padding:32px; color:#F5F5F7;">
      <div style="max-width:480px; margin:0 auto; background:#131318; border-radius:16px; padding:32px;">
        <h1 style="color:#7C3AED; font-size:20px; margin:0 0 16px;">${siteConfig.nombre}</h1>
        <h2 style="font-size:16px; margin:0 0 12px;">${titulo}</h2>
        ${cuerpoHtml}
        <p style="color:#9797A6; font-size:12px; margin-top:24px;">
          Si no fuiste vos, ignorá este email.
        </p>
      </div>
    </div>
  `;
}

export async function enviarEmailVerificacion(email: string, token: string) {
  const link = `${siteConfig.dominio}/verificar/${token}`;
  await enviarEmail({
    to: email,
    subject: `Confirmá tu cuenta de ${siteConfig.nombre}`,
    html: layoutEmail(
      "Confirmá tu email",
      `<p>Hacé click en el siguiente link para activar tu cuenta (válido por 24 horas):</p>
       <p><a href="${link}" style="color:#22D3EE;">${link}</a></p>`
    ),
  });
}

export async function enviarEmailRecuperacion(email: string, token: string) {
  const link = `${siteConfig.dominio}/restablecer/${token}`;
  await enviarEmail({
    to: email,
    subject: `Recuperar contraseña — ${siteConfig.nombre}`,
    html: layoutEmail(
      "Restablecé tu contraseña",
      `<p>Pediste restablecer tu contraseña. Este link vence en 1 hora:</p>
       <p><a href="${link}" style="color:#22D3EE;">${link}</a></p>`
    ),
  });
}
