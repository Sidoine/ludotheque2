"use client";

import styled from "@emotion/styled";
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

const DashboardPanel = styled.div`
  min-height: 348px;
  padding: 21px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const GameRows = styled.div`
  display: flex;
  flex-direction: column;
`;
const GameRowContainer = styled.article`
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px 3px;
  border-top: 1px solid #eeece6;
  &:first-child {
    border-top: 0;
  }
`;
const GameRowCopy = styled.div`
  flex: 1;
  min-width: 0;
`;
const GameRowTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  h3 {
    overflow: hidden;
    margin: 0 0 4px;
    font-family: var(--serif);
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
const Badge = styled.span<{ $tone: "sale" | "loan" }>`
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 0 7px;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 750;
  white-space: nowrap;
  color: ${({ $tone }) => ($tone === "sale" ? "#9d4f3d" : "#806425")};
  background: ${({ $tone }) => ($tone === "sale" ? "#f5e2db" : "#f4e8bf")};
`;
const MicroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #69756e;
  font-size: 9px;
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`;
const GameRowStats = styled.div`
  width: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted);
  strong {
    color: var(--forest);
    font-family: var(--serif);
    font-size: 19px;
    font-weight: 500;
  }
  span {
    font-size: 8px;
  }
`;
const ActivityRow = styled.article`
  min-height: 91px;
  display: flex;
  gap: 12px;
  padding: 11px 2px;
  border-top: 1px solid #eeece6;
  &:first-child {
    border-top: 0;
  }
`;
const ActivityCopy = styled.div`
  min-width: 0;
  flex: 1;
`;
const ActivityTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  h3 {
    overflow: hidden;
    margin: 1px 0 5px;
    font-family: var(--serif);
    font-size: 13px;
    font-weight: 600;
  }
  span {
    color: #9aa09c;
    font-size: 8px;
    white-space: nowrap;
  }
`;
const ActivityBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const Winner = styled.span<{ $lost?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ $lost }) => ($lost ? "#a35341" : "var(--forest)")};
  font-size: 9px;
`;
const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
`;
const StatCard = styled.article`
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const StatCopy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  span {
    color: #69756e;
    font-size: 9px;
  }
  strong {
    color: var(--forest);
    font-family: var(--serif);
    font-size: 25px;
    font-weight: 500;
    line-height: 1.15;
  }
  small {
    color: var(--muted);
    font-size: 9px;
  }
`;
const StatIcon = styled.span<{ $tone: string }>`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  color: var(--forest);
  background: var(--forest-soft);
`;
const DashboardGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 18px;
`;
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;
const DashboardLower = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.35fr);
  gap: 18px;
  margin-top: 18px;
`;
const ChartPanel = styled(DashboardPanel)`
  min-height: 245px;
  padding: 23px 25px 19px;
`;
const ChartHeading = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ChartTotal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--muted);
  strong {
    color: var(--forest);
    font-family: var(--serif);
    font-size: 24px;
  }
  span {
    font-size: 9px;
  }
`;
const BarChart = styled.div`
  height: 150px;
  display: flex;
  align-items: end;
  justify-content: space-around;
  gap: 12px;
  margin-top: 20px;
`;
const BarSlot = styled.div`
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 5px;
  color: var(--muted);
  font-size: 9px;
`;
const BarTrack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  border-radius: 6px;
  background: #edf0eb;
`;
const Bar = styled.div`
  width: 100%;
  border-radius: 6px;
  background: var(--forest);
`;
const ChallengeCard = styled.div`
  position: relative;
  padding: 25px;
  border-radius: 13px;
  color: white;
  background: var(--forest-dark);
  h2 {
    margin: 8px 0;
    font-family: var(--serif);
    font-weight: 500;
  }
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    line-height: 1.5;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    border: 0;
    color: #e7d8aa;
    background: transparent;
    font-weight: 700;
    cursor: pointer;
  }
`;
const ChallengeSpark = styled.span`
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  color: var(--forest-dark);
  background: #dfcf9c;
`;
const Eyebrow = styled.p`
  margin: 0 0 5px;
  color: var(--terracotta);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;
