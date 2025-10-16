// src/app/contact/state.ts

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export const initialState: ContactFormState = { status: "idle" };
