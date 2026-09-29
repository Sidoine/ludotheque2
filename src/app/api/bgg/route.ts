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

function bggHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "User-Agent": "Ludotheque/1.0 board-game-library",
  };
  if (process.env.BGG_API_TOKEN)
    headers.Authorization = `Bearer ${process.env.BGG_API_TOKEN}`;
  return headers;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  if (query) {
    try {
      const response = await fetch(
        `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`,
        { headers: bggHeaders(), next: { revalidate: 3600 } },
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
      const results = [...xml.matchAll(/<item\b([^>]*)>([\s\S]*?)<\/item>/gi)]
        .slice(0, 12)
        .map((match) => {
          const attributes = match[1];
          const content = match[2];
          const id = attributes.match(/\bid="(\d+)"/i)?.[1];
          const name = content.match(/<name\b[^>]*value="([^"]+)"/i)?.[1];
          const year = content.match(
            /<yearpublished\b[^>]*value="(\d+)"/i,
          )?.[1];
          return id && name
            ? {
                id,
                name: decodeXml(name),
                year: year ? Number(year) : null,
              }
            : null;
        })
        .filter((result) => result !== null);
      return NextResponse.json({ results });
    } catch {
      return NextResponse.json(
        { error: "BGG ne répond pas pour le moment." },
        { status: 502 },
      );
    }
  }

  const raw = searchParams.get("url")?.trim() ?? "";
  const bggId = raw.match(/boardgame\/(\d+)/)?.[1] ?? raw.match(/^\d+$/)?.[0];
  if (!bggId) {
    return NextResponse.json(
      { error: "Collez une URL de fiche BGG valide." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`,
      {
        headers: bggHeaders(),
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
      bggRating:
        Number(xml.match(/<average[^>]*value="([^"]+)"/i)?.[1]) || null,
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
