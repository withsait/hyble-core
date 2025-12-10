import { redirect } from "next/navigation";

export default function Home() {
  // Root page - redirect based on domain (handled by middleware)
  redirect("/login");
}
