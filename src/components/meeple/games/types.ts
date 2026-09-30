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
