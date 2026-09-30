"use client";

import styled from "@emotion/styled";
import { ArrowRight, Pencil } from "lucide-react";
import { Avatar, relativeDate } from "../shared/primitives";
import { RecentPlaysList } from "../shared/recent-plays";
import { Empty, Eyebrow, SecondaryButton } from "../shared/ui";
import type { Person, Play } from "../types";

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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const DetailsColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const DetailsSection = styled.section`
  padding-top: 16px;
  border-top: 1px solid var(--line);
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

export function PersonDetailsPage({
  person,
  plays,
  canEdit,
  onOpenPlay,
  onBack,
  onEdit,
}: {
  person: Person;
  plays: Play[];
  canEdit: boolean;
  onOpenPlay: (playId: number) => void;
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
            <RecentPlaysList
              plays={personPlays.slice(0, 8)}
              onOpenPlay={onOpenPlay}
              view={{ type: "person", personId: person.id }}
            />
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
