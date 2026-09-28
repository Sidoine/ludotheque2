import type { DashboardData } from "@/lib/data";

export type View =
  | "dashboard"
  | "games"
  | "plays"
  | "people"
  | "loans"
  | "sale"
  | "stats"
  | "import";
export type Game = DashboardData["games"][number];
export type Person = DashboardData["people"][number];
export type Play = DashboardData["plays"][number];
