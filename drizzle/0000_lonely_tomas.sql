CREATE TABLE "game_owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"ownership_type" varchar(24) DEFAULT 'owned' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"image_url" text,
	"bgg_id" varchar(32),
	"bgg_url" text,
	"year" integer,
	"min_players" integer,
	"max_players" integer,
	"playing_time" integer,
	"complexity" numeric(3, 2),
	"categories" text[] DEFAULT '{}' NOT NULL,
	"cooperative" boolean DEFAULT false NOT NULL,
	"for_sale" boolean DEFAULT false NOT NULL,
	"sale_price" numeric(8, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"lender_id" integer,
	"borrower_id" integer,
	"borrowed_at" date NOT NULL,
	"due_at" date,
	"returned_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255),
	"color" varchar(24) DEFAULT '#557A68' NOT NULL,
	"is_household" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "play_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"play_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"is_winner" boolean DEFAULT false NOT NULL,
	"team" varchar(80),
	"score" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "plays" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"played_at" timestamp with time zone NOT NULL,
	"location" varchar(180) NOT NULL,
	"notes" text,
	"group_won" boolean,
	"duration" integer,
	"import_source" varchar(40),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_owners" ADD CONSTRAINT "game_owners_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_owners" ADD CONSTRAINT "game_owners_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_lender_id_people_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_id_people_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_participants" ADD CONSTRAINT "play_participants_play_id_plays_id_fk" FOREIGN KEY ("play_id") REFERENCES "public"."plays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_participants" ADD CONSTRAINT "play_participants_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plays" ADD CONSTRAINT "plays_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_owner_unique" ON "game_owners" USING btree ("game_id","person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "games_title_unique" ON "games" USING btree ("title");--> statement-breakpoint
CREATE INDEX "games_for_sale_idx" ON "games" USING btree ("for_sale");--> statement-breakpoint
CREATE INDEX "loans_game_idx" ON "loans" USING btree ("game_id");--> statement-breakpoint
CREATE UNIQUE INDEX "people_name_unique" ON "people" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "play_participant_unique" ON "play_participants" USING btree ("play_id","person_id");--> statement-breakpoint
CREATE INDEX "play_participant_person_idx" ON "play_participants" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "plays_game_idx" ON "plays" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "plays_date_idx" ON "plays" USING btree ("played_at");