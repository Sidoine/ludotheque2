import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  gameOwners,
  games,
  loans,
  people,
  playParticipants,
  plays,
} from "@/db/schema";

function daysAgo(days: number, hour = 20) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  value.setHours(hour, 0, 0, 0);
  return value;
}

export async function ensureSeedData() {
  const [admin] = await db
    .select()
    .from(people)
    .orderBy(asc(people.id))
    .limit(1);
  if (!admin) {
    await db.insert(people).values({
      name: process.env.ADMIN_NAME || "Sidoine",
      color: "#436F5B",
      isHousehold: true,
    });
  }
  return;

  const [{ value }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(games);
  if (value > 0) return;

  await db.transaction(async (tx) => {
    const insertedPeople = await tx
      .insert(people)
      .values([
        { name: "Cyril", color: "#436F5B", isHousehold: true },
        { name: "Mylène", color: "#C1694F", isHousehold: true },
        { name: "Sidoine", color: "#5F6F9B" },
        { name: "Jill", color: "#B77854" },
        { name: "Marc", color: "#766A8F" },
        { name: "Alice", color: "#AE7A75" },
      ])
      .onConflictDoNothing()
      .returning();

    const allPeople = insertedPeople.length
      ? insertedPeople
      : await tx.select().from(people).orderBy(asc(people.id));
    const person = Object.fromEntries(
      allPeople.map((item) => [item.name, item]),
    );

    const insertedGames = await tx
      .insert(games)
      .values([
        {
          title: "Everdell",
          imageUrl: "/images/evergrove.jpg",
          bggId: "199792",
          bggUrl: "https://boardgamegeek.com/boardgame/199792/everdell",
          year: 2018,
          minPlayers: 1,
          maxPlayers: 4,
          playingTime: 80,
          complexity: "2.83",
          categories: ["Placement d’ouvriers", "Cartes"],
        },
        {
          title: "Wingspan",
          imageUrl: "/images/skyward-birds.jpg",
          bggId: "266192",
          bggUrl: "https://boardgamegeek.com/boardgame/266192/wingspan",
          year: 2019,
          minPlayers: 1,
          maxPlayers: 5,
          playingTime: 70,
          complexity: "2.47",
          categories: ["Engine building", "Nature"],
        },
        {
          title: "Heat: Pedal to the Metal",
          imageUrl: "/images/desert-race.jpg",
          bggId: "366013",
          bggUrl:
            "https://boardgamegeek.com/boardgame/366013/heat-pedal-to-the-metal",
          year: 2022,
          minPlayers: 1,
          maxPlayers: 6,
          playingTime: 60,
          complexity: "2.20",
          categories: ["Course", "Gestion de main"],
        },
        {
          title: "Terraforming Mars",
          imageUrl: "/images/mars-colony.jpg",
          bggId: "167791",
          bggUrl:
            "https://boardgamegeek.com/boardgame/167791/terraforming-mars",
          year: 2016,
          minPlayers: 1,
          maxPlayers: 5,
          playingTime: 120,
          complexity: "3.27",
          categories: ["Stratégie", "Science-fiction"],
          forSale: true,
          salePrice: "35.00",
        },
      ])
      .returning();

    const game = Object.fromEntries(
      insertedGames.map((item) => [item.title, item]),
    );
    await tx.insert(gameOwners).values([
      { gameId: game.Everdell.id, personId: person.Cyril.id },
      { gameId: game.Wingspan.id, personId: person.Mylène.id },
      {
        gameId: game["Heat: Pedal to the Metal"].id,
        personId: person.Marc.id,
        ownershipType: "borrowed",
      },
      { gameId: game["Terraforming Mars"].id, personId: person.Cyril.id },
    ]);

    await tx.insert(loans).values({
      gameId: game["Heat: Pedal to the Metal"].id,
      lenderId: person.Marc.id,
      borrowerId: person.Cyril.id,
      borrowedAt: daysAgo(24).toISOString().slice(0, 10),
      dueAt: daysAgo(-7).toISOString().slice(0, 10),
      notes: "À rendre lors de la prochaine soirée jeux",
    });

    const playFixtures = [
      {
        game: "Everdell",
        days: 2,
        place: "À la maison",
        names: ["Cyril", "Mylène", "Jill"],
        winners: ["Mylène"],
        notes: "Très belle partie, combo de production au dernier printemps.",
      },
      {
        game: "Heat: Pedal to the Metal",
        days: 5,
        place: "Chez Marc",
        names: ["Cyril", "Marc", "Sidoine", "Jill"],
        winners: ["Marc"],
        notes: "Circuit USA, météo pluvieuse.",
      },
      {
        game: "Wingspan",
        days: 9,
        place: "À la maison",
        names: ["Cyril", "Mylène"],
        winners: ["Cyril"],
        notes: "Objectif oiseaux de proie enfin réussi.",
      },
      {
        game: "Terraforming Mars",
        days: 16,
        place: "La Revanche",
        names: ["Cyril", "Sidoine", "Alice"],
        winners: ["Alice"],
        notes: "Partie avec Prélude.",
      },
      {
        game: "Everdell",
        days: 28,
        place: "Chez Jill",
        names: ["Cyril", "Mylène", "Jill", "Sidoine"],
        winners: ["Cyril", "Jill"],
        notes: "Égalité parfaite à 61 points.",
      },
      {
        game: "Wingspan",
        days: 43,
        place: "À la maison",
        names: ["Cyril", "Mylène", "Alice"],
        winners: ["Mylène"],
        notes: null,
      },
      {
        game: "Everdell",
        days: 67,
        place: "À la maison",
        names: ["Cyril", "Mylène"],
        winners: ["Mylène"],
        notes: null,
      },
      {
        game: "Heat: Pedal to the Metal",
        days: 82,
        place: "Chez Marc",
        names: ["Marc", "Cyril", "Sidoine"],
        winners: ["Sidoine"],
        notes: null,
      },
      {
        game: "Terraforming Mars",
        days: 111,
        place: "À la maison",
        names: ["Cyril", "Mylène"],
        winners: ["Cyril"],
        notes: null,
      },
      {
        game: "Wingspan",
        days: 139,
        place: "Chez Alice",
        names: ["Alice", "Cyril", "Jill"],
        winners: ["Jill"],
        notes: null,
      },
      {
        game: "Everdell",
        days: 158,
        place: "À la maison",
        names: ["Cyril", "Mylène", "Sidoine"],
        winners: ["Sidoine"],
        notes: null,
      },
    ];

    for (const fixture of playFixtures) {
      const [play] = await tx
        .insert(plays)
        .values({
          gameId: game[fixture.game].id,
          playedAt: daysAgo(fixture.days),
          location: fixture.place,
          notes: fixture.notes,
        })
        .returning();
      await tx.insert(playParticipants).values(
        fixture.names.map((name) => ({
          playId: play.id,
          personId: person[name].id,
          isWinner: fixture.winners.includes(name),
        })),
      );
    }
  });
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const [gameRows, peopleRows, ownerRows, loanRows, playRows, participantRows] =
    await Promise.all([
      db.select().from(games).orderBy(asc(games.title)),
      db.select().from(people).orderBy(asc(people.name)),
      db.select().from(gameOwners),
      db.select().from(loans).orderBy(desc(loans.borrowedAt)),
      db.select().from(plays).orderBy(desc(plays.playedAt)),
      db.select().from(playParticipants),
    ]);

  const personMap = new Map(peopleRows.map((person) => [person.id, person]));
  const gameMap = new Map(gameRows.map((game) => [game.id, game]));
  const participantsByPlay = new Map<number, typeof participantRows>();
  for (const participant of participantRows) {
    const existing = participantsByPlay.get(participant.playId) ?? [];
    existing.push(participant);
    participantsByPlay.set(participant.playId, existing);
  }

  const enrichedPlays = playRows.map((play) => ({
    ...play,
    playedAt: play.playedAt.toISOString(),
    createdAt: play.createdAt.toISOString(),
    game: gameMap.get(play.gameId)!,
    participants: (participantsByPlay.get(play.id) ?? []).map(
      (participant) => ({
        ...participant,
        person: personMap.get(participant.personId)!,
      }),
    ),
  }));

  const enrichedGames = gameRows.map((game) => {
    const gamePlays = enrichedPlays.filter((play) => play.gameId === game.id);
    const ownerships = ownerRows
      .filter((owner) => owner.gameId === game.id)
      .map((owner) => ({ ...owner, person: personMap.get(owner.personId)! }));
    const activeLoan = loanRows.find(
      (loan) => loan.gameId === game.id && !loan.returnedAt,
    );
    return {
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
      playCount: gamePlays.length,
      lastPlayed: gamePlays[0]?.playedAt ?? null,
      ownerships,
      activeLoan: activeLoan
        ? {
            ...activeLoan,
            lender: activeLoan.lenderId
              ? (personMap.get(activeLoan.lenderId) ?? null)
              : null,
            borrower: activeLoan.borrowerId
              ? (personMap.get(activeLoan.borrowerId) ?? null)
              : null,
          }
        : null,
    };
  });

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, reverseIndex) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - reverseIndex),
      1,
    );
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      key: `${year}-${month}`,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short" })
        .format(date)
        .replace(".", ""),
      count: playRows.filter(
        (play) =>
          play.playedAt.getFullYear() === year &&
          play.playedAt.getMonth() === month,
      ).length,
    };
  });

  const thisMonthPlays = playRows.filter(
    (play) =>
      play.playedAt.getFullYear() === now.getFullYear() &&
      play.playedAt.getMonth() === now.getMonth(),
  ).length;
  const distinctPlayers = new Set(
    participantRows.map((participant) => participant.personId),
  ).size;
  const topGame =
    enrichedGames.toSorted((a, b) => b.playCount - a.playCount)[0] ?? null;
  const shelfGames = [...enrichedGames]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return {
    games: enrichedGames,
    shelfGames,
    people: peopleRows.map((person) => ({
      ...person,
      createdAt: person.createdAt.toISOString(),
    })),
    plays: enrichedPlays,
    loans: loanRows,
    chart: months,
    stats: {
      gameCount: gameRows.length,
      playCount: playRows.length,
      thisMonthPlays,
      playerCount: distinctPlayers,
      forSaleCount: gameRows.filter((game) => game.forSale).length,
      activeLoanCount: loanRows.filter((loan) => !loan.returnedAt).length,
      topGameTitle: topGame?.title ?? "—",
    },
  };
}

export async function getPeopleByIds(ids: number[]) {
  if (!ids.length) return [];
  return db.select().from(people).where(inArray(people.id, ids));
}

export async function getPersonByName(name: string) {
  return db.select().from(people).where(eq(people.name, name)).limit(1);
}
