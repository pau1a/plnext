import Link from "next/link";
import { redirect } from "next/navigation";

import PageShell from "@/components/layout/PageShell";
import MotionFade from "@/components/motion/MotionFade";
import { getCurrentActor } from "@/lib/auth/server";

import { LoginForm } from "./login-form";

type SearchParamsShape = Record<string, string | string[] | undefined>;
type SearchParamsInput = SearchParamsShape | Promise<SearchParamsShape>;

interface LoginPageProps {
  searchParams?: SearchParamsInput;
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

async function resolveSearchParams(
  input?: SearchParamsInput,
): Promise<SearchParamsShape> {
  if (!input) {
    return {};
  }

  if (isPromiseLike<SearchParamsShape>(input)) {
    const resolved = await input;
    return resolved ?? {};
  }

  return input;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await resolveSearchParams(searchParams);
  const actor = await getCurrentActor();
  const nextPath =
    typeof params.next === "string" ? params.next : "/admin/comments";

  if (actor) {
    redirect(nextPath.startsWith("/") ? nextPath : "/admin/comments");
  }

  return (
    <PageShell className="u-pad-block-3xl">
      <MotionFade>
        <div className="u-stack u-gap-xl">
          <h1 className="u-heading-lg u-font-semibold">Admin sign-in</h1>
          <p className="u-text-muted u-max-w-prose">
            Use the access token assigned to you in the governance playbook.
            Tokens are scoped per role. Contact the site owner if you need
            elevated privileges.
          </p>
          <LoginForm nextPath={nextPath} />
          <p className="u-text-sm u-text-muted">
            <Link href="/">Return to site home</Link>
          </p>
        </div>
      </MotionFade>
    </PageShell>
  );
}
