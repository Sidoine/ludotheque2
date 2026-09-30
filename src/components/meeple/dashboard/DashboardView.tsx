"use client";

import styled from "@emotion/styled";
import {
  ArrowRight,
  Dices,
  HandHeart,
  LibraryBig,
  Sparkles,
  Users,
} from "lucide-react";
import type { DashboardData } from "@/lib/data";
import { SectionHeading } from "../shared/primitives";
import { Eyebrow } from "../shared/ui";
import type { Game, View } from "../types";
import { GameRow } from "./GameRow";
import { RecentPlay } from "./RecentPlay";

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
const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
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
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;
const DashboardLower = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 0.35fr);
  gap: 18px;
  margin-top: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const ChartPanel = styled(DashboardPanel)`
  min-height: 245px;
  padding: 23px 25px 19px;
`;
const ChartHeading = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  h2 {
    margin: 0;
  }
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
  min-width: 0;
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
const BarValue = styled.span`
  min-height: 12px;
  color: var(--muted);
  font-size: 9px;
`;

export function DashboardView({
  data,
  setView,
  onPlay,
  onOpenGame,
  canEdit,
}: {
  data: DashboardData;
  setView: (view: View) => void;
  onPlay: (game?: Game) => void;
  onOpenGame: (gameId: number) => void;
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
              <RecentPlay key={play.id} play={play} onOpenGame={onOpenGame} />
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
