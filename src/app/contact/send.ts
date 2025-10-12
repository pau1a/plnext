// src/app/contact/send.ts
"use server";

type Contact = { name: string; email: string; message: string };

export async function sendMessage(formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as Contact;
  // Replace with Resend/Postmark/webhook/DB before going public.
  console.log("[contact]", data.name, data.email, data.message);
}

