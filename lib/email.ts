import nodemailer from "nodemailer";

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const ownerEmail = requiredEnv("OWNER_EMAIL");
  const host = requiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || "587");
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const from = process.env.SMTP_FROM?.trim() || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = `[CallKaarigar] Contact from ${payload.name}`;
  const phoneLine = payload.phone?.trim()
    ? `Phone: ${payload.phone.trim()}`
    : "Phone: (not provided)";

  const text = [
    "New contact form submission from callkaarigar.in",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    phoneLine,
    "",
    "Message:",
    payload.message,
    "",
    "—",
    "Sent via CallKaarigar website contact form",
  ].join("\n");

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;color:#1a2332;line-height:1.5">
      <h2 style="margin:0 0 8px;font-size:18px">New contact form submission</h2>
      <p style="margin:0 0 20px;color:#5a6570;font-size:14px">from callkaarigar.in</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:8px 0;color:#5a6570;width:90px">Name</td>
          <td style="padding:8px 0;font-weight:600">${escapeHtml(payload.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#5a6570">Email</td>
          <td style="padding:8px 0">
            <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#5a6570">Phone</td>
          <td style="padding:8px 0">${escapeHtml(payload.phone?.trim() || "(not provided)")}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding:16px;background:#f3f6f8;border-radius:8px">
        <p style="margin:0 0 8px;color:#5a6570;font-size:12px;text-transform:uppercase;letter-spacing:0.06em">Message</p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(payload.message)}</p>
      </div>
    </div>
  `.trim();

  await transporter.sendMail({
    from: `"CallKaarigar Website" <${from}>`,
    to: ownerEmail,
    replyTo: payload.email,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
