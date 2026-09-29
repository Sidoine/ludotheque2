"use client";

import {
  ArrowRight,
  Dices,
  MapPin,
  Pencil,
  Plus,
  Trophy,
  UserPlus,
} from "lucide-react";
import {
  Avatar,
  AvatarStack,
  GameImage,
  GameLink,
  relativeDate,
} from "./primitives";
import type { Person, Play } from "./types";
export function PlaysView({
  plays,
  onAdd,
  onEdit,
  onOpenGame,
  onOpenPerson,
  canEdit,
}: {
  plays: Play[];
  onAdd: () => void;
  onEdit: (play: Play) => void;
  onOpenGame: (gameId: number) => void;
  onOpenPerson: (personId: number) => void;
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
                    <h3>
                      <GameLink
                        game={play.game}
                        onOpen={() => onOpenGame(play.game.id)}
                      />
                    </h3>
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
                    onOpenPerson={onOpenPerson}
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

export function PeopleView({
  people,
  plays,
  onAdd,
  onEdit,
  onOpenPerson,
  canEdit,
}: {
  people: Person[];
  plays: Play[];
  onAdd: () => void;
  onEdit: (person: Person) => void;
  onOpenPerson: (personId: number) => void;
  canEdit: boolean;
}) {
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
              onClick={() => onOpenPerson(person.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenPerson(person.id);
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
                    onEdit(person);
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

export function PersonDetailsPage({
  person,
  plays,
  canEdit,
  onOpenGame,
  onBack,
  onEdit,
}: {
  person: Person;
  plays: Play[];
  canEdit: boolean;
  onOpenGame: (gameId: number) => void;
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
                    <span>
                      <GameLink
                        game={play.game}
                        onOpen={() => onOpenGame(play.game.id)}
                      />
                    </span>
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
