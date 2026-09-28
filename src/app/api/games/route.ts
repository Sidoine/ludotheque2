import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { gameOwners, games } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function optionalNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOwnerIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: unknown) => optionalNumber(item))
    .filter((id: number | null): id is number => id !== null)
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    if (!title)
      return NextResponse.json(
        { error: "Le nom du jeu est obligatoire." },
        { status: 400 },
      );

    const created = await db.transaction(async (tx) => {
      const [game] = await tx
        .insert(games)
        .values({
          title,
          imageUrl: String(body.imageUrl ?? "").trim() || null,
          bggId: String(body.bggId ?? "").trim() || null,
          bggUrl: String(body.bggUrl ?? "").trim() || null,
          year: optionalNumber(body.year),
          minPlayers: optionalNumber(body.minPlayers),
          maxPlayers: optionalNumber(body.maxPlayers),
          playingTime: optionalNumber(body.playingTime),
          complexity: optionalNumber(body.complexity)?.toFixed(2) ?? null,
          categories: Array.isArray(body.categories)
            ? body.categories
                .map(String)
                .map((item: string) => item.trim())
                .filter(Boolean)
            : String(body.categories ?? "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
          cooperative: Boolean(body.cooperative),
          forSale: Boolean(body.forSale),
          salePrice: optionalNumber(body.salePrice)?.toFixed(2) ?? null,
          notes: String(body.notes ?? "").trim() || null,
        })
        .returning();

      const ownerIds: number[] = Array.isArray(body.ownerIds)
        ? parseOwnerIds(body.ownerIds)
        : [optionalNumber(body.ownerId)].filter(
            (id): id is number => id !== null,
          );
      if (ownerIds.length) {
        await tx.insert(gameOwners).values(
          ownerIds.map((personId) => ({
            gameId: game.id,
            personId,
            ownershipType: String(body.ownershipType ?? "owned"),
          })),
        );
      }
      return game;
    });

    return NextResponse.json({ game: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("unique")
        ? "Ce jeu existe déjà dans votre ludothèque."
        : "Impossible d’enregistrer ce jeu.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!id)
      return NextResponse.json({ error: "Jeu introuvable." }, { status: 400 });

    const update: Partial<typeof games.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title)
        return NextResponse.json(
          { error: "Le nom du jeu est obligatoire." },
          { status: 400 },
        );
      update.title = title;
    }
    if (body.imageUrl !== undefined)
      update.imageUrl = String(body.imageUrl).trim() || null;
    if (body.bggId !== undefined)
      update.bggId = String(body.bggId).trim() || null;
    if (body.bggUrl !== undefined)
      update.bggUrl = String(body.bggUrl).trim() || null;
    if (body.year !== undefined) update.year = optionalNumber(body.year);
    if (body.minPlayers !== undefined)
      update.minPlayers = optionalNumber(body.minPlayers);
    if (body.maxPlayers !== undefined)
      update.maxPlayers = optionalNumber(body.maxPlayers);
    if (body.playingTime !== undefined)
      update.playingTime = optionalNumber(body.playingTime);
    if (body.complexity !== undefined)
      update.complexity = optionalNumber(body.complexity)?.toFixed(2) ?? null;
    if (body.categories !== undefined) {
      update.categories = Array.isArray(body.categories)
        ? body.categories
            .map(String)
            .map((item: string) => item.trim())
            .filter(Boolean)
        : String(body.categories)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    if (typeof body.cooperative === "boolean")
      update.cooperative = body.cooperative;
    if (typeof body.forSale === "boolean") update.forSale = body.forSale;
    if (body.salePrice !== undefined)
      update.salePrice = optionalNumber(body.salePrice)?.toFixed(2) ?? null;
    if (body.notes !== undefined)
      update.notes = String(body.notes).trim() || null;

    const game = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(games)
        .set(update)
        .where(eq(games.id, id))
        .returning();
      if (!updated) return undefined;
      if (Array.isArray(body.ownerIds)) {
        const ownerIds = parseOwnerIds(body.ownerIds);
        await tx.delete(gameOwners).where(eq(gameOwners.gameId, id));
        if (ownerIds.length) {
          await tx.insert(gameOwners).values(
            ownerIds.map((personId) => ({
              gameId: id,
              personId,
              ownershipType: "owned",
            })),
          );
        }
      }
      return updated;
    });
    if (!game)
      return NextResponse.json({ error: "Jeu introuvable." }, { status: 404 });
    return NextResponse.json({ game });
  } catch {
    return NextResponse.json(
      { error: "Impossible de modifier ce jeu." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id)
      return NextResponse.json({ error: "Jeu introuvable." }, { status: 400 });
    const [deleted] = await db
      .delete(games)
      .where(eq(games.id, id))
      .returning({ id: games.id, title: games.title });
    if (!deleted)
      return NextResponse.json({ error: "Jeu introuvable." }, { status: 404 });
    return NextResponse.json({ game: deleted });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer ce jeu." },
      { status: 400 },
    );
  }
}
