"use client";

import {
  ArrowRight,
  Clock3,
  Dices,
  ExternalLink,
  HandHeart,
  House,
  Loader2,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Modal } from "./modal";
import { Avatar, EmptyState, GameImage, relativeDate } from "./primitives";
import type { Game, Person, Play } from "./types";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}
export function GamesView({
  games,
  people,
  plays,
  onPlay,
  onOpenPerson,
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
  onOpenPerson: (personId: number) => void;
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
                        <Avatar
                          person={game.ownerships[0].person}
                          small
                          onOpen={() =>
                            onOpenPerson(game.ownerships[0].person.id)
                          }
                        />{" "}
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

export function GameDetailsPage({
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
