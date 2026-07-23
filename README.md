# CallKaarigar

Landing site for **CallKaarigar** (`callkaarigar.in`) — phone-first marketplace for skilled workers.

## Setup

```bash
npm install
cp .env.example .env.local   # OWNER_EMAIL + SMTP_* for the contact form
npm run dev
```

## Contact form

Server action emails `OWNER_EMAIL` via Nodemailer (`src/actions/contact.ts`, `src/lib/email.ts`).
