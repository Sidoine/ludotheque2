"use client";

import styled from "@emotion/styled";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import {
  AvatarStack,
  GameImage,
  GameLink,
  relativeDate,
} from "../shared/primitives";
import type { Play } from "../types";

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
const DetailsButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 3px 0 3px 6px;
  border: 0;
  color: var(--forest);
  background: transparent;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--gold);
  }
`;

export function RecentPlay({
  play,
  onOpenGame,
  onOpenPlay,
}: {
  play: Play;
  onOpenGame: (gameId: number) => void;
  onOpenPlay: (playId: number) => void;
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
          <AvatarStack people={play.participants.map((item) => item.person)} />
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
          <DetailsButton
            type="button"
            aria-label={`Voir les détails de la partie de ${play.game.title}`}
            onClick={() => onOpenPlay(play.id)}
          >
            Détails <ArrowRight size={12} />
          </DetailsButton>
        </ActivityBottom>
      </ActivityCopy>
    </ActivityRow>
  );
}
