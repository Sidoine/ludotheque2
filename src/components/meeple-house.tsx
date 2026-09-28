"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Dices,
  ExternalLink,
  FileArchive,
  HandHeart,
  History,
  House,
  Info,
  LayoutDashboard,
  LibraryBig,
  Link2,
  Loader2,
  LogIn,
  MapPin,
  Menu,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DashboardData } from "@/lib/data";

type View =
  | "dashboard"
  | "games"
  | "plays"
  | "people"
  | "loans"
  | "sale"
  | "stats"
  | "import";
type Game = DashboardData["games"][number];
type Person = DashboardData["people"][number];
type Play = DashboardData["plays"][number];
type IconType = typeof LayoutDashboard;

const navMain: { id: View; label: string; icon: IconType }[] = [
  { id: "dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { id: "games", label: "Ma ludothèque", icon: LibraryBig },
  { id: "plays", label: "Mes parties", icon: History },
  { id: "people", label: "Joueurs & amis", icon: Users },
  { id: "loans", label: "Prêts & emprunts", icon: HandHeart },
  { id: "sale", label: "À vendre", icon: Tag },
];

const pageTitles: Record<View, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Tableau de bord",
    subtitle: "Voici ce qui se passe dans votre ludothèque.",
  },
  games: {
    title: "Ma ludothèque",
    subtitle: "Tous vos jeux, ceux de la maison et ceux des amis.",
  },
  plays: {
    title: "Mes parties",
    subtitle: "Gardez une trace de chaque soirée autour de la table.",
  },
  people: {
    title: "Joueurs & amis",
    subtitle: "Votre cercle de joueurs et leurs dernières parties.",
  },
  loans: {
    title: "Prêts & emprunts",
    subtitle: "Pour que chaque boîte retrouve toujours son étagère.",
  },
  sale: {
    title: "À vendre",
    subtitle: "Les jeux prêts à rejoindre une nouvelle ludothèque.",
  },
  stats: {
    title: "Statistiques",
    subtitle: "Quelques chiffres sur vos habitudes de jeu.",
  },
  import: {
    title: "Importer depuis Notion",
    subtitle: "Retrouvez votre historique en quelques secondes.",
  },
};

const frDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeDate(value: string | Date) {
  const date = new Date(value);
  const delta = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (delta <= 0) return "Aujourd’hui";
  if (delta === 1) return "Hier";
  if (delta < 7) return `Il y a ${delta} jours`;
  return shortDate.format(date);
}

