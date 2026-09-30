"use client";

import styled from "@emotion/styled";
import {
  Clock3,
  Dices,
  ExternalLink,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, EmptyState, GameImage } from "../shared/primitives";
import type { Game } from "../types";
import { getSortedGames } from "./getSortedGames";
import type {
  GameFilter,
  GameSort,
  GamesNavigationState,
  SortDirection,
} from "./types";

const GameContentPanel = styled.div`
  min-height: 540px;
  padding: 22px;
  @media (max-width: 700px) {
    padding: 16px;
  }
`;
const GameToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
  @media (max-width: 700px) {
    align-items: stretch;
    flex-direction: column;
  }
`;
const GameSearch = styled.label`
  width: min(370px, 40%);
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 10px;
  color: #929994;
  background: #faf9f6;
  &:focus-within {
    border-color: #a9c0b3;
    box-shadow: 0 0 0 3px rgba(49, 95, 77, 0.07);
  }
  input {
    width: 100%;
    border: 0;
    outline: 0;
    color: var(--ink);
    background: transparent;
    font-size: 11px;
  }
  @media (max-width: 700px) {
    width: 100%;
  }
`;
const GameFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 9px;
  background: #f1f0eb;
  @media (max-width: 700px) {
    overflow-x: auto;
  }
`;
const FilterButton = styled.button<{
  $active: boolean;
}>`
  min-height: 31px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  color: ${({ $active }) => ($active ? "var(--forest)" : "var(--muted)")};
  background: ${({ $active }) => ($active ? "white" : "transparent")};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 8px rgba(30,50,40,.08)" : "none"};
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  white-space: nowrap;
  cursor: pointer;
  @media (max-width: 700px) {
    flex: 1;
  }
`;
const GameSortSelect = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 10px;
  white-space: nowrap;
  select {
    min-height: 33px;
    padding: 0 9px;
    border: 1px solid var(--line);
    border-radius: 7px;
    color: var(--ink);
    background: white;
    font-size: 10px;
    cursor: pointer;
  }
  @media (max-width: 700px) {
    justify-content: space-between;
    select {
      flex: 1;
      min-width: 0;
    }
  }
`;
const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  padding-top: 22px;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding-top: 15px;
  }
  @media (max-width: 390px) {
    grid-template-columns: 1fr;
  }
`;
const GameCard = styled.article`
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: white;
  transition:
    transform 0.18s,
    box-shadow 0.18s;
  cursor: pointer;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 13px 28px rgba(40, 55, 47, 0.11);
  }
  &:hover > div:first-of-type > img {
    transform: scale(1.025);
  }
`;
const CardVisual = styled.div`
  position: relative;
  height: 205px;
  overflow: hidden;
  background: #e9e8e1;
  & > img {
    width: 100%;
    height: 100%;
    transition: transform 0.3s;
  }
  @media (max-width: 700px) {
    height: 165px;
  }
`;
const CardBadges = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;
const CardPill = styled.span<{
  $tone: "gold" | "terracotta";
}>`
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 12px;
  color: ${({ $tone }) => ($tone === "gold" ? "#806425" : "#974f39")};
  background: ${({ $tone }) => ($tone === "gold" ? "#f4e8bf" : "#f1ded5")};
  font-size: 8px;
  font-weight: 750;
`;
const CardMenuWrap = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
`;
const CardMenuButton = styled.button`
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: #3d4b44;
  background: rgba(255, 255, 255, 0.88);
  cursor: pointer;
  backdrop-filter: blur(6px);
  &:hover,
  &[aria-expanded="true"] {
    color: var(--forest);
    background: white;
  }
`;
const CardMenu = styled.div`
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 142px;
  padding: 5px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--paper);
  box-shadow: 0 10px 25px rgba(24, 39, 30, 0.18);
`;
const CardMenuItem = styled.button<{
  $danger?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 6px;
  color: ${({ $danger }) => ($danger ? "#a33f2b" : "var(--ink)")};
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: #f0eee7;
  }
`;
const CardBody = styled.div`
  padding: 15px;
  @media (max-width: 700px) {
    padding: 11px;
  }
  & > p {
    height: 15px;
    overflow: hidden;
    margin: 5px 0 12px;
    color: var(--muted);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
const GameTitleLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  h3 {
    overflow: hidden;
    margin: 0;
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  a {
    color: #94a09a;
  }
  @media (max-width: 700px) {
    h3 {
      font-size: 14px;
    }
  }
`;
const GameFacts = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 13px;
  color: #69766f;
  font-size: 9px;
  & > span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  @media (max-width: 700px) {
    & > span:nth-child(2) {
      display: none;
    }
  }
`;
const CardBggRating = styled.span`
  color: #a27a29;
  font-weight: 700;
`;
const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #efede7;
  button {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 6px 8px;
    border: 0;
    border-radius: 7px;
    color: var(--forest);
    background: var(--forest-soft);
    font-size: 9px;
    font-weight: 700;
    cursor: pointer;
  }
  @media (max-width: 700px) {
    justify-content: flex-end;
  }
`;
const OwnerLabel = styled.span`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #707b75;
  font-size: 9px;
  line-height: 1.35;
  @media (max-width: 700px) {
    display: none;
  }
`;
const OwnerAvatars = styled.span`
  display: inline-flex;
  align-items: center;
  & > * {
    border-color: var(--paper);
    color: #fff;
    background-color: #20352d !important;
    filter: none;
    text-shadow: none;
  }
`;

