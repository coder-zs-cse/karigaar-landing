"use server";

import { sendContactEmail } from "@/lib/email";

export type ContactFormState = {
  ok: boolean;
  error?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!message || message.length < 10) {
    return { ok: false, error: "Please enter a short message (at least 10 characters)." };
  }
  if (message.length > 4000) {
    return { ok: false, error: "Message is too long." };
  }

  try {
    await sendContactEmail({ name, email, phone: phone || undefined, message });
    return { ok: true };
  } catch (err) {
    console.error("contact form email failed", err);
    return {
      ok: false,
      error: "Could not send your message right now. Please try again shortly.",
    };
  }
}