function Avatar({
  person,
  small = false,
}: {
  person: Pick<Person, "name" | "color">;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "avatar-sm" : ""}`}
      style={{ backgroundColor: person.color }}
      title={person.name}
    >
      {initials(person.name)}
    </span>
  );
}

function AvatarStack({
  people,
}: {
  people: Pick<Person, "id" | "name" | "color">[];
}) {
  return (
    <span className="avatar-stack">
      {people.slice(0, 4).map((person) => (
        <Avatar key={person.id} person={person} small />
      ))}
      {people.length > 4 && (
        <span className="avatar avatar-sm avatar-more">
          +{people.length - 4}
        </span>
      )}
    </span>
  );
}

function GameImage({
  game,
  className = "",
}: {
  game: Pick<Game, "title" | "imageUrl">;
  className?: string;
}) {
  if (game.imageUrl) {
    return (
      <img
        className={`game-image ${className}`}
        src={game.imageUrl}
        alt={`Illustration de ${game.title}`}
      />
    );
  }
  return (
    <div className={`game-image game-image-fallback ${className}`}>
      <Dices size={28} />
      <span>{game.title}</span>
    </div>
  );
}

function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <button className="text-action" type="button" onClick={onAction}>
          {action} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: IconType;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function GameRow({
  game,
  onPlay,
  canEdit,
}: {
  game: Game;
  onPlay: (game: Game) => void;
  canEdit: boolean;
}) {
  const owners = game.ownerships.map((item) => item.person.name).join(", ");
  return (
    <article className="game-row">
      <GameImage game={game} />
      <div className="game-row-copy">
        <div className="game-row-title">
          <h3>{game.title}</h3>
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

function RecentPlay({ play }: { play: Play }) {
  const winners = play.participants
    .filter((item) => item.isWinner)
    .map((item) => item.person.name);
  return (
    <article className="activity-row">
      <GameImage game={play.game} />
      <div className="activity-copy">
        <div className="activity-title">
          <h3>{play.game.title}</h3>
          <span>{relativeDate(play.playedAt)}</span>
        </div>
        <p>
          <MapPin size={13} /> {play.location}
        </p>
        <div className="activity-bottom">
          <AvatarStack people={play.participants.map((item) => item.person)} />
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

function DashboardView({
  data,
  setView,
  onPlay,
  canEdit,
}: {
  data: DashboardData;
  setView: (view: View) => void;
  onPlay: (game?: Game) => void;
  canEdit: boolean;
}) {
  const maxChart = Math.max(...data.chart.map((item) => item.count), 1);
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
            {data.games.slice(0, 3).map((game) => (
              <GameRow
                key={game.id}
                game={game}
                onPlay={() => onPlay(game)}
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
              <RecentPlay key={play.id} play={play} />
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

function GamesView({
  games,
  people,
  plays,
  onPlay,
  canEdit,
  onEdit,
  onDelete,
  onToast,
  onChanged,
}: {
  games: Game[];
  people: Person[];
  plays: Play[];
  onPlay: (game: Game) => void;
  canEdit: boolean;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onToast: (message: string, error?: boolean) => void;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "borrowed" | "sale">(
    "all",
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [detailsGame, setDetailsGame] = useState<Game | undefined>();
  const filtered = games.filter((game) => {
    const matches =
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.categories.join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (filter === "mine")
      return game.ownerships.some((item) => item.person.isHousehold);
    if (filter === "borrowed") return Boolean(game.activeLoan);
    if (filter === "sale") return game.forSale;
    return true;
  });

  if (detailsGame)
    return (
      <GameDetailsPage
        game={detailsGame}
        people={people}
        plays={plays}
        canEdit={canEdit}
        onBack={() => setDetailsGame(undefined)}
        onEdit={onEdit}
        onPlay={onPlay}
        onToast={onToast}
        onChanged={() => {
          setDetailsGame(undefined);
          onChanged();
        }}
      />
    );

  return (
    <div className="content-panel">
      <div className="toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un jeu, une catégorie…"
          />
        </label>
        <div className="filter-tabs">
          {(
            [
              ["all", "Tous"],
              ["mine", "À nous"],
              ["borrowed", "Empruntés"],
              ["sale", "À vendre"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <div className="games-grid">
          {filtered.map((game) => (
            <article
              className="game-card"
              key={game.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailsGame(game)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDetailsGame(game);
                }
              }}
            >
              <div className="game-card-visual">
                <GameImage game={game} />
                <div className="game-card-badges">
                  {game.activeLoan && (
                    <span className="pill pill-gold">Chez nous, à Marc</span>
                  )}
                  {game.forSale && (
                    <span className="pill pill-terracotta">
                      {game.salePrice
                        ? `${Number(game.salePrice)} €`
                        : "À vendre"}
                    </span>
                  )}
                </div>
                {canEdit && (
                  <div
                    className="game-card-menu-wrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="card-menu"
                      type="button"
                      aria-label={`Actions pour ${game.title}`}
                      aria-expanded={openMenuId === game.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === game.id ? null : game.id,
                        )
                      }
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenuId === game.id && (
                      <div className="game-card-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEdit(game);
                          }}
                        >
                          <Pencil size={15} /> Modifier
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(game);
                          }}
                        >
                          <Trash2 size={15} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="game-card-body">
                <div className="game-title-line">
                  <h3>{game.title}</h3>
                  {game.bggUrl && (
                    <a
                      href={game.bggUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Voir sur BoardGameGeek"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
                <p>
                  {game.categories.slice(0, 2).join(" · ") || "Jeu de société"}{" "}
                  {game.year ? `· ${game.year}` : ""}
                </p>
                <div className="game-facts">
                  <span>
                    <Users size={14} /> {game.minPlayers ?? "?"}–
                    {game.maxPlayers ?? "?"}
                  </span>
                  <span>
                    <Clock3 size={14} />{" "}
                    {game.playingTime ? `${game.playingTime} min` : "—"}
                  </span>
                  <span>
                    <Dices size={14} /> {game.playCount}
                  </span>
                </div>
                <div className="game-card-footer">
                  <span className="owner-label">
                    {game.ownerships.length ? (
                      <>
                        <Avatar person={game.ownerships[0].person} small />{" "}
                        {game.ownerships
                          .map((item) => item.person.name)
                          .join(", ")}
                      </>
                    ) : (
                      <>
                        <PackageOpen size={15} /> Propriétaire non indiqué
                      </>
                    )}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPlay(game);
                      }}
                    >
                      <Plus size={15} /> Partie
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Aucun jeu trouvé"
          text="Essayez un autre mot ou retirez un filtre."
        />
      )}
    </div>
  );
}

function GameDetailsPage({
  game,
  people,
  plays,
  canEdit,
  onBack,
  onEdit,
  onPlay,
  onToast,
  onChanged,
}: {
  game: Game;
  people: Person[];
  plays: Play[];
  canEdit: boolean;
  onBack: () => void;
  onEdit: (game: Game) => void;
  onPlay: (game: Game) => void;
  onToast: (message: string, error?: boolean) => void;
  onChanged: () => void;
}) {
  const [loanModal, setLoanModal] = useState(false);
  const gamePlays = plays.filter((play) => play.gameId === game.id);
  const averagePlayers = gamePlays.length
    ? (
        gamePlays.reduce((total, play) => total + play.participants.length, 0) /
        gamePlays.length
      ).toFixed(1)
    : "—";
  const lastPlay = gamePlays[0];
  const victories = new Map<
    number,
    { name: string; color: string; wins: number }
  >();
  gamePlays.forEach((play) =>
    play.participants
      .filter((participant) => participant.isWinner)
      .forEach((participant) => {
        const current = victories.get(participant.personId);
        victories.set(participant.personId, {
          name: participant.person.name,
          color: participant.person.color,
          wins: (current?.wins ?? 0) + 1,
        });
      }),
  );
  const victoryRows = [...victories.values()].sort((a, b) => b.wins - a.wins);
  const totalVictories = victoryRows.reduce(
    (total, player) => total + player.wins,
    0,
  );
  let angle = 0;
  const gradient = victoryRows.length
    ? victoryRows
        .map((player) => {
          const start = angle;
          angle += (player.wins / totalVictories) * 360;
          return `${player.color} ${start}deg ${angle}deg`;
        })
        .join(", ")
    : "#e5e8e3 0deg 360deg";
  async function toggleSale() {
    const response = await fetch("/api/games", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: game.id, forSale: !game.forSale }),
    });
    const payload = await response.json();
    if (!response.ok)
      return onToast(
        payload.error || "Impossible de modifier le statut de vente.",
        true,
      );
    onToast(
      game.forSale
        ? `${game.title} n’est plus à vendre`
        : `${game.title} est maintenant à vendre`,
    );
    onChanged();
  }
  async function returnGame() {
    if (!game.activeLoan) return;
    const response = await fetch("/api/loans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: game.activeLoan.id }),
    });
    const payload = await response.json();
    if (!response.ok)
      return onToast(payload.error || "Impossible de clôturer ce prêt.", true);
    onToast(`${game.title} a été marqué comme rendu`);
    onChanged();
  }
  return (
    <div className="game-details-page">
      <div className="game-details-toolbar">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowRight className="back-icon" size={16} /> Ma ludothèque
        </button>
        <div>
          {canEdit && (
            <button
              className="secondary-button"
              type="button"
              onClick={toggleSale}
            >
              <Tag size={16} />{" "}
              {game.forSale ? "Retirer de la vente" : "Marquer à vendre"}
            </button>
          )}
          {canEdit && (
            <button
              className="secondary-button"
              type="button"
              onClick={game.activeLoan ? returnGame : () => setLoanModal(true)}
            >
              <HandHeart size={16} />{" "}
              {game.activeLoan ? "Marquer rendu" : "Marquer emprunté"}
            </button>
          )}
          {canEdit && (
            <button
              className="secondary-button"
              type="button"
              onClick={() => onEdit(game)}
            >
              <Pencil size={16} /> Modifier
            </button>
          )}
          {canEdit && (
            <button
              className="primary-button"
              type="button"
              onClick={() => onPlay(game)}
            >
              <Plus size={16} /> Noter une partie
            </button>
          )}
        </div>
      </div>
      <div className="game-details-heading">
        <GameImage game={game} className="game-details-image" />
        <div>
          <p className="eyebrow">
            {game.categories.slice(0, 2).join(" · ") || "Jeu de société"}
          </p>
          <h2>{game.title}</h2>
          <p>
            {game.year ? `Sorti en ${game.year}` : "Année inconnue"}
            {game.cooperative ? " · Jeu coopératif" : ""}
          </p>
          {game.ownerships.length ? (
            <p>
              <House size={14} /> Propriétaire
              {game.ownerships.length > 1 ? "s" : ""} :{" "}
              {game.ownerships.map((item) => item.person.name).join(", ")}
            </p>
          ) : (
            <p>
              <PackageOpen size={14} /> Propriétaire non indiqué
            </p>
          )}
          {game.bggUrl && (
            <a
              className="details-link"
              href={game.bggUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} /> Voir sur BoardGameGeek
            </a>
          )}
        </div>
      </div>
      <div className="game-details-stats">
        <div>
          <strong>{gamePlays.length}</strong>
          <span>partie{gamePlays.length > 1 ? "s" : ""}</span>
        </div>
        <div>
          <strong>{averagePlayers}</strong>
          <span>joueurs en moyenne</span>
        </div>
        <div>
          <strong>{lastPlay ? relativeDate(lastPlay.playedAt) : "—"}</strong>
          <span>dernière partie</span>
        </div>
        <div>
          <strong>{game.playingTime ? `${game.playingTime} min` : "—"}</strong>
          <span>durée moyenne</span>
        </div>
      </div>
      <div className="game-details-columns">
        <section className="details-section">
          <p className="eyebrow">Historique</p>
          <h3>Dernières parties</h3>
          {gamePlays.length ? (
            <div className="details-play-list">
              {gamePlays.slice(0, 6).map((play) => {
                const winners = play.participants
                  .filter((participant) => participant.isWinner)
                  .map((participant) => participant.person.name);
                const result = play.game.cooperative ? (
                  play.groupWon === true ? (
                    <>
                      <Trophy size={12} /> Victoire
                    </>
                  ) : play.groupWon === false ? (
                    "Défaite"
                  ) : (
                    "Résultat non noté"
                  )
                ) : winners.length ? (
                  <>
                    <Trophy size={12} /> {winners.join(" & ")}
                  </>
                ) : (
                  "Résultat non noté"
                );
                return (
                  <div className="details-play-row" key={play.id}>
                    <strong>
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(play.playedAt))}
                    </strong>
                    <span>{play.location}</span>
                    <small>
                      {play.participants
                        .map((participant) => participant.person.name)
                        .join(", ")}
                    </small>
                    <em className={play.groupWon === false ? "lost" : ""}>
                      {result}
                    </em>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="details-empty">
              Aucune partie enregistrée pour le moment.
            </p>
          )}
        </section>
        <section className="details-section victory-section">
          <p className="eyebrow">Palmarès</p>
          <h3>Victoires par joueur</h3>
          <div className="victory-chart-wrap">
            <div
              className="victory-chart"
              style={{ background: `conic-gradient(${gradient})` }}
              aria-label="Répartition des victoires par joueur"
            />
            <div className="victory-legend">
              {victoryRows.length ? (
                victoryRows.map((player) => (
                  <div key={player.name}>
                    <i style={{ backgroundColor: player.color }} />
                    <span>{player.name}</span>
                    <strong>{player.wins}</strong>
                  </div>
                ))
              ) : (
                <p className="details-empty">Aucune victoire enregistrée.</p>
              )}
            </div>
          </div>
        </section>
      </div>
      <div className="game-details-facts">
        <span>
          <Users size={15} /> {game.minPlayers ?? "?"}–{game.maxPlayers ?? "?"}{" "}
          joueurs
        </span>
        <span>
          <Clock3 size={15} />{" "}
          {game.playingTime ? `${game.playingTime} minutes` : "Durée libre"}
        </span>
        <span>
          <Dices size={15} />{" "}
          {game.categories.length
            ? game.categories.join(" · ")
            : "Catégories non renseignées"}
        </span>
      </div>
      {loanModal && (
        <GameLoanModal
          game={game}
          people={people}
          onClose={() => setLoanModal(false)}
          onSaved={() => {
            setLoanModal(false);
            onChanged();
          }}
          onToast={onToast}
        />
      )}
    </div>
  );
}

function GameLoanModal({
  game,
  people,
  onClose,
  onSaved,
  onToast,
}: {
  game: Game;
  people: Person[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [lenderId, setLenderId] = useState(people[0]?.id ?? 0);
  const [borrowedAt, setBorrowedAt] = useState(todayString());
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lenderId)
      return onToast("Choisissez la personne qui vous prête le jeu.", true);
    setSaving(true);
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: game.id,
        lenderId,
        borrowedAt,
        dueAt: dueAt || null,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok)
      return onToast(
        payload.error || "Impossible d’enregistrer ce prêt.",
        true,
      );
    onToast(`${game.title} a été marqué comme emprunté`);
    onSaved();
  }
  return (
    <Modal
      title="Marquer comme emprunté"
      subtitle="Gardez la trace de la personne qui vous prête cette boîte."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label className="field">
          <span>Prêté par *</span>
          <select
            value={lenderId}
            onChange={(event) => setLenderId(Number(event.target.value))}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Date d’emprunt *</span>
          <input
            type="date"
            required
            value={borrowedAt}
            onChange={(event) => setBorrowedAt(event.target.value)}
          />
        </label>
        <label className="field">
          <span>
            Date de retour prévue <small>facultatif</small>
          </span>
          <input
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : (
              <HandHeart size={17} />
            )}{" "}
            Enregistrer le prêt
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PlaysView({
  plays,
  onAdd,
  onEdit,
  canEdit,
}: {
  plays: Play[];
  onAdd: () => void;
  onEdit: (play: Play) => void;
  canEdit: boolean;
}) {
  const grouped = plays.reduce<Record<string, Play[]>>((result, play) => {
    const date = new Date(play.playedAt);
    const key = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
    result[key] = [...(result[key] ?? []), play];
    return result;
  }, {});
  return (
    <div className="plays-layout">
      <div className="panel play-history">
        {Object.entries(grouped).map(([month, monthPlays]) => (
          <section key={month}>
            <h2 className="month-title">
              {month}
              <span>
                {monthPlays.length} partie{monthPlays.length > 1 ? "s" : ""}
              </span>
            </h2>
            {monthPlays.map((play) => {
              const winners = play.participants.filter((item) => item.isWinner);
              return (
                <article className="play-row" key={play.id}>
                  <div className="play-date">
                    <strong>{new Date(play.playedAt).getDate()}</strong>
                    <span>
                      {new Intl.DateTimeFormat("fr-FR", {
                        weekday: "short",
                      }).format(new Date(play.playedAt))}
                    </span>
                  </div>
                  <GameImage game={play.game} />
                  <div className="play-main">
                    <h3>{play.game.title}</h3>
                    <p>
                      <MapPin size={13} /> {play.location}
                      {play.notes ? (
                        <>
                          <i />
                          {play.notes}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <AvatarStack
                    people={play.participants.map((item) => item.person)}
                  />
                  <div className="play-winner">
                    {winners.length ? (
                      <>
                        <Trophy size={14} />
                        <span>
                          {winners.map((item) => item.person.name).join(" & ")}
                        </span>
                      </>
                    ) : (
                      <span className="muted">Résultat non noté</span>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      className="play-edit"
                      type="button"
                      aria-label={`Modifier la partie de ${play.game.title}`}
                      onClick={() => onEdit(play)}
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </div>
      <aside className="side-tip">
        <span>
          <Dices size={24} />
        </span>
        <h3>Une partie de plus ?</h3>
        <p>
          La date, le lieu et les joueurs de votre dernière saisie sont gardés
          pour toute la soirée.
        </p>
        {canEdit ? (
          <button className="primary-button full" type="button" onClick={onAdd}>
            <Plus size={17} /> Ajouter une partie
          </button>
        ) : (
          <p className="read-only-note">
            Connectez-vous pour ajouter une partie.
          </p>
        )}
      </aside>
    </div>
  );
}

function PeopleView({
  people,
  plays,
  onAdd,
  onEdit,
  canEdit,
}: {
  people: Person[];
  plays: Play[];
  onAdd: () => void;
  onEdit: (person: Person) => void;
  canEdit: boolean;
}) {
  const [detailsPerson, setDetailsPerson] = useState<Person | undefined>();
  function editPerson(person: Person) {
    setDetailsPerson(undefined);
    onEdit(person);
  }

  if (detailsPerson)
    return (
      <PersonDetailsPage
        person={detailsPerson}
        plays={plays}
        canEdit={canEdit}
        onBack={() => setDetailsPerson(undefined)}
        onEdit={editPerson}
      />
    );

  return (
    <div className="content-panel">
      <div className="people-intro">
        <div>
          <p className="eyebrow">Votre tablée</p>
          <h2>{people.length} personnes avec qui partager de bons moments</h2>
        </div>
        {canEdit && (
          <button className="secondary-button" type="button" onClick={onAdd}>
            <UserPlus size={17} /> Ajouter quelqu’un
          </button>
        )}
      </div>
      <div className="people-grid">
        {people.map((person) => {
          const personPlays = plays.filter((play) =>
            play.participants.some((item) => item.personId === person.id),
          );
          const wins = personPlays.filter((play) =>
            play.participants.some(
              (item) => item.personId === person.id && item.isWinner,
            ),
          ).length;
          return (
            <article
              className="person-card"
              key={person.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailsPerson(person)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDetailsPerson(person);
                }
              }}
            >
              <Avatar person={person} />
              <div>
                <h3>
                  {person.name}
                  {person.isHousehold && <span>Maison</span>}
                </h3>
                <p>{person.email || "Partenaire de jeu"}</p>
              </div>
              {canEdit && (
                <button
                  className="person-edit"
                  type="button"
                  aria-label={`Modifier ${person.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    editPerson(person);
                  }}
                >
                  <Pencil size={15} />
                </button>
              )}
              <dl>
                <div>
                  <dt>Parties</dt>
                  <dd>{personPlays.length}</dd>
                </div>
                <div>
                  <dt>Victoires</dt>
                  <dd>{wins}</dd>
                </div>
                <div>
                  <dt>Dernière</dt>
                  <dd>
                    {personPlays[0]
                      ? relativeDate(personPlays[0].playedAt)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PersonDetailsPage({
  person,
  plays,
  canEdit,
  onBack,
  onEdit,
}: {
  person: Person;
  plays: Play[];
  canEdit: boolean;
  onBack: () => void;
  onEdit: (person: Person) => void;
}) {
  const personPlays = plays.filter((play) =>
    play.participants.some((item) => item.personId === person.id),
  );
  const nonCooperativePlays = personPlays.filter(
    (play) =>
      !play.game.cooperative && play.participants.some((item) => item.isWinner),
  );
  const wins = personPlays.filter((play) =>
    play.participants.some(
      (item) => item.personId === person.id && item.isWinner,
    ),
  ).length;
  const nonCooperativeWins = nonCooperativePlays.filter((play) =>
    play.participants.some(
      (item) => item.personId === person.id && item.isWinner,
    ),
  ).length;
  const gameCounts = new Map<
    number,
    { title: string; color: string; count: number }
  >();
  personPlays.forEach((play) => {
    const current = gameCounts.get(play.gameId);
    gameCounts.set(play.gameId, {
      title: play.game.title,
      color: play.game.imageUrl ? "#436f5b" : "#a27a29",
      count: (current?.count ?? 0) + 1,
    });
  });
  const gameRows = [...gameCounts.values()].sort((a, b) => b.count - a.count);
  const totalGames = gameRows.reduce((total, game) => total + game.count, 0);
  let gameAngle = 0;
  const gameGradient = gameRows.length
    ? gameRows
        .map((game, index) => {
          const start = gameAngle;
          gameAngle += (game.count / totalGames) * 360;
          const colors = [
            "#436f5b",
            "#c1694f",
            "#5f6f9b",
            "#b77854",
            "#766a8f",
            "#ae7a75",
          ];
          return `${colors[index % colors.length]} ${start}deg ${gameAngle}deg`;
        })
        .join(", ")
    : "#e5e8e3 0deg 360deg";
  const winPercent = nonCooperativePlays.length
    ? Math.round((nonCooperativeWins / nonCooperativePlays.length) * 100)
    : 0;
  const resultGradient = nonCooperativePlays.length
    ? `conic-gradient(#436f5b 0deg ${winPercent * 3.6}deg, #e5e8e3 ${winPercent * 3.6}deg 360deg)`
    : "#e5e8e3";

  return (
    <div className="game-details-page person-details-page">
      <div className="game-details-toolbar">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowRight className="back-icon" size={16} /> Joueurs & amis
        </button>
        {canEdit && (
          <button
            className="secondary-button"
            type="button"
            onClick={() => onEdit(person)}
          >
            <Pencil size={16} /> Modifier
          </button>
        )}
      </div>
      <div className="person-details-heading">
        <span className="person-details-avatar">
          <Avatar person={person} />
        </span>
        <div>
          <p className="eyebrow">Fiche joueur</p>
          <h2>{person.name}</h2>
          <p>
            {person.email || "Partenaire de jeu"}
            {person.isHousehold ? " · Membre de la maison" : ""}
          </p>
        </div>
      </div>
      <div className="game-details-stats">
        <div>
          <strong>{personPlays.length}</strong>
          <span>partie{personPlays.length > 1 ? "s" : ""}</span>
        </div>
        <div>
          <strong>{wins}</strong>
          <span>victoire{wins > 1 ? "s" : ""}</span>
        </div>
        <div>
          <strong>
            {nonCooperativePlays.length ? `${winPercent} %` : "—"}
          </strong>
          <span>victoires hors coop</span>
        </div>
        <div>
          <strong>
            {personPlays[0] ? relativeDate(personPlays[0].playedAt) : "—"}
          </strong>
          <span>dernière partie</span>
        </div>
      </div>
      <div className="person-details-columns">
        <section className="details-section">
          <p className="eyebrow">Historique</p>
          <h3>Dernières parties</h3>
          {personPlays.length ? (
            <div className="details-play-list">
              {personPlays.slice(0, 8).map((play) => {
                const won = play.participants.some(
                  (item) => item.personId === person.id && item.isWinner,
                );
                return (
                  <div className="details-play-row" key={play.id}>
                    <strong>
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(play.playedAt))}
                    </strong>
                    <span>{play.game.title}</span>
                    <small>{play.location}</small>
                    <em className={!won && !play.groupWon ? "lost" : ""}>
                      {play.game.cooperative ? (
                        play.groupWon === true ? (
                          "Victoire du groupe"
                        ) : play.groupWon === false ? (
                          "Défaite du groupe"
                        ) : (
                          "Résultat non noté"
                        )
                      ) : won ? (
                        <>
                          <Trophy size={12} /> Victoire
                        </>
                      ) : (
                        "Défaite"
                      )}
                    </em>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="details-empty">
              Aucune partie enregistrée pour le moment.
            </p>
          )}
        </section>
        <div className="person-charts">
          <section className="details-section">
            <p className="eyebrow">Répartition</p>
            <h3>Jeux les plus joués</h3>
            <div className="victory-chart-wrap">
              <div
                className="victory-chart"
                style={{ background: `conic-gradient(${gameGradient})` }}
                aria-label="Répartition des jeux joués"
              />
              <div className="victory-legend">
                {gameRows.length ? (
                  gameRows.slice(0, 6).map((game, index) => (
                    <div key={game.title}>
                      <i
                        style={{
                          backgroundColor: [
                            "#436f5b",
                            "#c1694f",
                            "#5f6f9b",
                            "#b77854",
                            "#766a8f",
                            "#ae7a75",
                          ][index % 6],
                        }}
                      />
                      <span>{game.title}</span>
                      <strong>{game.count}</strong>
                    </div>
                  ))
                ) : (
                  <p className="details-empty">Aucune partie enregistrée.</p>
                )}
              </div>
            </div>
          </section>
          <section className="details-section">
            <p className="eyebrow">Jeux compétitifs</p>
            <h3>Victoires hors coopératif</h3>
            <div className="victory-chart-wrap">
              <div
                className="victory-chart"
                style={{ background: resultGradient }}
                aria-label={`${winPercent}% de victoires aux jeux non coopératifs`}
              />
              <div className="victory-legend">
                <div>
                  <i style={{ backgroundColor: "#436f5b" }} />
                  <span>Victoires</span>
                  <strong>{nonCooperativeWins}</strong>
                </div>
                <div>
                  <i style={{ backgroundColor: "#e5e8e3" }} />
                  <span>Défaites</span>
                  <strong>
                    {Math.max(
                      0,
                      nonCooperativePlays.length - nonCooperativeWins,
                    )}
                  </strong>
                </div>
                <p className="chart-caption">
                  {nonCooperativePlays.length
                    ? `${winPercent} % de réussite sur ${nonCooperativePlays.length} partie${nonCooperativePlays.length > 1 ? "s" : ""}`
                    : "Aucune partie compétitive enregistrée."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LoansView({ games }: { games: Game[] }) {
  const loaned = games.filter((game) => game.activeLoan);
  return (
    <div className="content-panel">
      <div className="info-banner">
        <Info size={19} />
        <div>
          <strong>Une mémoire pour vos étagères</strong>
          <p>
            Enregistrez ce que vous prêtez et ce que vos amis vous confient.
          </p>
        </div>
      </div>
      <div className="loan-columns">
        <section>
          <SectionHeading title={`Empruntés (${loaned.length})`} />
          {loaned.map((game) => (
            <article className="loan-card" key={game.id}>
              <GameImage game={game} />
              <div>
                <span className="pill pill-gold">Chez vous</span>
                <h3>{game.title}</h3>
                <p>
                  Prêté par{" "}
                  <strong>{game.activeLoan?.lender?.name ?? "un ami"}</strong>
                </p>
                <small>
                  Depuis le{" "}
                  {game.activeLoan
                    ? frDate.format(
                        new Date(`${game.activeLoan.borrowedAt}T12:00:00`),
                      )
                    : "—"}
                </small>
              </div>
              <button type="button">Marquer rendu</button>
            </article>
          ))}
        </section>
        <section>
          <SectionHeading title="Prêtés (0)" />{" "}
          <EmptyState
            icon={HandHeart}
            title="Aucun jeu prêté"
            text="Toutes vos boîtes sont actuellement à la maison."
          />
        </section>
      </div>
    </div>
  );
}

function SaleView({ games }: { games: Game[] }) {
  const saleGames = games.filter((game) => game.forSale);
  const total = saleGames.reduce(
    (sum, game) => sum + Number(game.salePrice ?? 0),
    0,
  );
  return (
    <div className="content-panel">
      <div className="sale-summary">
        <span>
          <CircleDollarSign size={24} />
        </span>
        <div>
          <p>Valeur de votre sélection</p>
          <strong>{total.toLocaleString("fr-FR")} €</strong>
        </div>
        <small>
          {saleGames.length} jeu{saleGames.length > 1 ? "x" : ""} cherche
          {saleGames.length > 1 ? "nt" : ""} une nouvelle maison
        </small>
      </div>
      <div className="games-grid sale-grid">
        {saleGames.map((game) => (
          <article className="sale-card" key={game.id}>
            <GameImage game={game} />
            <div>
              <p>{game.categories[0] || "Jeu de société"}</p>
              <h3>{game.title}</h3>
              <span>
                {game.salePrice
                  ? `${Number(game.salePrice)} €`
                  : "Prix à définir"}
              </span>
              <button type="button">Marquer comme vendu</button>
            </div>
          </article>
        ))}
      </div>
      {!saleGames.length && (
        <EmptyState
          icon={Tag}
          title="Rien à vendre"
          text="Vous tenez encore à toutes vos boîtes."
        />
      )}
    </div>
  );
}

function StatsView({ data }: { data: DashboardData }) {
  const counts = data.games.toSorted((a, b) => b.playCount - a.playCount);
  const max = Math.max(...counts.map((game) => game.playCount), 1);
  const maxMonthlyCount = Math.max(...data.chart.map((item) => item.count), 1);
  return (
    <div className="stats-page-grid">
      <section className="panel ranking-panel">
        <SectionHeading title="Jeux les plus joués" />
        {counts.map((game, index) => (
          <div className="ranking-row" key={game.id}>
            <span className="rank">{index + 1}</span>
            <GameImage game={game} />
            <strong>{game.title}</strong>
            <div className="rank-bar">
              <i style={{ width: `${(game.playCount / max) * 100}%` }} />
            </div>
            <b>{game.playCount}</b>
          </div>
        ))}
      </section>
      <section className="panel big-chart">
        <p className="eyebrow">Sur 6 mois</p>
        <h2>{data.stats.playCount} souvenirs autour de la table</h2>
        <div className="bar-chart large">
          {data.chart.map((item) => (
            <div className="bar-slot" key={item.key}>
              <span className="bar-value">{item.count}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(8, (item.count / maxMonthlyCount) * 100)}%`,
                  }}
                />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ImportView({
  onToast,
  canEdit,
}: {
  onToast: (message: string, error?: boolean) => void;
  canEdit: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    kind: "games" | "plays";
  } | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/import/notion", {
      method: "POST",
      body: form,
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok)
      return onToast(payload.error || "Import impossible", true);
    setResult(payload);
    const noun = payload.kind === "games" ? "jeu" : "partie";
    const importedSuffix =
      payload.imported > 1
        ? payload.kind === "games"
          ? "s"
          : "es"
        : payload.kind === "games"
          ? ""
          : "e";
    onToast(
      `${payload.imported} ${noun}${payload.imported > 1 ? "s" : ""} importé${importedSuffix}`,
    );
    router.refresh();
  }

  return (
    <div className="import-layout">
      <section className="panel import-card">
        <span className="import-illustration">
          <FileArchive size={32} />
        </span>
        <p className="eyebrow">Import Notion</p>
        <h2>Importez vos jeux ou vos parties</h2>
        <p>
          Utilisez le CSV de votre liste de jeux ou l’export CSV de vos parties.
          Les propriétaires et participants seront rattachés automatiquement.
        </p>
        <button
          className={`dropzone ${file ? "has-file" : ""}`}
          type="button"
          disabled={!canEdit}
          onClick={() => inputRef.current?.click()}
        >
          {file ? (
            <>
              <Check size={25} />
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(0)} Ko · Prêt à importer</span>
            </>
          ) : (
            <>
              <Upload size={25} />
              <strong>Choisir un fichier CSV</strong>
              <span>Liste de jeux ou export de parties Notion</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
          }}
        />
        {!canEdit && (
          <p className="read-only-note">
            Connectez-vous pour importer des jeux ou des parties.
          </p>
        )}
        <button
          className="primary-button full"
          type="button"
          disabled={!canEdit || !file || loading}
          onClick={upload}
        >
          {loading ? (
            <Loader2 className="spin" size={17} />
          ) : (
            <FileArchive size={17} />
          )}{" "}
          Importer le CSV
        </button>
        {result && (
          <div className="import-result">
            <Check size={18} />
            <span>
              <strong>
                {result.imported} {result.kind === "games" ? "jeu" : "partie"}
                {result.imported > 1 ? "s" : ""} importé
                {result.imported > 1
                  ? result.kind === "games"
                    ? "s"
                    : "es"
                  : result.kind === "games"
                    ? ""
                    : "e"}
              </strong>
              {result.skipped
                ? `, ${result.skipped} ignorée${result.skipped > 1 ? "s" : ""}`
                : ", aucune erreur"}
            </span>
          </div>
        )}
      </section>
      <aside className="import-guide">
        <p className="eyebrow">Formats reconnus</p>
        <h3>Jeux ou parties</h3>
        <div className="code-sample">
          <strong>CSV jeux</strong>
          <span>
            Nom,Étiquettes,Note BGG,Possesseur,Durée,Nombre de parties
          </span>
          <span>CSV parties : Titre,Date,Lieu,Notes,Personne,Jeu,Gagnant</span>
          <span>Le nombre de parties est ignoré.</span>
        </div>
        <ul>
          <li>
            <Check size={15} /> Jeux créés s’ils sont absents
          </li>
          <li>
            <Check size={15} /> Propriétaires rattachés automatiquement
          </li>
          <li>
            <Check size={15} /> Nombre de parties ignoré dans le CSV
          </li>
        </ul>
      </aside>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Ludothèque</p>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function LoginModal({
  onClose,
  onAuthenticated,
  onToast,
}: {
  onClose: () => void;
  onAuthenticated: (name: string) => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok)
      return onToast(payload.error || "Connexion impossible.", true);
    onAuthenticated(payload.name);
    onClose();
  }

  return (
    <Modal
      title="Connexion administrateur"
      subtitle="Les visiteurs peuvent consulter la ludothèque en lecture seule."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label className="field">
          <span>Mot de passe</span>
          <input autoFocus required name="password" type="password" />
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={17} />
            ) : (
              <LogIn size={17} />
            )}{" "}
            Se connecter
          </button>
        </div>
      </form>
    </Modal>
  );
}

type GameFormState = {
  title: string;
  bggUrl: string;
  bggId: string;
  imageUrl: string;
  year: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  complexity: string;
  categories: string;
  cooperative: boolean;
  ownerIds: number[];
};

const emptyGameForm: GameFormState = {
  title: "",
  bggUrl: "",
  bggId: "",
  imageUrl: "",
  year: "",
  minPlayers: "",
  maxPlayers: "",
  playingTime: "",
  complexity: "",
  categories: "",
  cooperative: false,
  ownerIds: [],
};

function GameModal({
  people,
  editingGame,
  onClose,
  onSaved,
  onToast,
}: {
  people: Person[];
  editingGame?: Game;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [form, setForm] = useState(emptyGameForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loadingBgg, setLoadingBgg] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(form.imageUrl);
      return;
    }
    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverFile, form.imageUrl]);

  useEffect(() => {
    if (!editingGame) return;
    setForm({
      title: editingGame.title,
      bggUrl: editingGame.bggUrl ?? "",
      bggId: editingGame.bggId ?? "",
      imageUrl: editingGame.imageUrl ?? "",
      year: editingGame.year?.toString() ?? "",
      minPlayers: editingGame.minPlayers?.toString() ?? "",
      maxPlayers: editingGame.maxPlayers?.toString() ?? "",
      playingTime: editingGame.playingTime?.toString() ?? "",
      complexity: editingGame.complexity?.toString() ?? "",
      categories: editingGame.categories.join(", "),
      cooperative: editingGame.cooperative,
      ownerIds: editingGame.ownerships.map((item) => item.personId),
    });
  }, [editingGame]);

  function update<K extends keyof GameFormState>(
    key: K,
    value: GameFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function fetchBgg() {
    if (!form.bggUrl) return onToast("Collez d’abord une URL BGG", true);
    setLoadingBgg(true);
    const response = await fetch(
      `/api/bgg?url=${encodeURIComponent(form.bggUrl)}`,
    );
    const payload = await response.json();
    setLoadingBgg(false);
    if (!response.ok) return onToast(payload.error, true);
    setForm({
      title: payload.title || "",
      bggUrl: payload.bggUrl || form.bggUrl,
      bggId: payload.bggId || "",
      imageUrl: payload.imageUrl || "",
      year: payload.year?.toString() || "",
      minPlayers: payload.minPlayers?.toString() || "",
      maxPlayers: payload.maxPlayers?.toString() || "",
      playingTime: payload.playingTime?.toString() || "",
      complexity: payload.complexity?.toFixed(2) || "",
      categories: payload.categories?.join(", ") || "",
      cooperative: Boolean(payload.cooperative),
      ownerIds: form.ownerIds,
    });
    onToast("Informations récupérées depuis BGG");
  }

  function toggleOwner(personId: number) {
    setForm((current) => ({
      ...current,
      ownerIds: current.ownerIds.includes(personId)
        ? current.ownerIds.filter((id) => id !== personId)
        : [...current.ownerIds, personId],
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    let imageUrl = form.imageUrl;
    if (coverFile) {
      const uploadData = new FormData();
      uploadData.append("file", coverFile);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });
      const uploadPayload = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setSaving(false);
        return onToast(
          uploadPayload.error || "Impossible d’envoyer cette image.",
          true,
        );
      }
      imageUrl = uploadPayload.url;
    }
    const response = await fetch("/api/games", {
      method: editingGame ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        ...form,
        imageUrl,
        id: editingGame?.id,
        cooperative: form.cooperative,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    onToast(
      editingGame
        ? `${form.title} a été modifié`
        : `${form.title} rejoint la ludothèque`,
    );
    onSaved();
  }

  return (
    <Modal
      title={editingGame ? "Modifier le jeu" : "Ajouter un jeu"}
      subtitle="Complétez la fiche à la main ou laissez BGG vous aider."
      onClose={onClose}
      wide
    >
      <form className="modal-form" onSubmit={submit}>
        <div className="bgg-helper">
          <span>
            <Link2 size={19} />
          </span>
          <label>
            <b>Lien BoardGameGeek</b>
            <small>
              Les informations peuvent être préremplies automatiquement.
            </small>
            <input
              value={form.bggUrl}
              onChange={(event) => update("bggUrl", event.target.value)}
              placeholder="https://boardgamegeek.com/boardgame/…"
            />
          </label>
          <button
            className="secondary-button"
            type="button"
            onClick={fetchBgg}
            disabled={loadingBgg}
          >
            {loadingBgg ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}{" "}
            Récupérer
          </button>
        </div>
        <div className="form-grid two">
          <label className="field span-2">
            <span>Nom du jeu *</span>
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ex. Harmonies"
            />
          </label>
          <div className="field span-2">
            <span>Image de couverture</span>
            <div className="cover-upload">
              <label className="cover-upload-button" htmlFor="game-cover">
                <Upload size={16} /> Importer une couverture
              </label>
              <input
                id="game-cover"
                className="cover-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  setCoverFile(event.target.files?.[0] ?? null)
                }
              />
              {coverFile ? (
                <small>{coverFile.name}</small>
              ) : (
                <small>JPG, PNG, WEBP ou GIF · 5 Mo maximum</small>
              )}
            </div>
            {coverPreview && (
              <img
                className="cover-upload-preview"
                src={coverPreview}
                alt="Prévisualisation de la couverture"
              />
            )}
          </div>
          <label className="field">
            <span>Année</span>
            <input
              type="number"
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
              placeholder="2024"
            />
          </label>
          <label className="field">
            <span>Durée moyenne</span>
            <div className="input-suffix">
              <input
                type="number"
                value={form.playingTime}
                onChange={(event) => update("playingTime", event.target.value)}
                placeholder="45"
              />
              <i>min</i>
            </div>
          </label>
          <label className="field">
            <span>Joueurs min.</span>
            <input
              type="number"
              min="1"
              value={form.minPlayers}
              onChange={(event) => update("minPlayers", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Joueurs max.</span>
            <input
              type="number"
              min="1"
              value={form.maxPlayers}
              onChange={(event) => update("maxPlayers", event.target.value)}
            />
          </label>
          <label className="field span-2">
            <span>Catégories</span>
            <input
              value={form.categories}
              onChange={(event) => update("categories", event.target.value)}
              placeholder="Stratégie, Cartes, Famille…"
            />
          </label>
        </div>
        <fieldset className="choice-field">
          <legend>
            Propriétaires <small>Plusieurs choix possibles</small>
          </legend>
          <div className="person-choices owners">
            {people.map((person) => (
              <button
                type="button"
                className={form.ownerIds.includes(person.id) ? "selected" : ""}
                key={person.id}
                onClick={() => toggleOwner(person.id)}
              >
                <Avatar person={person} small /> {person.name}
                <Check size={14} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="switch-line">
          <input
            type="checkbox"
            checked={form.cooperative}
            onChange={(event) => update("cooperative", event.target.checked)}
          />
          <span>
            <Check size={13} />
          </span>
          <div>
            <b>Jeu coopératif</b>
            <small>Le résultat sera enregistré pour tout le groupe.</small>
          </div>
        </label>
        <input type="hidden" name="bggId" value={form.bggId} />
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : editingGame ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}{" "}
            {editingGame
              ? "Enregistrer les modifications"
              : "Ajouter à la ludothèque"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

type EveningDefaults = {
  date: string;
  time: string;
  location: string;
  participantIds: number[];
};

function loadEveningDefaults(): EveningDefaults {
  const fallback = {
    date: todayString(),
    time: "20:00",
    location: "À la maison",
    participantIds: [],
  };
  if (typeof window === "undefined") return fallback;
  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem("meeple-evening") || "{}"),
    };
  } catch {
    return fallback;
  }
}

function PlayModal({
  games,
  people,
  initialGame,
  initialPlay,
  onClose,
  onSaved,
  onToast,
}: {
  games: Game[];
  people: Person[];
  initialGame?: Game;
  initialPlay?: Play;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [defaults, setDefaults] = useState<EveningDefaults>(() => {
    if (!initialPlay) return loadEveningDefaults();
    const playedAt = new Date(initialPlay.playedAt);
    return {
      date: `${playedAt.getFullYear()}-${String(playedAt.getMonth() + 1).padStart(2, "0")}-${String(playedAt.getDate()).padStart(2, "0")}`,
      time: `${String(playedAt.getHours()).padStart(2, "0")}:${String(playedAt.getMinutes()).padStart(2, "0")}`,
      location: initialPlay.location,
      participantIds: initialPlay.participants.map((item) => item.person.id),
    };
  });
  const [gameId, setGameId] = useState(
    initialPlay?.gameId ?? initialGame?.id ?? games[0]?.id ?? 0,
  );
  const [participants, setParticipants] = useState<Set<number>>(
    () =>
      new Set(
        initialPlay?.participants.map((item) => item.person.id) ??
          loadEveningDefaults().participantIds,
      ),
  );
  const [winners, setWinners] = useState<Set<number>>(
    () =>
      new Set(
        initialPlay?.participants
          .filter((item) => item.isWinner)
          .map((item) => item.person.id) ?? [],
      ),
  );
  const [groupWon, setGroupWon] = useState<boolean | null>(
    initialPlay?.groupWon ?? null,
  );
  const [saving, setSaving] = useState(false);
  const selectedGame = games.find((game) => game.id === gameId);

  function toggle(
    setter: (value: Set<number>) => void,
    current: Set<number>,
    id: number,
  ) {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>, addAnother = false) {
    event.preventDefault();
    if (!participants.size)
      return onToast("Choisissez au moins un participant", true);
    setSaving(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const evening = {
      date: String(values.date),
      time: String(values.time),
      location: String(values.location),
      participantIds: [...participants],
    };
    const response = await fetch("/api/plays", {
      method: initialPlay ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        id: initialPlay?.id,
        gameId,
        participantIds: [...participants],
        winnerIds: [...winners],
        groupWon,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    localStorage.setItem("meeple-evening", JSON.stringify(evening));
    onToast(
      initialPlay ? "Partie modifiée" : "Partie enregistrée — à la prochaine !",
    );
    if (addAnother) {
      setDefaults(evening);
      setWinners(new Set());
      setGroupWon(null);
      setGameId(games[0]?.id ?? 0);
      onSaved();
    } else onSaved();
  }

  return (
    <Modal
      title={initialPlay ? "Modifier la partie" : "Ajouter une partie"}
      subtitle={
        initialPlay
          ? "Mettez à jour les détails de cette soirée."
          : "Les détails de la soirée seront conservés pour la saisie suivante."
      }
      onClose={onClose}
      wide
    >
      <form className="modal-form" onSubmit={(event) => submit(event, false)}>
        <div className="form-grid two">
          <label className="field span-2">
            <span>Jeu *</span>
            <select
              value={gameId}
              onChange={(event) => {
                setGameId(Number(event.target.value));
                setWinners(new Set());
                setGroupWon(null);
              }}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date *</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={defaults.date}
            />
          </label>
          <label className="field">
            <span>Heure</span>
            <input name="time" type="time" defaultValue={defaults.time} />
          </label>
          <label className="field span-2">
            <span>Lieu *</span>
            <div className="input-icon">
              <MapPin size={16} />
              <input
                name="location"
                required
                defaultValue={defaults.location}
                placeholder="À la maison, chez Marc…"
              />
            </div>
          </label>
        </div>
        <fieldset className="choice-field">
          <legend>Participants *</legend>
          <div className="person-choices">
            {people.map((person) => (
              <button
                type="button"
                className={participants.has(person.id) ? "selected" : ""}
                key={person.id}
                onClick={() => toggle(setParticipants, participants, person.id)}
              >
                <Avatar person={person} small /> {person.name}
                <Check size={14} />
              </button>
            ))}
          </div>
        </fieldset>
        {selectedGame?.cooperative ? (
          <fieldset className="choice-field">
            <legend>Résultat du groupe</legend>
            <div className="result-choice">
              <button
                type="button"
                className={groupWon === true ? "selected win" : ""}
                onClick={() => setGroupWon(true)}
              >
                <Trophy size={17} /> Victoire
              </button>
              <button
                type="button"
                className={groupWon === false ? "selected lose" : ""}
                onClick={() => setGroupWon(false)}
              >
                <X size={17} /> Défaite
              </button>
            </div>
          </fieldset>
        ) : (
          <fieldset className="choice-field">
            <legend>
              Gagnant·e·s <small>Plusieurs choix possibles</small>
            </legend>
            <div className="person-choices winners">
              {people
                .filter((person) => participants.has(person.id))
                .map((person) => (
                  <button
                    type="button"
                    className={winners.has(person.id) ? "selected" : ""}
                    key={person.id}
                    onClick={() => toggle(setWinners, winners, person.id)}
                  >
                    <Trophy size={14} /> {person.name}
                    <Check size={14} />
                  </button>
                ))}
            </div>
          </fieldset>
        )}
        <label className="field">
          <span>Notes de partie</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initialPlay?.notes ?? ""}
            placeholder="Étape de la campagne, scénario, moments mémorables…"
          />
        </label>
        <div className="modal-actions split">
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <div>
            {!initialPlay && (
              <button
                type="submit"
                name="another"
                value="yes"
                className="secondary-button"
                disabled={saving}
                onClick={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget.closest("form");
                  if (form?.reportValidity())
                    void submit(
                      {
                        preventDefault: () => undefined,
                        currentTarget: form,
                      } as FormEvent<HTMLFormElement>,
                      true,
                    );
                }}
              >
                <Plus size={16} /> Enregistrer & continuer
              </button>
            )}
            <button className="primary-button" disabled={saving}>
              {saving ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <Check size={17} />
              )}{" "}
              {initialPlay ? "Enregistrer les modifications" : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function PersonModal({
  editingPerson,
  onClose,
  onSaved,
  onToast,
}: {
  editingPerson?: Person;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(editingPerson?.name ?? "");
  const [email, setEmail] = useState(editingPerson?.email ?? "");
  const [isHousehold, setIsHousehold] = useState(
    editingPerson?.isHousehold ?? false,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/people", {
      method: editingPerson ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingPerson?.id, name, email, isHousehold }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    onToast(
      editingPerson
        ? `${payload.person.name} a été modifié`
        : `${payload.person.name} rejoint votre tablée`,
    );
    onSaved();
  }
  return (
    <Modal
      title={editingPerson ? "Modifier un joueur" : "Ajouter une personne"}
      subtitle="Un nouveau visage autour de la table."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label className="field">
          <span>Prénom ou nom *</span>
          <input
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Camille"
          />
        </label>
        <label className="field">
          <span>
            Email <small>facultatif</small>
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="camille@exemple.com"
          />
        </label>
        <label className="switch-line">
          <input
            type="checkbox"
            checked={isHousehold}
            onChange={(event) => setIsHousehold(event.target.checked)}
          />
          <span>
            <Check size={13} />
          </span>
          <div>
            <b>Membre de la maison</b>
            <small>
              Cette personne peut posséder les jeux de votre collection.
            </small>
          </div>
        </label>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : editingPerson ? (
              <Check size={17} />
            ) : (
              <UserPlus size={17} />
            )}{" "}
            {editingPerson ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function MeepleHouse({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [view, setView] = useState<View>("dashboard");
  const [gameModal, setGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();
  const [playModal, setPlayModal] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | undefined>();
  const [personModal, setPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [loginModal, setLoginModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Sidoine");
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const title = pageTitles[view];
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    fetch("/api/auth")
      .then((response) => response.json())
      .then((payload) => {
        setIsAdmin(Boolean(payload.authenticated));
        if (payload.name) setAdminName(payload.name);
      })
      .catch(() => undefined);
  }, []);

  function showToast(message: string, error = false) {
    setToast({ message, error });
    window.setTimeout(() => setToast(null), 3600);
  }
  function navigate(next: View) {
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openPlay(game?: Game) {
    setEditingPlay(undefined);
    setSelectedGame(game);
    setPlayModal(true);
  }
  function openEditPlay(play: Play) {
    setEditingPlay(play);
    setSelectedGame(undefined);
    setPlayModal(true);
  }
  function refreshed(close: () => void) {
    close();
    router.refresh();
  }
  async function deleteGame(game: Game) {
    if (!window.confirm(`Supprimer « ${game.title} » de la ludothèque ?`))
      return;
    const response = await fetch(`/api/games?id=${game.id}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    if (!response.ok)
      return showToast(
        payload.error || "Impossible de supprimer ce jeu.",
        true,
      );
    showToast(`${game.title} a été supprimé`);
    router.refresh();
  }
  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAdmin(false);
    setProfileMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span>
            <Dices size={23} />
          </span>
          <div>
            <strong>Ludo</strong>
            <em>thèque</em>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="side-nav">
          <p>Mon espace</p>
          {navMain.map((item) => (
            <button
              className={view === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "games" && <b>{data.stats.gameCount}</b>}
              {item.id === "loans" && data.stats.activeLoanCount > 0 && (
                <b className="alert-badge">{data.stats.activeLoanCount}</b>
              )}
            </button>
          ))}
          <p>Explorer</p>
          <button
            className={view === "stats" ? "active" : ""}
            type="button"
            onClick={() => navigate("stats")}
          >
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </button>
          <button
            className={view === "import" ? "active" : ""}
            type="button"
            onClick={() => navigate("import")}
          >
            <FileArchive size={18} />
            <span>Importer Notion</span>
          </button>
        </nav>
        <div className="sidebar-tip">
          <span>
            <Sparkles size={17} />
          </span>
          <strong>Le saviez-vous ?</strong>
          <p>
            Ajoutez le lien BGG d’un jeu pour remplir sa fiche automatiquement.
          </p>
        </div>
        <div className="profile">
          <Avatar
            person={{ name: isAdmin ? adminName : "Anonyme", color: "#436F5B" }}
          />
          <div>
            <strong>{isAdmin ? adminName : "Anonyme"}</strong>
            <span>{isAdmin ? "Administrateur" : "Lecture seule"}</span>
          </div>
          <button
            className="profile-menu-button"
            type="button"
            aria-label="Ouvrir le menu du profil"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={18} />
          </button>
          {profileMenuOpen && (
            <div className="profile-menu">
              {isAdmin ? (
                <button type="button" onClick={logout}>
                  <LogIn size={15} /> Se déconnecter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLoginModal(true);
                    setProfileMenuOpen(false);
                  }}
                >
                  <LogIn size={15} /> Se connecter
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="page-title">
            <p>{view === "dashboard" ? currentDate : "Ludothèque"}</p>
            <h1>{title.title}</h1>
            <span>{title.subtitle}</span>
          </div>
          <div className="header-actions">
            {isAdmin ? (
              <>
                {view !== "import" && (
                  <button
                    className="secondary-button import-button"
                    type="button"
                    onClick={() => navigate("import")}
                  >
                    <Upload size={17} /> Importer
                  </button>
                )}
                {view === "plays" ? (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => openPlay()}
                  >
                    <Plus size={17} /> Ajouter une partie
                  </button>
                ) : (
                  <>
                    <button
                      className="secondary-button play-button"
                      type="button"
                      onClick={() => openPlay()}
                    >
                      <Plus size={17} /> Ajouter une partie
                    </button>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setGameModal(true)}
                    >
                      <Plus size={17} /> Ajouter un jeu
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setLoginModal(true)}
              >
                <LogIn size={17} /> Se connecter
              </button>
            )}
          </div>
        </header>

        <div className="page-content">
          {view === "dashboard" && (
            <DashboardView
              data={data}
              setView={navigate}
              onPlay={openPlay}
              canEdit={isAdmin}
            />
          )}
          {view === "games" && (
            <GamesView
              games={data.games}
              people={data.people}
              plays={data.plays}
              onPlay={openPlay}
              canEdit={isAdmin}
              onEdit={(game) => {
                setEditingGame(game);
                setGameModal(true);
              }}
              onDelete={deleteGame}
              onToast={showToast}
              onChanged={() => router.refresh()}
            />
          )}
          {view === "plays" && (
            <PlaysView
              plays={data.plays}
              onAdd={() => openPlay()}
              onEdit={openEditPlay}
              canEdit={isAdmin}
            />
          )}
          {view === "people" && (
            <PeopleView
              people={data.people}
              plays={data.plays}
              onAdd={() => {
                setEditingPerson(undefined);
                setPersonModal(true);
              }}
              onEdit={(person) => {
                setEditingPerson(person);
                setPersonModal(true);
              }}
              canEdit={isAdmin}
            />
          )}
          {view === "loans" && <LoansView games={data.games} />}
          {view === "sale" && <SaleView games={data.games} />}
          {view === "stats" && <StatsView data={data} />}
          {view === "import" && (
            <ImportView onToast={showToast} canEdit={isAdmin} />
          )}
        </div>
      </main>

      <nav className="mobile-nav">
        {navMain.slice(0, 4).map((item) => (
          <button
            className={view === item.id ? "active" : ""}
            key={item.id}
            onClick={() => navigate(item.id)}
            type="button"
          >
            <item.icon size={19} />
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
      {gameModal && (
        <GameModal
          people={data.people}
          editingGame={editingGame}
          onClose={() => {
            setGameModal(false);
            setEditingGame(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setGameModal(false);
              setEditingGame(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {playModal && (
        <PlayModal
          games={data.games}
          people={data.people}
          initialGame={selectedGame}
          initialPlay={editingPlay}
          onClose={() => {
            setPlayModal(false);
            setEditingPlay(undefined);
            setSelectedGame(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setPlayModal(false);
              setEditingPlay(undefined);
              setSelectedGame(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {personModal && (
        <PersonModal
          editingPerson={editingPerson}
          onClose={() => {
            setPersonModal(false);
            setEditingPerson(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setPersonModal(false);
              setEditingPerson(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {loginModal && (
        <LoginModal
          onClose={() => setLoginModal(false)}
          onAuthenticated={(name) => {
            setAdminName(name);
            setIsAdmin(true);
          }}
          onToast={showToast}
        />
      )}
      {toast && (
        <div className={`toast ${toast.error ? "error" : ""}`}>
          <span>{toast.error ? <X size={16} /> : <Check size={16} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
