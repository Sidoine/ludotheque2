import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { playParticipants, plays } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const gameId = Number(body.gameId);
    const location = String(body.location ?? "").trim();
    const participantIds: number[] = Array.isArray(body.participantIds)
      ? [
          ...new Set<number>(
            (body.participantIds as unknown[]).map(Number).filter(Boolean),
          ),
        ]
      : [];
    const winnerIds = new Set<number>(
      Array.isArray(body.winnerIds)
        ? (body.winnerIds as unknown[]).map(Number).filter(Boolean)
        : [],
    );

    if (!gameId || !body.date || !location || participantIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "Jeu, date, lieu et au moins un participant sont obligatoires.",
        },
        { status: 400 },
      );
    }

    const playedAt = new Date(`${body.date}T${body.time || "20:00"}:00`);
    if (Number.isNaN(playedAt.getTime())) {
      return NextResponse.json(
        { error: "La date est invalide." },
        { status: 400 },
      );
    }

    const play = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(plays)
        .values({
          gameId,
          playedAt,
          location,
          notes: String(body.notes ?? "").trim() || null,
          groupWon: typeof body.groupWon === "boolean" ? body.groupWon : null,
          duration: body.duration ? Number(body.duration) : null,
        })
        .returning();

      await tx.insert(playParticipants).values(
        participantIds.map((personId) => ({
          playId: created.id,
          personId,
          isWinner: winnerIds.has(personId),
          team: body.teams?.[personId] || null,
          score: body.scores?.[personId] || null,
        })),
      );
      return created;
    });

    return NextResponse.json({ play }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer cette partie." },
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
    const gameId = Number(body.gameId);
    const location = String(body.location ?? "").trim();
    const participantIds: number[] = Array.isArray(body.participantIds)
      ? [
          ...new Set<number>(
            (body.participantIds as unknown[]).map(Number).filter(Boolean),
          ),
        ]
      : [];
    const winnerIds = new Set<number>(
      Array.isArray(body.winnerIds)
        ? (body.winnerIds as unknown[]).map(Number).filter(Boolean)
        : [],
    );
    if (
      !id ||
      !gameId ||
      !body.date ||
      !location ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Jeu, date, lieu et au moins un participant sont obligatoires.",
        },
        { status: 400 },
      );
    }
    const playedAt = new Date(`${body.date}T${body.time || "20:00"}:00`);
    if (Number.isNaN(playedAt.getTime()))
      return NextResponse.json(
        { error: "La date est invalide." },
        { status: 400 },
      );

    const play = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(plays)
        .set({
          gameId,
          playedAt,
          location,
          notes: String(body.notes ?? "").trim() || null,
          groupWon: typeof body.groupWon === "boolean" ? body.groupWon : null,
          duration: body.duration ? Number(body.duration) : null,
        })
        .where(eq(plays.id, id))
        .returning();
      if (!updated) return undefined;
      await tx.delete(playParticipants).where(eq(playParticipants.playId, id));
      await tx.insert(playParticipants).values(
        participantIds.map((personId) => ({
          playId: id,
          personId,
          isWinner: winnerIds.has(personId),
          team: body.teams?.[personId] || null,
          score: body.scores?.[personId] || null,
        })),
      );
      return updated;
    });
    if (!play)
      return NextResponse.json(
        { error: "Partie introuvable." },
        { status: 404 },
      );
    return NextResponse.json({ play });
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier cette partie." },
      { status: 400 },
    );
  }
}
