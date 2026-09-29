"use client";

import {
  ArrowRight,
  Clock3,
  Dices,
  HandHeart,
  House,
  LibraryBig,
  MapPin,
  Plus,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { DashboardData } from "@/lib/data";
import {
  AvatarStack,
  GameImage,
  GameLink,
  relativeDate,
  SectionHeading,
} from "./primitives";
import type { Game, Play, View } from "./types";

function GameRow({
  game,
  onPlay,
  onOpen,
  canEdit,
}: {
  game: Game;
  onPlay: (game: Game) => void;
  onOpen: () => void;
  canEdit: boolean;
}) {
  const owners = game.ownerships.map((item) => item.person.name).join(", ");
  return (
    <article className="game-row">
      <GameImage game={game} />
      <div className="game-row-copy">
        <div className="game-row-title">
          <h3>
            <GameLink game={game} onOpen={onOpen} />
          </h3>
          {game.forSale && (
            <span className="pill pill-terracotta">À vendre</span>
          )}
          {game.activeLoan && <span className="pill pill-gold">Emprunté</span>}
        </div>
        <p>{game.categories.slice(0, 2).join(" · ") || "Jeu de société"}</p>
        <div className="micro-meta">
          <span>
            <Users size={13} /> {game.minPlayers ?? "?"}–
            {game.maxPlayers ?? "?"}
          </span>
          <span>
            <Clock3 size={13} />{" "}
            {game.playingTime ? `${game.playingTime} min` : "Durée libre"}
          </span>
          {owners && (
            <span>
              <House size={13} /> {owners}
            </span>
          )}
        </div>
      </div>
      <div className="game-row-stats">
        <strong>{game.playCount}</strong>
        <span>partie{game.playCount > 1 ? "s" : ""}</span>
      </div>
      {canEdit && (
        <button
          className="icon-button"
          onClick={() => onPlay(game)}
          title="Ajouter une partie"
          type="button"
        >
          <Plus size={18} />
        </button>
      )}
    </article>
  );
}

function RecentPlay({
  play,
  onOpenGame,
  onOpenPerson,
}: {
  play: Play;
  onOpenGame: (gameId: number) => void;
  onOpenPerson: (personId: number) => void;
}) {
  const winners = play.participants
    .filter((item) => item.isWinner)
    .map((item) => item.person.name);
  return (
    <article className="activity-row">
      <GameImage game={play.game} />
      <div className="activity-copy">
        <div className="activity-title">
          <h3>
            <GameLink
              game={play.game}
              onOpen={() => onOpenGame(play.game.id)}
            />
          </h3>
          <span>{relativeDate(play.playedAt)}</span>
        </div>
        <p>
          <MapPin size={13} /> {play.location}
        </p>
        <div className="activity-bottom">
          <AvatarStack
            people={play.participants.map((item) => item.person)}
            onOpenPerson={onOpenPerson}
          />
          {winners.length > 0 && (
            <span className="winner">
              <Trophy size={13} /> {winners.join(" & ")}
            </span>
          )}
          {play.game.cooperative && play.groupWon !== null && (
            <span className={`winner ${play.groupWon ? "" : "lost"}`}>
              <Trophy size={13} /> {play.groupWon ? "Victoire" : "Défaite"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function DashboardView({
  data,
  setView,
  onPlay,
  onOpenGame,
  onOpenPerson,
  canEdit,
}: {
  data: DashboardData;
  setView: (view: View) => void;
  onPlay: (game?: Game) => void;
  onOpenGame: (gameId: number) => void;
  onOpenPerson: (personId: number) => void;
  canEdit: boolean;
}) {
  const maxChart = Math.max(...data.chart.map((item) => item.count), 1);
  const shelfGames = data.shelfGames ?? data.games.slice(0, 3);
  const statCards = [
    {
      label: "Jeux dans la collection",
      value: data.stats.gameCount,
      note: `${data.stats.forSaleCount} à vendre`,
      icon: LibraryBig,
      tone: "green",
    },
    {
      label: "Parties enregistrées",
      value: data.stats.playCount,
      note: `+${data.stats.thisMonthPlays} ce mois-ci`,
      icon: Dices,
      tone: "orange",
    },
    {
      label: "Joueurs autour de la table",
      value: data.stats.playerCount,
      note: "Votre joyeuse équipe",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Jeux en circulation",
      value: data.stats.activeLoanCount,
      note: "À ne pas oublier",
      icon: HandHeart,
      tone: "plum",
    },
  ];

  return (
    <>
      <section className="stats-grid">
        {statCards.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className={`stat-icon ${stat.tone}`}>
              <stat.icon size={20} />
            </span>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel library-panel">
          <SectionHeading
            title="Sur vos étagères"
            action="Toute la ludothèque"
            onAction={() => setView("games")}
          />
          <div className="game-rows">
            {shelfGames.map((game) => (
              <GameRow
                key={game.id}
                game={game}
                onPlay={() => onPlay(game)}
                onOpen={() => onOpenGame(game.id)}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
        <div className="panel activity-panel">
          <SectionHeading
            title="Dernières parties"
            action="Tout voir"
            onAction={() => setView("plays")}
          />
          <div className="activity-list">
            {data.plays.slice(0, 3).map((play) => (
              <RecentPlay
                key={play.id}
                play={play}
                onOpenGame={onOpenGame}
                onOpenPerson={onOpenPerson}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-lower">
        <div className="panel chart-panel">
          <div className="chart-heading">
            <div>
              <p className="eyebrow">Rythme de jeu</p>
              <h2>Vos 6 derniers mois</h2>
            </div>
            <div className="chart-total">
              <strong>
                {
                  data.plays.filter(
                    (play) =>
                      new Date(play.playedAt) >
                      new Date(Date.now() - 183 * 86400000),
                  ).length
                }
              </strong>
              <span>parties</span>
            </div>
          </div>
          <div className="bar-chart">
            {data.chart.map((item) => (
              <div className="bar-slot" key={item.key}>
                <span className="bar-value">{item.count || ""}</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max(10, (item.count / maxChart) * 100)}%`,
                    }}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="challenge-card">
          <span className="challenge-spark">
            <Sparkles size={19} />
          </span>
          <p className="eyebrow">Le petit défi</p>
          <h2>
            Et si vous ressortiez
            <br />
            <em>
              {data.games.toSorted((a, b) =>
                (a.lastPlayed ?? "").localeCompare(b.lastPlayed ?? ""),
              )[0]?.title ?? "un classique"}
            </em>
             ?
          </h2>
          <p>Il attend sagement son tour sur l’étagère.</p>
          {canEdit && (
            <button type="button" onClick={() => onPlay(data.games[0])}>
              Noter une partie <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>
    </>
  );
}
