import { renderHomePage } from "./home-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return renderHomePage();
}
