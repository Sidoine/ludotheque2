import type { Game } from "../types";
import type { GamesNavigationState } from "./types";
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
