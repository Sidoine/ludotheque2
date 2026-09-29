"use client";

import styled from "@emotion/styled";
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

const PlaysLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 18px;
`;
const PlayHistory = styled.div`
  padding: 22px 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
  section + section {
    margin-top: 25px;
  }
`;
const MonthTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 8px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  text-transform: capitalize;
  span {
    color: var(--muted);
    font-family: inherit;
    font-size: 10px;
  }
`;
const PlayRow = styled.article`
  display: grid;
  grid-template-columns: 38px 50px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 13px;
  min-height: 82px;
  padding: 12px 0;
  border-top: 1px solid #eeece6;
  &:first-of-type {
    border-top: 0;
  }
`;
const PlayDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted);
  strong {
    color: var(--forest);
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 500;
  }
  span {
    font-size: 9px;
    text-transform: capitalize;
  }
`;
const PlayMain = styled.div`
  min-width: 0;
  h3 {
    margin: 0 0 6px;
    font-family: var(--serif);
    font-size: 14px;
  }
  p {
    display: flex;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p i {
    width: 3px;
    height: 3px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--muted);
  }
`;
const PlayWinner = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 150px;
  color: var(--forest);
  font-size: 10px;
`;
const Muted = styled.span`
  color: var(--muted);
`;
const PlayEdit = styled.button`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  &:hover {
    color: var(--forest);
    background: var(--forest-soft);
  }
`;
const SideTip = styled.aside`
  position: relative;
  align-self: start;
  padding: 27px 20px 20px;
  border-radius: 13px;
  color: var(--ink);
  background: #e8eee8;
  & > span {
    position: absolute;
    top: -14px;
    right: 20px;
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 50%;
    color: var(--forest-dark);
    background: #dfcf9c;
  }
  h3 {
    margin: 0 0 8px;
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 500;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.55;
  }
  button {
    width: 100%;
    margin-top: 18px;
  }
`;
const PrimaryButton = styled.button`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid var(--forest);
  border-radius: 9px;
  color: white;
  background: var(--forest);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;
const ReadOnlyNote = styled.p`
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
`;
const ContentPanel = styled.div`
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const PeopleIntro = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-family: var(--serif);
    font-size: 21px;
    font-weight: 500;
  }
`;
const Eyebrow = styled.p`
  margin: 0 0 5px;
  color: var(--terracotta);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;
const SecondaryButton = styled.button`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid #d7d5ce;
  border-radius: 9px;
  color: #4e5b55;
  background: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;
const PeopleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
`;
const PersonCard = styled.article`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 11px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fffefa;
  cursor: pointer;
  &:hover {
    border-color: #b8c9be;
    box-shadow: var(--shadow);
  }
  h3 {
    margin: 0 0 4px;
    font-family: var(--serif);
    font-size: 14px;
  }
  h3 span {
    margin-left: 5px;
    color: var(--forest);
    font-family: inherit;
    font-size: 8px;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
  }
  dl {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 10px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }
  dl div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  dt {
    color: var(--muted);
    font-size: 8px;
  }
  dd {
    margin: 0;
    color: var(--ink);
    font-size: 11px;
    font-weight: 700;
  }
`;
const PersonEdit = styled.button`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  &:hover {
    color: var(--forest);
    background: var(--forest-soft);
  }
`;
const DetailsPage = styled.div`
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const DetailsToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
`;
const DetailsHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  h1 {
    margin: 0;
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 500;
  }
`;
const DetailsAvatar = styled.span`
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 50%;
  color: var(--forest);
  background: var(--forest-soft);
  font-size: 22px;
`;
const DetailsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
`;
const DetailsColumns = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
`;
const DetailsSection = styled.section`
  padding-top: 16px;
  border-top: 1px solid var(--line);
