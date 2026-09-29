import { MeepleHouse } from "@/components/meeple-house";
import { ensureSeedData, getDashboardData } from "@/lib/data";

export async function renderHomePage() {
  await ensureSeedData();
  const data = await getDashboardData();
  return <MeepleHouse data={data} />;
}
