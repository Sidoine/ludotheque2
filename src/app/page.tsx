import { MeepleHouse } from "@/components/meeple-house";
import { ensureSeedData, getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeedData();
  const data = await getDashboardData();
  return <MeepleHouse data={data} />;
}
