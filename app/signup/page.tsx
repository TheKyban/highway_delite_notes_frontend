import { redirectIfAuthenticated } from "@/lib/auth-server";
import SignUpClient from "./signup-client";

export default async function SignUpPage() {
  // Server-side check - redirect if already authenticated
  await redirectIfAuthenticated();

  return <SignUpClient />;
}
