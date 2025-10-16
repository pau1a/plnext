"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth/server";
import { getSessionCookieName } from "@/lib/auth/session";
import { actorHasPermission } from "@/lib/auth/rbac";

interface LoginResult {
  error?: string;
}

export async function loginAction(_: LoginResult, formData: FormData): Promise<LoginResult> {
  const token = formData.get("token");
  const next = (formData.get("next") as string | null) ?? "/admin/comments";

  if (typeof token !== "string" || !token.trim()) {
    return { error: "Enter an access token" };
  }

  try {
    const actor = await createSession(token);
    if (!actorHasPermission(actor, "comments:moderate")) {
      const cookieStore = cookies();
      cookieStore.delete(getSessionCookieName());
      return { error: "You do not have permission to moderate comments." };
    }

    const redirectTarget = next.startsWith("/") ? next : "/admin/comments";
    redirect(redirectTarget);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return { error: "Invalid token" };
    }

    return { error: "Unable to sign in" };
  }
}