const BarValue = styled.span`
  min-height: 12px;
  color: var(--muted);
  font-size: 9px;
`;

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
    <GameRowContainer>
      <GameImage game={game} variant="row" />
      <GameRowCopy>
        <GameRowTitle>
          <h3>
            <GameLink game={game} onOpen={onOpen} />
          </h3>
          {game.forSale && <Badge $tone="sale">À vendre</Badge>}
          {game.activeLoan && <Badge $tone="loan">Emprunté</Badge>}
        </GameRowTitle>
        <p>{game.categories.slice(0, 2).join(" · ") || "Jeu de société"}</p>
        <MicroMeta>
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
        </MicroMeta>
      </GameRowCopy>
      <GameRowStats>
        <strong>{game.playCount}</strong>
        <span>partie{game.playCount > 1 ? "s" : ""}</span>
      </GameRowStats>
      {canEdit && (
        <button
          onClick={() => onPlay(game)}
          title="Ajouter une partie"
          type="button"
        >
          <Plus size={18} />
        </button>
      )}
    </GameRowContainer>
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
    <ActivityRow>
      <GameImage game={play.game} variant="activity" />
      <ActivityCopy>
        <ActivityTitle>
          <h3>
            <GameLink
              game={play.game}
              onOpen={() => onOpenGame(play.game.id)}
            />
          </h3>
          <span>{relativeDate(play.playedAt)}</span>
        </ActivityTitle>
        <p>
          <MapPin size={13} /> {play.location}
        </p>
        <ActivityBottom>
          <AvatarStack
            people={play.participants.map((item) => item.person)}
            onOpenPerson={onOpenPerson}
          />
          {winners.length > 0 && (
            <Winner>
              <Trophy size={13} /> {winners.join(" & ")}
            </Winner>
          )}
          {play.game.cooperative && play.groupWon !== null && (
            <Winner $lost={!play.groupWon}>
              <Trophy size={13} /> {play.groupWon ? "Victoire" : "Défaite"}
            </Winner>
          )}
        </ActivityBottom>
      </ActivityCopy>
    </ActivityRow>
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
      <StatsGrid>
        {statCards.map((stat) => (
          <StatCard key={stat.label}>
            <StatIcon $tone={stat.tone}>
              <stat.icon size={20} />
            </StatIcon>
            <StatCopy>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </StatCopy>
          </StatCard>
        ))}
      </StatsGrid>

      <DashboardGrid>
        <DashboardPanel>
          <SectionHeading
            title="Sur vos étagères"
            action="Toute la ludothèque"
            onAction={() => setView("games")}
          />
          <GameRows>
            {shelfGames.map((game) => (
              <GameRow
                key={game.id}
                game={game}
                onPlay={() => onPlay(game)}
                onOpen={() => onOpenGame(game.id)}
                canEdit={canEdit}
              />
            ))}
          </GameRows>
        </DashboardPanel>
        <DashboardPanel>
          <SectionHeading
            title="Dernières parties"
            action="Tout voir"
            onAction={() => setView("plays")}
          />
          <ActivityList>
            {data.plays.slice(0, 3).map((play) => (
              <RecentPlay
                key={play.id}
                play={play}
                onOpenGame={onOpenGame}
                onOpenPerson={onOpenPerson}
              />
            ))}
          </ActivityList>
        </DashboardPanel>
      </DashboardGrid>

      <DashboardLower>
        <ChartPanel>
          <ChartHeading>
            <div>
              <Eyebrow>Rythme de jeu</Eyebrow>
              <h2>Vos 6 derniers mois</h2>
            </div>
            <ChartTotal>
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
            </ChartTotal>
          </ChartHeading>
          <BarChart>
            {data.chart.map((item) => (
              <BarSlot key={item.key}>
                <BarValue>{item.count || ""}</BarValue>
                <BarTrack>
                  <Bar
                    style={{
                      height: `${Math.max(10, (item.count / maxChart) * 100)}%`,
                    }}
                  />
                </BarTrack>
                <span>{item.label}</span>
              </BarSlot>
            ))}
          </BarChart>
        </ChartPanel>
        <ChallengeCard>
          <ChallengeSpark>
            <Sparkles size={19} />
          </ChallengeSpark>
          <Eyebrow>Le petit défi</Eyebrow>
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
        </ChallengeCard>
      </DashboardLower>
    </>
  );
}