`;
const DetailsList = styled.div``;
const DetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 11px;
`;
const Charts = styled.div`
  display: grid;
  gap: 18px;
`;
const ChartWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;
const Chart = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: conic-gradient(var(--forest) 0 65%, #dfcf9c 65% 100%);
`;
const Legend = styled.div`
  display: grid;
  gap: 8px;
  font-size: 10px;
`;
const Empty = styled.p`
  color: var(--muted);
  font-size: 11px;
`;
const Result = styled.em<{ $lost: boolean }>`
  color: ${({ $lost }) => ($lost ? "var(--terracotta)" : "inherit")};
  font-style: normal;
`;
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
    <PlaysLayout>
      <PlayHistory>
        {Object.entries(grouped).map(([month, monthPlays]) => (
          <section key={month}>
            <MonthTitle>
              {month}
              <span>
                {monthPlays.length} partie{monthPlays.length > 1 ? "s" : ""}
              </span>
            </MonthTitle>
            {monthPlays.map((play) => {
              const winners = play.participants.filter((item) => item.isWinner);
              return (
                <PlayRow key={play.id}>
                  <PlayDate>
                    <strong>{new Date(play.playedAt).getDate()}</strong>
                    <span>
                      {new Intl.DateTimeFormat("fr-FR", {
                        weekday: "short",
                      }).format(new Date(play.playedAt))}
                    </span>
                  </PlayDate>
                  <GameImage game={play.game} variant="activity" />
                  <PlayMain>
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
                  </PlayMain>
                  <AvatarStack
                    people={play.participants.map((item) => item.person)}
                    onOpenPerson={onOpenPerson}
                  />
                  <PlayWinner>
                    {winners.length ? (
                      <>
                        <Trophy size={14} />
                        <span>
                          {winners.map((item) => item.person.name).join(" & ")}
                        </span>
                      </>
                    ) : (
                      <Muted>Résultat non noté</Muted>
                    )}
                  </PlayWinner>
                  {canEdit && (
                    <PlayEdit
                      type="button"
                      aria-label={`Modifier la partie de ${play.game.title}`}
                      onClick={() => onEdit(play)}
                    >
                      <Pencil size={15} />
                    </PlayEdit>
                  )}
                </PlayRow>
              );
            })}
          </section>
        ))}
      </PlayHistory>
      <SideTip>
        <span>
          <Dices size={24} />
        </span>
        <h3>Une partie de plus ?</h3>
        <p>
          La date, le lieu et les joueurs de votre dernière saisie sont gardés
          pour toute la soirée.
        </p>
        {canEdit ? (
          <PrimaryButton type="button" onClick={onAdd}>
            <Plus size={17} /> Ajouter une partie
          </PrimaryButton>
        ) : (
          <ReadOnlyNote>Connectez-vous pour ajouter une partie.</ReadOnlyNote>
        )}
      </SideTip>
    </PlaysLayout>
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
    <ContentPanel>
      <PeopleIntro>
        <div>
          <Eyebrow>Votre tablée</Eyebrow>
          <h2>{people.length} personnes avec qui partager de bons moments</h2>
        </div>
        {canEdit && (
          <SecondaryButton type="button" onClick={onAdd}>
            <UserPlus size={17} /> Ajouter quelqu’un
          </SecondaryButton>
        )}
      </PeopleIntro>
      <PeopleGrid>
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
            <PersonCard
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
                <PersonEdit
                  type="button"
                  aria-label={`Modifier ${person.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(person);
                  }}
                >
                  <Pencil size={15} />
                </PersonEdit>
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
            </PersonCard>
          );
        })}
      </PeopleGrid>
    </ContentPanel>
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
    <DetailsPage>
      <DetailsToolbar>
        <BackButton type="button" onClick={onBack}>
          <ArrowRight size={16} /> Joueurs & amis
        </BackButton>
        {canEdit && (
          <SecondaryButton type="button" onClick={() => onEdit(person)}>
            <Pencil size={16} /> Modifier
          </SecondaryButton>
        )}
      </DetailsToolbar>
      <DetailsHeading>
        <DetailsAvatar>
          <Avatar person={person} />
        </DetailsAvatar>
        <div>
          <Eyebrow>Fiche joueur</Eyebrow>
          <h2>{person.name}</h2>
          <p>
            {person.email || "Partenaire de jeu"}
            {person.isHousehold ? " · Membre de la maison" : ""}
          </p>
        </div>
      </DetailsHeading>
      <DetailsStats>
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
      </DetailsStats>
      <DetailsColumns>
        <DetailsSection>
          <Eyebrow>Historique</Eyebrow>
          <h3>Dernières parties</h3>
          {personPlays.length ? (
            <DetailsList>
              {personPlays.slice(0, 8).map((play) => {
                const won = play.participants.some(
                  (item) => item.personId === person.id && item.isWinner,
                );
                return (
                  <DetailsRow key={play.id}>
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
                    <Result $lost={!won && !play.groupWon}>
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
                    </Result>
                  </DetailsRow>
                );
              })}
            </DetailsList>
          ) : (
            <Empty>Aucune partie enregistrée pour le moment.</Empty>
          )}
        </DetailsSection>
        <Charts>
          <DetailsSection>
            <Eyebrow>Répartition</Eyebrow>
            <h3>Jeux les plus joués</h3>
            <ChartWrap>
              <Chart
                style={{ background: `conic-gradient(${gameGradient})` }}
                aria-label="Répartition des jeux joués"
              />
              <Legend>
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
                  <Empty>Aucune partie enregistrée.</Empty>
                )}
              </Legend>
            </ChartWrap>
          </DetailsSection>
          <DetailsSection>
            <Eyebrow>Jeux compétitifs</Eyebrow>
            <h3>Victoires hors coopératif</h3>
            <ChartWrap>
              <Chart
                style={{ background: resultGradient }}
                aria-label={`${winPercent}% de victoires aux jeux non coopératifs`}
              />
              <Legend>
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
                <Empty>
                  {nonCooperativePlays.length
                    ? `${winPercent} % de réussite sur ${nonCooperativePlays.length} partie${nonCooperativePlays.length > 1 ? "s" : ""}`
                    : "Aucune partie compétitive enregistrée."}
                </Empty>
              </Legend>
            </ChartWrap>
          </DetailsSection>
        </Charts>
      </DetailsColumns>
    </DetailsPage>
  );
}
