import { createHmac, timingSafeEqual } from "node:crypto";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { people } from "@/db/schema";

const cookieName = "ludotheque_admin";
const tokenLifetime = 60 * 60 * 24 * 30;

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function validSignature(value: string, signature: string) {
  const expected = sign(value);
  const actual = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actual.length === expectedBuffer.length &&
    timingSafeEqual(actual, expectedBuffer)
  );
}

function cookieValue(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.match(new RegExp(`${cookieName}=([^;]+)`))?.[1] ?? null
  );
}

export async function firstPerson() {
  return db
    .select()
    .from(people)
    .orderBy(asc(people.id))
    .limit(1)
    .then(([person]) => person ?? null);
}

export async function isAdminRequest(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !secret()) return false;
  const token = cookieValue(request);
  if (!token) return false;
  const [personId, issuedAt, signature] = token.split(".");
  const issued = Number(issuedAt);
  if (
    !personId ||
    !issuedAt ||
    !signature ||
    !Number.isInteger(issued) ||
    Date.now() - issued > tokenLifetime * 1000
  )
    return false;
  const person = await firstPerson();
  return Boolean(
    person &&
    String(person.id) === personId &&
    validSignature(`${personId}.${issuedAt}`, signature),
  );
}

export async function requireAdmin(request: Request) {
  if (await isAdminRequest(request)) return null;
  return NextResponse.json(
    { error: "Connexion administrateur requise." },
    { status: 401 },
  );
}

export async function createAdminCookie() {
  const person = await firstPerson();
  if (!person) return null;
  const value = `${person.id}.${Date.now()}`;
  return `${cookieName}=${value}.${sign(value)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${tokenLifetime}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export { cookieName };
