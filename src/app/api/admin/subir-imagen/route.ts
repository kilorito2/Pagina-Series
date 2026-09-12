import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin-guard";
import { generarUrlSubida } from "@/lib/storage";

const schema = z.object({
  nombreArchivo: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parseado = schema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const { urlSubida, urlPublica } = await generarUrlSubida(
      parseado.data.nombreArchivo,
      parseado.data.contentType
    );
    return NextResponse.json({ urlSubida, urlPublica });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No pudimos generar la URL de subida" },
      { status: 400 }
    );
  }
}
