import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { loans } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    if (
      !body.gameId ||
      (!body.lenderId && !body.borrowerId) ||
      !body.borrowedAt
    ) {
      return NextResponse.json(
        { error: "Les informations de prêt sont incomplètes." },
        { status: 400 },
      );
    }
    const [loan] = await db
      .insert(loans)
      .values({
        gameId: Number(body.gameId),
        lenderId: body.lenderId ? Number(body.lenderId) : null,
        borrowerId: body.borrowerId ? Number(body.borrowerId) : null,
        borrowedAt: String(body.borrowedAt),
        dueAt: body.dueAt ? String(body.dueAt) : null,
        notes: String(body.notes ?? "").trim() || null,
      })
      .returning();
    return NextResponse.json({ loan }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer ce prêt." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const [loan] = await db
      .update(loans)
      .set({
        returnedAt: body.returnedAt || new Date().toISOString().slice(0, 10),
      })
      .where(eq(loans.id, Number(body.id)))
      .returning();
    return NextResponse.json({ loan });
  } catch {
    return NextResponse.json(
      { error: "Impossible de clôturer ce prêt." },
      { status: 400 },
    );
  }
}
