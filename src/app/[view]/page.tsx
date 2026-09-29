import { notFound } from "next/navigation";
import type { View } from "@/components/meeple/types";
import { renderHomePage } from "../home-page";

const routedViews = new Set<View>([
  "dashboard",
  "games",
  "plays",
  "people",
  "loans",
  "sale",
  "stats",
  "import",
]);

export default async function RoutedHomePage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!routedViews.has(view as View)) notFound();
  return renderHomePage();
}
