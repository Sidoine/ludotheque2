"use client";

import styled from "@emotion/styled";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dices,
  ExternalLink,
  HandHeart,
  House,
  PackageOpen,
  Pencil,
  Plus,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { GameImage, relativeDate } from "../shared/primitives";
import { RecentPlaysList } from "../shared/recent-plays";
import type { Game, Person, Play } from "../types";
import { GameActionButton } from "./GameActionButton";
import { GameLoanModal } from "./GameLoanModal";

const GameDetailsShell = styled.div`
  padding-bottom: 24px;
`;
const DetailsToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
  & > div {
    display: flex;
    gap: 8px;
  }
  .game-actions {
    flex-wrap: wrap;
  }
  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
    & > div {
      width: 100%;
    }
    .game-actions > button {
      flex: 1;
      justify-content: center;
    }
    .game-navigation button {
      flex: 0 0 38px;
    }
  }
`;
const DetailsNavigationGroup = styled.div`
  align-items: center;
`;
const DetailsNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 5px !important;
`;
const DetailsNavigationButton = styled.button`
  width: 38px;
  height: 38px;
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  padding: 0;
  border: 1px solid #d7d5ce;
  border-radius: 9px;
  color: #4e5b55;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  &:hover:not(:disabled) {
    color: var(--forest);
    border-color: #a9c0b3;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    color: var(--forest);
  }
  svg {
    transform: rotate(180deg);
  }
`;

const DeleteActionButton = styled(GameActionButton)`
  border-color: #d8aaa2;
  color: #a33f2b;
  background: #fff8f6;

  &:hover:not(:disabled) {
    background: #f5e2db;
  }
`;
const DetailHeading = styled.div`
  display: grid;
  grid-template-columns: 145px 1fr;
  align-items: center;
  gap: 24px;
  h2 {
    margin: 5px 0 7px;
    font-family: var(--serif);
    font-size: 30px;
    font-weight: 500;
  }
  p:not(:first-child) {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 7px 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.4;
  }
  @media (max-width: 700px) {
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 14px;
    h2 {
      font-size: 21px;
    }
  }
`;
const DetailEyebrow = styled.p`
  margin: 0 0 5px;
  color: var(--terracotta);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;
const DetailLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  color: var(--forest);
  font-size: 10px;
  font-weight: 700;
`;
const DetailFacts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 15px;
  color: var(--muted);
  font-size: 13px;
  span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
`;
const DetailRating = styled.span`
  color: var(--ink);
  font-weight: 700;
  small {
    color: var(--muted);
    font-size: 11px;
  }
`;
const DetailRatingStar = styled.span`
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: var(--gold);
  strong {
    position: absolute;
    color: var(--ink);
    font-size: 9px;
    line-height: 1;
  }
