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
  Loader2,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Modal, ModalActions, ModalContent } from "./modal";
import { Avatar, EmptyState, GameImage, relativeDate } from "./primitives";
import type { Game, Person, Play } from "./types";

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
const GameSort = styled.label`
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
    flex-wrap: wrap;
    gap: 8px;
  }
  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
    & > div {
      width: 100%;
    }
    & > div > button {
      flex: 1;
      justify-content: center;
    }
    .game-navigation button {
      flex: 0 0 38px;
    }
  }
`;
const DetailsNavigation = styled.div`
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
const ActionButton = styled.button<{
  $primary?: boolean;
}>`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid
    ${({ $primary }) => ($primary ? "var(--forest)" : "#d7d5ce")};
  border-radius: 9px;
  color: ${({ $primary }) => ($primary ? "white" : "#4e5b55")};
  background: ${({ $primary }) =>
    $primary ? "var(--forest)" : "rgba(255,255,255,.72)"};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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
    grid-template-columns: 88px 1fr;
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
const DetailPlayList = styled.div`
  display: flex;
  flex-direction: column;
`;
const DetailPlayRow = styled.div`
  display: grid;
  grid-template-columns: 92px 90px minmax(100px, 1fr) minmax(120px, 1.1fr);
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  border-top: 1px solid #efede7;
  font-size: 10px;
  strong {
    color: var(--ink);
    font-size: 10px;
  }
  span,
  small {
    overflow: hidden;
    color: var(--muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: 700px) {
    grid-template-columns: 76px 1fr;
    small,
    em {
      grid-column: 1 / -1;
    }
  }
`;
const DetailResult = styled.em<{
  $lost?: boolean;
}>`
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
const LoanForm = styled.form`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  padding: 22px 27px 25px;
  @media (max-width: 700px) {
    padding: 19px;
  }
