import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthResult {
  user: User | null;
  isAuthenticated: boolean;
}

export async function getServerAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken");
    console.log(authToken);

    if (!authToken) {
      return { user: null, isAuthenticated: false };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Cookie: cookieStore?.toString(),
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { user: null, isAuthenticated: false };
    }

    const data = await response.json();
    return {
      user: data.data.user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Server auth check failed:", error);
    return { user: null, isAuthenticated: false };
  }
}

export async function requireAuth(): Promise<User> {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated || !user) {
    redirect("/signin");
  }

  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const { isAuthenticated } = await getServerAuth();

  if (isAuthenticated) {
    redirect("/dashboard");
  }
}