export function GamesView({
  games,
  initialNavigation,
  onPlay,
  onOpenGame,
  canEdit,
  onEdit,
  onDelete,
}: {
  games: Game[];
  initialNavigation?: GamesNavigationState;
  onPlay: (game: Game) => void;
  onOpenGame: (gameId: number, navigation?: GamesNavigationState) => void;
  canEdit: boolean;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}) {
  const [search, setSearch] = useState(initialNavigation?.search ?? "");
  const [filter, setFilter] = useState<GameFilter>(
    initialNavigation?.filter ?? "all",
  );
  const [sortBy, setSortBy] = useState<GameSort>(
    initialNavigation?.sortBy ?? "title",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialNavigation?.sortDirection ?? "asc",
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const navigation: GamesNavigationState = {
    search,
    filter,
    sortBy,
    sortDirection,
  };
  const sortedGames = getSortedGames(games, navigation);

  return (
    <GameContentPanel>
      <GameToolbar>
        <GameSearch>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un jeu, une catégorie…"
          />
        </GameSearch>
        <GameFilters>
          {(
            [
              ["all", "Tous"],
              ["mine", "À nous"],
              ["borrowed", "Empruntés"],
              ["sale", "À vendre"],
              ["noBgg", "Sans lien BGG"],
            ] as const
          ).map(([id, label]) => (
            <FilterButton
              key={id}
              $active={filter === id}
              type="button"
              onClick={() => setFilter(id)}
            >
              {label}
            </FilterButton>
          ))}
        </GameFilters>
        <GameSortSelect>
          <span>Trier par</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as GameSort)}
          >
            <option value="title">Ordre alphabétique</option>
            <option value="lastPlayed">Dernière partie</option>
            <option value="playingTime">Durée d’une partie</option>
            <option value="complexity">Difficulté</option>
            <option value="bggRating">Note BGG</option>
            <option value="minPlayers">Nombre minimal de joueurs</option>
            <option value="maxPlayers">Nombre maximal de joueurs</option>
          </select>
          <select
            aria-label="Ordre du tri"
            value={sortDirection}
            onChange={(event) =>
              setSortDirection(event.target.value as SortDirection)
            }
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </GameSortSelect>
      </GameToolbar>
      {sortedGames.length ? (
        <GamesGrid>
          {sortedGames.map((game) => (
            <GameCard
              key={game.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenGame(game.id, navigation)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenGame(game.id, navigation);
                }
              }}
            >
              <CardVisual>
                <GameImage game={game} variant="card" />
                <CardBadges>
                  {game.activeLoan && (
                    <CardPill $tone="gold">Chez nous, à Marc</CardPill>
                  )}
                  {game.forSale && (
                    <CardPill $tone="terracotta">
                      {game.salePrice
                        ? `${Number(game.salePrice)} €`
                        : "À vendre"}
                    </CardPill>
                  )}
                </CardBadges>
                {canEdit && (
                  <CardMenuWrap onClick={(event) => event.stopPropagation()}>
                    <CardMenuButton
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
                    </CardMenuButton>
                    {openMenuId === game.id && (
                      <CardMenu>
                        <CardMenuItem
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEdit(game);
                          }}
                        >
                          <Pencil size={15} /> Modifier
                        </CardMenuItem>
                        <CardMenuItem
                          type="button"
                          $danger
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(game);
                          }}
                        >
                          <Trash2 size={15} /> Supprimer
                        </CardMenuItem>
                      </CardMenu>
                    )}
                  </CardMenuWrap>
                )}
              </CardVisual>
              <CardBody>
                <GameTitleLine>
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
                </GameTitleLine>
                <p>
                  {game.categories.slice(0, 2).join(" · ") || "Jeu de société"}{" "}
                  {game.year ? `· ${game.year}` : ""}
                </p>
                <GameFacts>
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
                  {game.bggRating && (
                    <CardBggRating title={`Note BGG ${game.bggRating} sur 10`}>
                      <Star size={14} /> {game.bggRating}
                    </CardBggRating>
                  )}
                </GameFacts>
                <CardFooter>
                  <OwnerLabel>
                    {game.ownerships.length ? (
                      <OwnerAvatars>
                        {game.ownerships.map((item) => (
                          <Avatar
                            key={item.personId}
                            person={item.person}
                            small
                          />
                        ))}
                      </OwnerAvatars>
                    ) : (
                      <>
                        <PackageOpen size={15} /> Propriétaire non indiqué
                      </>
                    )}
                  </OwnerLabel>
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
                </CardFooter>
              </CardBody>
            </GameCard>
          ))}
        </GamesGrid>
      ) : (
        <EmptyState
          icon={Search}
          title="Aucun jeu trouvé"
          text="Essayez un autre mot ou retirez un filtre."
        />
      )}
    </GameContentPanel>
  );
}
