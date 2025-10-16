"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "../actions";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <form action={logoutAction} className="u-inline-flex">
      <button type="submit" className="button button--secondary" disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
