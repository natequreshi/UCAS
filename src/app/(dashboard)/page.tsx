import { redirect } from "next/navigation";

// Route group (dashboard) maps this file to "/" which conflicts with app/page.tsx.
// Redirect to the actual dashboard to avoid ambiguity.
export default function DashboardGroupRoot() {
  redirect("/dashboard");
}
