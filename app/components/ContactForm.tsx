"use client";

import { useActionState, useState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

const initial: ContactFormState = { ok: false };

type Fields = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  if (state.ok) {
    return (
      <div className="form-success" role="status">
        <p className="form-success-title">Message sent</p>
        <p>Thanks for reaching out. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={action} className="contact-form" noValidate>
      <label className="field">
        <span>Name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={120}
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </label>
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </label>
      <label className="field">
        <span>Phone (optional)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          value={fields.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea
          name="message"
          rows={5}
          required
          maxLength={4000}
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </label>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