`;
const LoanField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #56635c;
  font-size: 9px;
  font-weight: 750;
  input,
  select {
    width: 100%;
    min-height: 40px;
    padding: 0 11px;
    border: 1px solid #dcdad2;
    border-radius: 8px;
    outline: 0;
    color: var(--ink);
    background: white;
    font-size: 11px;
    &:focus {
      border-color: #91aa9c;
      box-shadow: 0 0 0 3px rgba(49, 95, 77, 0.07);
    }
  }
  small {
    color: #a0a5a2;
    font-weight: 400;
  }
`;
const LoanSpinner = styled(Loader2)`
  animation: loan-spin 1s linear infinite;
  @keyframes loan-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}
export type GameFilter = "all" | "mine" | "borrowed" | "sale" | "noBgg";
export type GameSort =
  | "title"
  | "lastPlayed"
  | "playingTime"
  | "complexity"
  | "bggRating"
  | "minPlayers"
  | "maxPlayers";
export type SortDirection = "asc" | "desc";
export type GamesNavigationState = {
  search: string;
  filter: GameFilter;
  sortBy: GameSort;
  sortDirection: SortDirection;
};

export function getSortedGames(
  games: Game[],
  { search, filter, sortBy, sortDirection }: GamesNavigationState,
) {
  const filtered = games.filter((game) => {
    const matches =
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.categories.join(" ").toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (filter === "mine")
      return game.ownerships.some((item) => item.person.isHousehold);
    if (filter === "borrowed") return Boolean(game.activeLoan);
    if (filter === "sale") return game.forSale;
    if (filter === "noBgg") return !game.bggUrl;
    return true;
  });

  return [...filtered].sort((first, second) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (sortBy === "title")
      return direction * first.title.localeCompare(second.title, "fr");

    if (sortBy === "lastPlayed") {
      if (!first.lastPlayed) return second.lastPlayed ? 1 : 0;
      if (!second.lastPlayed) return -1;
      return (
        direction *
        (new Date(first.lastPlayed).getTime() -
          new Date(second.lastPlayed).getTime())
      );
    }

    const firstRawValue = first[sortBy];
    const secondRawValue = second[sortBy];
    if (firstRawValue === null || firstRawValue === undefined)
      return secondRawValue === null || secondRawValue === undefined ? 0 : 1;
    if (secondRawValue === null || secondRawValue === undefined) return -1;
    const difference =
      direction * (Number(firstRawValue) - Number(secondRawValue));
    return (
      difference || direction * first.title.localeCompare(second.title, "fr")
    );
  });
}

export function GamesView({
  games,
  initialNavigation,
  onPlay,
  onOpenGame,
  onOpenPerson,
  canEdit,
  onEdit,
  onDelete,
}: {
  games: Game[];
  initialNavigation?: GamesNavigationState;
  onPlay: (game: Game) => void;
  onOpenGame: (gameId: number, navigation?: GamesNavigationState) => void;
  onOpenPerson: (personId: number) => void;
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
        <GameSort>
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
        </GameSort>
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
                            onOpen={() => onOpenPerson(item.person.id)}
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
              nextGame ? `Jeu suivant : ${nextGame.title}` : "Aucun jeu suivant"
            }
            title={nextGame?.title ?? "Aucun jeu suivant"}
            disabled={!nextGame}
            onClick={() => nextGame && onNavigateGame(nextGame.id)}
          >
            <ChevronRight size={18} />
          </DetailsNavigationButton>
        </DetailsNavigation>
        <div>
          {canEdit && (
            <ActionButton type="button" onClick={toggleSale}>
              <Tag size={16} />{" "}
              {game.forSale ? "Retirer de la vente" : "Marquer à vendre"}
            </ActionButton>
          )}
          {canEdit && (
            <ActionButton
              type="button"
              onClick={game.activeLoan ? returnGame : () => setLoanModal(true)}
            >
              <HandHeart size={16} />{" "}
              {game.activeLoan ? "Marquer rendu" : "Enregistrer un emprunt"}
            </ActionButton>
          )}
          {canEdit && (
            <ActionButton type="button" onClick={() => onEdit(game)}>
              <Pencil size={16} /> Modifier
            </ActionButton>
          )}
          {canEdit && (
            <ActionButton $primary type="button" onClick={() => onPlay(game)}>
              <Plus size={16} /> Noter une partie
            </ActionButton>
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
            <DetailPlayList>
              {gamePlays.slice(0, 6).map((play) => {
                const winners = play.participants
                  .filter((participant) => participant.isWinner)
                  .map((participant) => participant.person.name);
                const result = play.game.cooperative ? (
                  play.groupWon === true ? (
                    <>
                      <Trophy size={12} /> Victoire
                    </>
                  ) : play.groupWon === false ? (
                    "Défaite"
                  ) : (
                    "Résultat non noté"
                  )
                ) : winners.length ? (
                  <>
                    <Trophy size={12} /> {winners.join(" & ")}
                  </>
                ) : (
                  "Résultat non noté"
                );
                return (
                  <DetailPlayRow key={play.id}>
                    <strong>
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(play.playedAt))}
                    </strong>
                    <span>{play.location}</span>
                    <small>
                      {play.participants
                        .map((participant) => participant.person.name)
                        .join(", ")}
                    </small>
                    <DetailResult $lost={play.groupWon === false}>
                      {result}
                    </DetailResult>
                  </DetailPlayRow>
                );
              })}
            </DetailPlayList>
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

function GameLoanModal({
  game,
  people,
  onClose,
  onSaved,
  onToast,
}: {
  game: Game;
  people: Person[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [borrowerId, setBorrowerId] = useState(people[0]?.id ?? 0);
  const [borrowedAt, setBorrowedAt] = useState(todayString());
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borrowerId)
      return onToast("Choisissez la personne qui emprunte ce jeu.", true);
    setSaving(true);
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: game.id,
        borrowerId,
        borrowedAt,
        dueAt: dueAt || null,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok)
      return onToast(
        payload.error || "Impossible d’enregistrer ce prêt.",
        true,
      );
    onToast(`${game.title} est maintenant emprunté`);
    onSaved();
  }
  return (
    <Modal
      title="Enregistrer un emprunt"
      subtitle="Indiquez qui emprunte cette boîte."
      onClose={onClose}
    >
      <LoanForm onSubmit={submit}>
        <ModalContent>
          <LoanField>
            <span>Emprunté par *</span>
            <select
              value={borrowerId}
              onChange={(event) => setBorrowerId(Number(event.target.value))}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </LoanField>
          <LoanField>
            <span>Date d’emprunt *</span>
            <input
              type="date"
              required
              value={borrowedAt}
              onChange={(event) => setBorrowedAt(event.target.value)}
            />
          </LoanField>
          <LoanField>
            <span>
              Date de retour prévue <small>facultatif</small>
            </span>
            <input
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </LoanField>
        </ModalContent>
        <ModalActions>
          <ActionButton type="button" onClick={onClose}>
            Annuler
          </ActionButton>
          <ActionButton $primary disabled={saving}>
            {saving ? <LoanSpinner size={17} /> : <HandHeart size={17} />}{" "}
            Enregistrer l’emprunt
          </ActionButton>
        </ModalActions>
      </LoanForm>
    </Modal>
  );
}
