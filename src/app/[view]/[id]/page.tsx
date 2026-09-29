import { notFound } from "next/navigation";
import { renderHomePage } from "../../home-page";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ view: string; id: string }>;
}) {
  const { view, id } = await params;
  const numericId = Number(id);
  if (
    (view !== "games" && view !== "people") ||
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    notFound();
  }
  return renderHomePage();
}
