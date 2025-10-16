import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/server";

import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const actor = await getCurrentActor();
  const nextPath = typeof searchParams?.next === "string" ? searchParams.next : "/admin/comments";

  if (actor) {
    redirect(nextPath.startsWith("/") ? nextPath : "/admin/comments");
  }

  return (
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <div className="u-stack u-gap-xl">
        <h1 className="u-text-3xl u-font-semibold">Admin sign-in</h1>
        <p className="u-text-muted u-max-w-prose">
          Use the access token assigned to you in the governance playbook. Tokens are scoped per role. Contact the site owner if
          you need elevated privileges.
        </p>
        <LoginForm nextPath={nextPath} />
        <p className="u-text-sm u-text-muted">
          <Link href="/">Return to site home</Link>
        </p>
      </div>
    </div>
  );
}
