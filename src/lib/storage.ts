import "server-only";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Configurado = Boolean(
  process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
);

function clienteR2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

/**
 * Genera una URL prefirmada para subir un archivo directo a R2 desde el
 * navegador (sin pasar por nuestro servidor). Devuelve también la URL
 * pública final para guardar en la base una vez subido.
 */
export async function generarUrlSubida(nombreOriginal: string, contentType: string) {
  if (!r2Configurado) {
    throw new Error("R2 no está configurado (faltan las variables R2_* en .env)");
  }
  if (!TIPOS_PERMITIDOS.includes(contentType)) {
    throw new Error("Tipo de archivo no permitido");
  }

  const extension = nombreOriginal.split(".").pop()?.toLowerCase() || "jpg";
  const key = `uploads/${randomUUID()}.${extension}`;

  const comando = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const urlSubida = await getSignedUrl(clienteR2(), comando, { expiresIn: 300 });
  const urlPublica = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { urlSubida, urlPublica };
}

export const almacenamientoDisponible = r2Configurado;
