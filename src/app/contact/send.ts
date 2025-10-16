"use server";

// src/app/contact/send.ts

import { headers } from "next/headers";

import { ContactFormState } from "./state";

function resolveBaseUrl(): string {
  const headerList = headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL
      ? process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`
      : null);

  return envUrl ?? "http://localhost:3000";
}

export async function sendMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const message = formData.get("message")?.toString() ?? "";
  const honeypot = formData.get("honeypot")?.toString() ?? "";
  const submittedAt = formData.get("submittedAt")?.toString() ?? new Date().toISOString();

  const payload = { name, email, message, honeypot, submittedAt };

  try {
    const response = await fetch(`${resolveBaseUrl()}/api/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = "Unable to send your message. Please try again.";
      try {
        const data = (await response.json()) as { error?: string };
        if (data?.error) {
          errorMessage = data.error;
        }
      } catch (error) {
        console.error("Failed to parse error response from /api/contact", error);
      }

      return { status: "error", message: errorMessage };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Failed to submit contact form", error);
    return {
      status: "error",
      message: "We couldn’t send your message right now. Please try later.",
    };
  }
}
