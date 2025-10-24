"use client";

import { useActionState } from "react";

import { loginAction } from "./actions";

interface LoginFormProps {
  nextPath: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="u-stack u-gap-lg max-w-xl">
      <input type="hidden" name="next" value={nextPath} />
      <label className="u-stack u-gap-sm">
        <span className="u-font-medium">Access token</span>
        <input
          type="password"
          name="token"
          className="input"
          placeholder="Enter the admin token"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error ? <p className="u-text-sm u-text-error">{state.error}</p> : null}
      <button type="submit" className="button button--primary">
        Sign in
      </button>
    </form>
  );
}
