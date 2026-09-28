import { NextResponse } from "next/server";

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function valueOf(xml: string, tag: string) {
  return xml.match(new RegExp(`<${tag}[^>]*value="([^"]*)"`, "i"))?.[1] ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url")?.trim() ?? "";
  const bggId = raw.match(/boardgame\/(\d+)/)?.[1] ?? raw.match(/^\d+$/)?.[0];
  if (!bggId) {
    return NextResponse.json(
      { error: "Collez une URL de fiche BGG valide." },
      { status: 400 },
    );
  }

  try {
    const bggApiToken = process.env.BGG_API_TOKEN;
    const headers: HeadersInit = {
      "User-Agent": "Ludotheque/1.0 board-game-library",
    };
    if (bggApiToken) headers.Authorization = `Bearer ${bggApiToken}`;

    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`,
      {
        headers,
        next: { revalidate: 86400 },
      },
    );
    if (response.status === 401) {
      return NextResponse.json(
        {
          error:
            "BGG demande maintenant un jeton API. Ajoutez BGG_API_TOKEN dans votre fichier .env.",
        },
        { status: 502 },
      );
    }
    if (!response.ok) throw new Error("BGG unavailable");
    const xml = await response.text();
    const primaryName = xml.match(
      /<name[^>]*type="primary"[^>]*value="([^"]+)"/i,
    )?.[1];
    if (!primaryName) throw new Error("Game not found");

    const categories = [
      ...xml.matchAll(
        /<link[^>]*type="boardgamecategory"[^>]*value="([^"]+)"/gi,
      ),
    ]
      .slice(0, 3)
      .map((match) => decodeXml(match[1]));
    const mechanics = [
      ...xml.matchAll(
        /<link[^>]*type="boardgamemechanic"[^>]*value="([^"]+)"/gi,
      ),
    ].map((match) => decodeXml(match[1]));
    const image = xml.match(/<image>(.*?)<\/image>/i)?.[1] ?? null;

    return NextResponse.json({
      bggId,
      bggUrl: `https://boardgamegeek.com/boardgame/${bggId}`,
      title: decodeXml(primaryName),
      imageUrl: image ? decodeXml(image) : null,
      year: Number(valueOf(xml, "yearpublished")) || null,
      minPlayers: Number(valueOf(xml, "minplayers")) || null,
      maxPlayers: Number(valueOf(xml, "maxplayers")) || null,
      playingTime: Number(valueOf(xml, "playingtime")) || null,
      complexity:
        Number(xml.match(/<averageweight[^>]*value="([^"]+)"/i)?.[1]) || null,
      categories,
      cooperative: mechanics.some((mechanic) =>
        mechanic.toLowerCase().includes("cooperative"),
      ),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "BGG ne répond pas pour le moment. Vous pouvez compléter la fiche manuellement.",
      },
      { status: 502 },
    );
  }
}
