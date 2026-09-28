import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { people } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const colors = [
  "#436F5B",
  "#C1694F",
  "#5F6F9B",
  "#B77854",
  "#766A8F",
  "#AE7A75",
];

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name)
      return NextResponse.json(
        { error: "Le prénom est obligatoire." },
        { status: 400 },
      );
    const [person] = await db
      .insert(people)
      .values({
        name,
        email: String(body.email ?? "").trim() || null,
        color: body.color || colors[Math.floor(Math.random() * colors.length)],
        isHousehold: Boolean(body.isHousehold),
      })
      .returning();
    return NextResponse.json({ person }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Cette personne existe déjà." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const id = Number(body.id);
    const name = String(body.name ?? "").trim();
    if (!id)
      return NextResponse.json(
        { error: "Personne introuvable." },
        { status: 400 },
      );
    if (!name)
      return NextResponse.json(
        { error: "Le prénom est obligatoire." },
        { status: 400 },
      );

    const [person] = await db
      .update(people)
      .set({
        name,
        email: String(body.email ?? "").trim() || null,
        isHousehold: Boolean(body.isHousehold),
      })
      .where(eq(people.id, id))
      .returning();
    if (!person)
      return NextResponse.json(
        { error: "Personne introuvable." },
        { status: 404 },
      );
    return NextResponse.json({ person });
  } catch {
    return NextResponse.json(
      { error: "Cette personne existe déjà." },
      { status: 400 },
    );
  }
}
