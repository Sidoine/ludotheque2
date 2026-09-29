import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }),
    color: varchar("color", { length: 24 }).notNull().default("#557A68"),
    isHousehold: boolean("is_household").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("people_name_unique").on(table.name)],
);

export const games = pgTable(
  "games",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl: text("image_url"),
    bggId: varchar("bgg_id", { length: 32 }),
    bggUrl: text("bgg_url"),
    year: integer("year"),
    minPlayers: integer("min_players"),
    maxPlayers: integer("max_players"),
    playingTime: integer("playing_time"),
    complexity: numeric("complexity", { precision: 3, scale: 2 }),
    bggRating: numeric("bgg_rating", { precision: 3, scale: 2 }),
    categories: text("categories").array().notNull().default([]),
    cooperative: boolean("cooperative").notNull().default(false),
    forSale: boolean("for_sale").notNull().default(false),
    salePrice: numeric("sale_price", { precision: 8, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("games_title_unique").on(table.title),
    index("games_for_sale_idx").on(table.forSale),
  ],
);

export const gameOwners = pgTable(
  "game_owners",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    ownershipType: varchar("ownership_type", { length: 24 })
      .notNull()
      .default("owned"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("game_owner_unique").on(table.gameId, table.personId),
  ],
);

export const loans = pgTable(
  "loans",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    lenderId: integer("lender_id").references(() => people.id, {
      onDelete: "set null",
    }),
    borrowerId: integer("borrower_id").references(() => people.id, {
      onDelete: "set null",
    }),
    borrowedAt: date("borrowed_at", { mode: "string" }).notNull(),
    dueAt: date("due_at", { mode: "string" }),
    returnedAt: date("returned_at", { mode: "string" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("loans_game_idx").on(table.gameId)],
);

export const plays = pgTable(
  "plays",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at", { withTimezone: true }).notNull(),
    location: varchar("location", { length: 180 }).notNull(),
    notes: text("notes"),
    groupWon: boolean("group_won"),
    duration: integer("duration"),
    importSource: varchar("import_source", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("plays_game_idx").on(table.gameId),
    index("plays_date_idx").on(table.playedAt),
  ],
);

export const playParticipants = pgTable(
  "play_participants",
  {
    id: serial("id").primaryKey(),
    playId: integer("play_id")
      .notNull()
      .references(() => plays.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    isWinner: boolean("is_winner").notNull().default(false),
    team: varchar("team", { length: 80 }),
    score: varchar("score", { length: 40 }),
  },
  (table) => [
    uniqueIndex("play_participant_unique").on(table.playId, table.personId),
    index("play_participant_person_idx").on(table.personId),
  ],
);
