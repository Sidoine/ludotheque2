"use client";

import styled from "@emotion/styled";
import { Clock3, House, Plus, Users } from "lucide-react";
import { GameImage, GameLink } from "../shared/primitives";
import type { Game } from "../types";

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
  min-width: 0;
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

export function GameRow({
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
