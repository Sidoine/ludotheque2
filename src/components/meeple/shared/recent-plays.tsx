"use client";

import styled from "@emotion/styled";
import { MapPin, Trophy } from "lucide-react";
import type { Play } from "../types";
import { AvatarStack } from "./primitives";

const RecentPlayList = styled.div`
  display: flex;
  flex-direction: column;
`;
const RecentPlayRow = styled.button<{ $personView: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $personView }) =>
    $personView
      ? "92px 90px minmax(120px, 1.2fr) minmax(80px, 0.8fr) minmax(120px, 1.1fr)"
      : "92px minmax(160px, 1.2fr) minmax(80px, 0.8fr) minmax(120px, 1.1fr)"};
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  border: 0;
  border-top: 1px solid #efede7;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--forest-soft);
  }

  strong {
    color: var(--ink);
    font-size: 10px;
  }

  & > span {
    overflow: hidden;
    color: var(--muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${({ $personView }) =>
    $personView &&
    `
      & > span {
        color: var(--forest);
      }
    `}

  & > small {
    display: grid;
    gap: 3px;
    min-width: 0;
    overflow: hidden;
    color: var(--muted);
    font-size: 9px;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  @media (max-width: 700px) {
    grid-template-columns: 76px 1fr;

    small,
    em {
      grid-column: 1 / -1;
    }
  }
`;
const RecentPlayResult = styled.em<{ $lost: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  color: ${({ $lost }) => ($lost ? "#a33f2b" : "var(--forest)")};
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function RecentPlaysList({
  plays,
  onOpenPlay,
  view,
}: {
  plays: Play[];
  onOpenPlay: (playId: number) => void;
  view: { type: "game" } | { type: "person"; personId: number };
}) {
  return (
    <RecentPlayList>
      {plays.map((play) => {
        const winners = play.participants.filter(
          (participant) => participant.isWinner,
        );
        const result = play.game.cooperative ? (
          play.groupWon === true ? (
            "Victoire du groupe"
          ) : play.groupWon === false ? (
            "Défaite du groupe"
          ) : (
            "Résultat non noté"
          )
        ) : winners.length ? (
          <>
            <Trophy size={12} />{" "}
            {winners.map((winner) => winner.person.name).join(" & ")}
          </>
        ) : (
          "Résultat non noté"
        );
        const date = new Date(play.playedAt);

        return (
          <RecentPlayRow
            key={play.id}
            type="button"
            $personView={view.type === "person"}
            aria-label={`Afficher les détails de la partie de ${play.game.title} du ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date)}`}
            onClick={() => onOpenPlay(play.id)}
          >
            <strong>
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(date)}
            </strong>
            {view.type === "person" && <span>{play.game.title}</span>}
            <small>
              <AvatarStack
                people={play.participants.map((item) => item.person)}
              />
            </small>
            <small>
              <MapPin size={12} /> {play.location}
            </small>
            <RecentPlayResult
              $lost={play.game.cooperative && play.groupWon === false}
            >
              {result}
            </RecentPlayResult>
          </RecentPlayRow>
        );
      })}
    </RecentPlayList>
  );
}
