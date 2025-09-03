import { redirectIfAuthenticated } from "@/lib/auth-server";
import SignInClient from "./signin-client";

export default async function SignInPage() {
  // Server-side check - redirect if already authenticated
  await redirectIfAuthenticated();

  return <SignInClient />;
}
