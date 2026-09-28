import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  gameOwners,
  games,
  people,
  playParticipants,
  plays,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const monthNumbers: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseFrenchDate(value: string) {
  const match = normalize(value.trim()).match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (!match || monthNumbers[match[2]] === undefined) return null;
  return new Date(
    Number(match[3]),
    monthNumbers[match[2]],
    Number(match[1]),
    20,
    0,
    0,
  );
}

function parseLinkedValue(line: string) {
  const value = line.trim();
  const linked = value.match(/^(.*?)\s*\((https?:\/\/[^)]+)\)\s*$/);
  return { label: (linked?.[1] ?? value).trim(), url: linked?.[2] ?? null };
}

function parseLinkedValues(line: string) {
  const values = [...line.matchAll(/([^,(]+?)\s*\((https?:\/\/[^)]+)\)/g)]
    .map((match) => ({ label: match[1].trim(), url: match[2] }))
    .filter((value) => value.label);
  if (values.length) return values;
  return line
    .split(",")
    .map((value) => parseLinkedValue(value))
    .filter((value) => value.label);
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") index += 1;
      row.push(value.trim());
      value = "";
      if (row.some((cell) => cell)) rows.push(row);
      row = [];
    } else value += character;
  }
  if (value || row.length) {
    row.push(value.trim());
    if (row.some((cell) => cell)) rows.push(row);
  }
  return rows;
}

function parseDuration(value: string) {
  const values = [...value.matchAll(/(\d+)\s*h\s*(\d+)?/gi)].map(
    (match) => Number(match[1]) * 60 + Number(match[2] ?? 0),
  );
  if (!values.length) return null;
  return Math.round(
    values.reduce((sum, minutes) => sum + minutes, 0) / values.length,
  );
}

function parseOwners(value: string) {
  return [
    ...value.matchAll(
      /(?:^|,\s*)([^,(]+?)(?:\s*\(https?:\/\/[^)]+\))?(?=,\s*|$)/g,
    ),
  ]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

async function importGamesCsv(content: string) {
  const rows = parseCsv(content);
  const header = rows
    .shift()
    ?.map((value, index) =>
      normalize(index === 0 ? value.replace(/^\uFEFF/, "") : value),
    );
  if (
    !header ||
    header[0] !== "nom" ||
    header[1] !== "etiquettes" ||
    header[2] !== "note bgg" ||
    header[3] !== "possesseur" ||
    header[4] !== "duree"
  ) {
    throw new Error(
      "Le CSV doit contenir les colonnes Nom, Étiquettes, Note BGG, Possesseur et Durée.",
    );
  }
  let imported = 0;
  let skipped = 0;
  const issues: string[] = [];
  for (const cells of rows) {
    const title = cells[0]?.trim();
    if (!title) {
      skipped += 1;
      continue;
    }
    const categories = (cells[1] ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const bggRating = cells[2]?.trim();
    const owners = parseOwners(cells[3] ?? "");
    try {
      await db.transaction(async (tx) => {
        let [game] = await tx
          .select()
          .from(games)
          .where(eq(games.title, title))
          .limit(1);
        const notes = bggRating ? `Note BGG : ${bggRating}` : null;
        if (!game) {
          [game] = await tx
            .insert(games)
            .values({
              title,
              categories,
              playingTime: parseDuration(cells[4] ?? ""),
              notes,
            })
            .returning();
        } else if (
          !game.categories.length ||
          !game.playingTime ||
          (!game.notes && notes)
        ) {
          [game] = await tx
            .update(games)
            .set({
              categories: game.categories.length ? game.categories : categories,
              playingTime: game.playingTime ?? parseDuration(cells[4] ?? ""),
              notes: game.notes ?? notes,
              updatedAt: new Date(),
            })
            .where(eq(games.id, game.id))
            .returning();
        }
        for (const ownerName of owners) {
          let [person] = await tx
            .select()
            .from(people)
            .where(eq(people.name, ownerName))
            .limit(1);
          if (!person)
            [person] = await tx
              .insert(people)
              .values({ name: ownerName })
              .returning();
          await tx
            .insert(gameOwners)
            .values({ gameId: game.id, personId: person.id })
            .onConflictDoNothing();
        }
      });
      imported += 1;
    } catch {
      skipped += 1;
      if (issues.length < 8) issues.push(title);
    }
  }
  return { imported, skipped, issues };
}

async function importPlaysCsv(content: string) {
  const rows = parseCsv(content);
  const header = rows
    .shift()
    ?.map((value, index) =>
      normalize(index === 0 ? value.replace(/^\uFEFF/, "") : value),
    );
  if (
    !header ||
    header.slice(0, 7).join(",") !==
      "titre,date,lieu,notes,personne,jeu,gagnant"
  ) {
    throw new Error(
      "Le CSV doit contenir les colonnes Titre, Date, Lieu, Notes, Personne, Jeu et Gagnant.",
    );
  }
  let imported = 0;
  let skipped = 0;
  const issues: string[] = [];
  for (const cells of rows) {
    const playedAt = parseFrenchDate(cells[1] ?? "");
    const gameValues = parseLinkedValues(cells[5] ?? "");
    const participantNames = parseOwners(cells[4] ?? "");
    const winnerNames = parseOwners(cells[6] ?? "");
    if (!playedAt || !gameValues.length || !participantNames.length) {
      skipped += 1;
      if (issues.length < 8)
        issues.push(cells[0] || gameValues[0]?.label || "Ligne inconnue");
      continue;
    }
    try {
      await db.transaction(async (tx) => {
        for (const gameValue of gameValues) {
          let [game] = await tx
            .select()
            .from(games)
            .where(eq(games.title, gameValue.label))
            .limit(1);
          if (!game) {
            [game] = await tx
              .insert(games)
              .values({
                title: gameValue.label,
                notes: gameValue.url ? `Fiche Notion : ${gameValue.url}` : null,
              })
              .returning();
          }
          const [play] = await tx
            .insert(plays)
            .values({
              gameId: game.id,
              playedAt,
              location:
                parseLinkedValue(cells[2] ?? "").label || "Lieu non renseigné",
              notes: cells[3]?.trim() || null,
              groupWon: game.cooperative
                ? winnerNames.length
                  ? true
                  : null
                : null,
              importSource: "notion-csv",
            })
            .returning();
          for (const name of participantNames) {
            let [person] = await tx
              .select()
              .from(people)
              .where(eq(people.name, name))
              .limit(1);
            if (!person)
              [person] = await tx.insert(people).values({ name }).returning();
            await tx.insert(playParticipants).values({
              playId: play.id,
              personId: person.id,
              isWinner: winnerNames.includes(name),
            });
          }
        }
      });
      imported += gameValues.length;
    } catch {
      skipped += gameValues.length;
      if (issues.length < 8) issues.push(cells[0] || gameValues[0].label);
    }
  }
  return { imported, skipped, issues };
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Sélectionnez un fichier CSV exporté depuis Notion." },
        { status: 400 },
      );
    }
    const content = await file.text();
    const firstHeader = parseCsv(content)[0]?.map((value, index) =>
      normalize(index === 0 ? value.replace(/^\uFEFF/, "") : value),
    );
    const result =
      firstHeader?.[0] === "titre"
        ? await importPlaysCsv(content)
        : await importGamesCsv(content);
    return NextResponse.json({
      ...result,
      kind: firstHeader?.[0] === "titre" ? "plays" : "games",
    });
  } catch {
    return NextResponse.json(
      { error: "Le fichier CSV n’a pas pu être lu." },
      { status: 400 },
    );
  }
}
