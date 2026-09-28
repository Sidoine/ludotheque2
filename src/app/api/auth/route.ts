import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { cookieName, createAdminCookie, isAdminRequest } from "@/lib/auth";

function sameSecret(value: string, expected: string) {
  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  return NextResponse.json({
    configured: Boolean(process.env.ADMIN_PASSWORD),
    authenticated: await isAdminRequest(request),
    name: process.env.ADMIN_NAME || "Sidoine",
  });
}

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password)
    return NextResponse.json(
      { error: "ADMIN_PASSWORD n’est pas configuré." },
      { status: 503 },
    );
  const body = await request.json().catch(() => ({}));
  if (
    typeof body.password !== "string" ||
    !sameSecret(body.password, password)
  ) {
    return NextResponse.json(
      { error: "Mot de passe administrateur invalide." },
      { status: 401 },
    );
  }
  const cookie = await createAdminCookie();
  if (!cookie)
    return NextResponse.json(
      { error: "Aucun utilisateur administrateur n’est disponible." },
      { status: 503 },
    );
  const response = NextResponse.json({
    authenticated: true,
    name: process.env.ADMIN_NAME || "Sidoine",
  });
  response.headers.set("Set-Cookie", cookie);
  return response;
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request)))
    return NextResponse.json({ authenticated: false });
  const response = NextResponse.json({ authenticated: false });
  response.headers.set(
    "Set-Cookie",
    `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
