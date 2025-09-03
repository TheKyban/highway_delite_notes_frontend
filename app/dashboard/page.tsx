import { requireAuth } from "@/lib/auth-server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  // Server-side authentication check
  const user = await requireAuth();

  return <DashboardClient initialUser={user} />;
}