`;
const DetailStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 22px;
  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const DetailStat = styled.div`
  min-width: 0;
  padding: 12px 10px;
  border-radius: 9px;
  background: #edf1ed;
  strong {
    display: block;
    overflow: hidden;
    color: var(--forest);
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span {
    display: block;
    margin-top: 3px;
    color: var(--muted);
    font-size: 8px;
    line-height: 1.3;
  }
`;
const DetailColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 18px;
  margin-top: 25px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;
const DetailSection = styled.section`
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
  h3 {
    margin: 5px 0 15px;
    font-family: var(--serif);
    font-size: 19px;
    font-weight: 500;
  }
`;
const VictoryWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;
const VictoryChart = styled.div`
  width: 145px;
  height: 145px;
  flex: 0 0 145px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
`;
const VictoryLegend = styled.div`
  flex: 1;
  min-width: 0;
  & > div {
    display: grid;
    grid-template-columns: 9px 1fr auto;
    align-items: center;
    gap: 7px;
    padding: 6px 0;
    color: var(--muted);
    font-size: 10px;
  }
  & i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  & strong {
    color: var(--ink);
  }
`;
const DetailEmpty = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 10px;
`;

export function GameDetailsPage({
  game,
  previousGame,
  nextGame,
  people,
  plays,
  canEdit,
  onBack,
  onNavigateGame,
  onEdit,
  onPlay,
  onOpenPlay,
  onDelete,
  onToast,
  onChanged,
}: {
  game: Game;
  previousGame?: Game;
  nextGame?: Game;
  people: Person[];
  plays: Play[];
  canEdit: boolean;
  onBack: () => void;
  onNavigateGame: (gameId: number) => void;
  onEdit: (game: Game) => void;
  onPlay: (game: Game) => void;
  onOpenPlay: (playId: number) => void;
  onDelete: (game: Game) => void;
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
    <GameDetailsShell>
      <DetailsToolbar>
        <DetailsNavigationGroup>
          <BackButton type="button" onClick={onBack}>
            <ArrowRight size={16} /> Ma ludothèque
          </BackButton>
          <DetailsNavigation
            className="game-navigation"
            aria-label="Navigation entre les jeux"
          >
            <DetailsNavigationButton
              type="button"
              aria-label={
                previousGame
                  ? `Jeu précédent : ${previousGame.title}`
                  : "Aucun jeu précédent"
              }
              title={previousGame?.title ?? "Aucun jeu précédent"}
              disabled={!previousGame}
              onClick={() => previousGame && onNavigateGame(previousGame.id)}
            >
              <ChevronLeft size={18} />
            </DetailsNavigationButton>
            <DetailsNavigationButton
              type="button"
              aria-label={
                nextGame
                  ? `Jeu suivant : ${nextGame.title}`
                  : "Aucun jeu suivant"
              }
              title={nextGame?.title ?? "Aucun jeu suivant"}
              disabled={!nextGame}
              onClick={() => nextGame && onNavigateGame(nextGame.id)}
            >
              <ChevronRight size={18} />
            </DetailsNavigationButton>
          </DetailsNavigation>
        </DetailsNavigationGroup>
        <div className="game-actions">
          {canEdit && (
            <GameActionButton type="button" onClick={toggleSale}>
              <Tag size={16} />{" "}
              {game.forSale ? "Retirer de la vente" : "Marquer à vendre"}
            </GameActionButton>
          )}
          {canEdit && (
            <GameActionButton
              type="button"
              onClick={game.activeLoan ? returnGame : () => setLoanModal(true)}
            >
              <HandHeart size={16} />{" "}
              {game.activeLoan ? "Marquer rendu" : "Enregistrer un emprunt"}
            </GameActionButton>
          )}
          {canEdit && (
            <GameActionButton type="button" onClick={() => onEdit(game)}>
              <Pencil size={16} /> Modifier
            </GameActionButton>
          )}
          {canEdit && gamePlays.length === 0 && (
            <DeleteActionButton type="button" onClick={() => onDelete(game)}>
              <Trash2 size={16} /> Supprimer le jeu
            </DeleteActionButton>
          )}
          {canEdit && (
            <GameActionButton
              $primary
              type="button"
              onClick={() => onPlay(game)}
            >
              <Plus size={16} /> Ajouter une partie
            </GameActionButton>
          )}
        </div>
      </DetailsToolbar>
      <DetailHeading>
        <GameImage game={game} variant="detail" />
        <div>
          <DetailEyebrow>
            {game.categories.slice(0, 2).join(" · ") || "Jeu de société"}
          </DetailEyebrow>
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
            <DetailLink href={game.bggUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Voir sur BoardGameGeek
            </DetailLink>
          )}
          <DetailFacts>
            <span>
              <Users size={17} /> {game.minPlayers ?? "?"}–
              {game.maxPlayers ?? "?"} joueurs
            </span>
            <span>
              <Clock3 size={17} />{" "}
              {game.playingTime ? `${game.playingTime} minutes` : "Durée libre"}
            </span>
            <span>
              <Dices size={17} />{" "}
              {game.categories.length
                ? game.categories.join(" · ")
                : "Catégories non renseignées"}
            </span>
            {game.bggRating && (
              <DetailRating aria-label={`Note BGG ${game.bggRating} sur 10`}>
                <DetailRatingStar>
                  <Star size={40} />
                  <strong>{game.bggRating}</strong>
                </DetailRatingStar>
                <small>/10 BGG</small>
              </DetailRating>
            )}
          </DetailFacts>
        </div>
      </DetailHeading>
      <DetailStats>
        <DetailStat>
          <strong>{gamePlays.length}</strong>
          <span>partie{gamePlays.length > 1 ? "s" : ""}</span>
        </DetailStat>
        <DetailStat>
          <strong>{averagePlayers}</strong>
          <span>joueurs en moyenne</span>
        </DetailStat>
        <DetailStat>
          <strong>{lastPlay ? relativeDate(lastPlay.playedAt) : "—"}</strong>
          <span>dernière partie</span>
        </DetailStat>
        <DetailStat>
          <strong>{game.playingTime ? `${game.playingTime} min` : "—"}</strong>
          <span>durée moyenne</span>
        </DetailStat>
      </DetailStats>
      <DetailColumns>
        <DetailSection>
          <DetailEyebrow>Historique</DetailEyebrow>
          <h3>Dernières parties</h3>
          {gamePlays.length ? (
            <RecentPlaysList
              plays={gamePlays.slice(0, 6)}
              onOpenPlay={onOpenPlay}
              view={{ type: "game" }}
            />
          ) : (
            <DetailEmpty>Aucune partie enregistrée pour le moment.</DetailEmpty>
          )}
        </DetailSection>
        <DetailSection>
          <DetailEyebrow>Palmarès</DetailEyebrow>
          <h3>Victoires par joueur</h3>
          <VictoryWrap>
            <VictoryChart
              style={{ background: `conic-gradient(${gradient})` }}
              aria-label="Répartition des victoires par joueur"
            />
            <VictoryLegend>
              {victoryRows.length ? (
                victoryRows.map((player) => (
                  <div key={player.name}>
                    <i style={{ backgroundColor: player.color }} />
                    <span>{player.name}</span>
                    <strong>{player.wins}</strong>
                  </div>
                ))
              ) : (
                <DetailEmpty>Aucune victoire enregistrée.</DetailEmpty>
              )}
            </VictoryLegend>
          </VictoryWrap>
        </DetailSection>
      </DetailColumns>
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
    </GameDetailsShell>
  );
}
