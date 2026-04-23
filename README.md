# Karigaar Landing Site


> Urban Company on Phone -> UrbanCall

> Voice AI marketplace connecting customers to skilled workers in Hyderabad — powered by Bolna AI voice agents.

> No App, No Website, Just Call


**⚙️ Backend:** [github.com/coder-zs-cse/karigaar-backend](https://github.com/coder-zs-cse/karigaar-backend)

---

## What is Karigaar?

Karigaar is a phone-first marketplace where blue-collar workers (electricians, plumbers, painters, and 17 more trades) register by calling one number, customers post jobs by calling another, and the system automatically matches, pairs, and collects feedback — all through natural Hinglish voice conversations. No app download. No smartphone required.

<img width="2156" height="3062" alt="urbancall_system_sequence_diagram" src="https://github.com/user-attachments/assets/3a22abb5-a247-48ed-a3d8-c5324ab92c86" />

**How it works:** A customer in Madhapur calls and says "mujhe electrician chahiye, fan nahi chal raha." Within minutes, Karigaar finds a nearby electrician, calls them to offer the job, and once accepted, calls the customer back with the worker's number. After the job is done, Karigaar calls the customer again to collect detailed feedback on punctuality, behavior, and quality.

Zero human intervention. Fully automated. Two phone numbers. Five AI agents.

---

## Architecture

### 5 specialized Bolna voice agents across 2 accounts

```
┌─────────────────────────────────────────────────────────────┐
│                     WORKER LINE (Account 1)                 │
│                                                             │
│  ☎ Inbound ──► Agent 1: Arjun                              │
│                Registration + queries + job completion      │
│                                                             │
│  📞 Outbound ──► Agent 2: Arjun — Job Offer                │
│                  "Madhapur mein electrician ka kaam hai"     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   CUSTOMER LINE (Account 2)                 │
│                                                             │
│  ☎ Inbound ──► Agent 3: Priya                              │
│                Job posting + status + queries               │
│                                                             │
│  📞 Outbound ──► Agent 4: Priya — Pairing                  │
│                  "Worker mil gaya, number note karo"         │
│                                                             │
│  📞 Outbound ──► Agent 5: Priya — Feedback                 │
│                  "Rating do — punctuality, behavior, quality"│
└─────────────────────────────────────────────────────────────┘
```

### End-to-end call flow

```
Worker calls ─► Agent 1 ─► Backend saves worker
                                │
Customer calls ─► Agent 3 ─► Backend saves job (searching_worker)
                                │
                    Job queue polls every 15s
                                │
                    Backend ─► Agent 2 ─► calls worker with job offer
                                │
                         Worker accepts
                                │
                    Backend ─► Agent 4 ─► calls customer with worker's number
                                │
                      Worker completes job
                                │
              Worker calls Agent 1 ─► "kaam ho gaya"
                                │
                    Backend ─► Agent 5 ─► calls customer for feedback
                                │
                         Job completed ✓
```

### System design

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Bolna AI   │────►│  FastAPI Backend  │────►│  PostgreSQL  │
│  (5 agents)  │◄────│                   │◄────│              │
└──────────────┘     │  • /webhook/bolna │     │  • workers   │
                     │  • /caller-context│     │  • customers │
  GET /caller-context│  • /health        │     │  • jobs      │
  before each call   │                   │     │  • call_logs │
                     │  Job queue (async) │     └──────────────┘
  POST /webhook      │  polls every 15s  │
  after each call    └──────────────────┘
```

---

## 20 supported trades

Electrician, plumber, painter, mason, locksmith, carpenter, AC technician, tile worker, welder, CCTV installer, pest control, cleaning service, waterproofing, false ceiling, appliance repair, geyser repair, glass fabricator, solar installer, civil work, interior texture.

---

## Tech stack

**Landing site:** HTML, CSS, JavaScript (static site)

- **Runtime:** Python, FastAPI
- **Database:** PostgreSQL
- **Voice AI:** Bolna AI (LLM + TTS + STT orchestration)
- **TTS:** ElevenLabs (Hinglish voices)
- **STT:** Deepgram Nova-3
- **LLM:** GPT-4.1 Mini
- **Hosting:** Render

---

## Setup

```bash
git clone https://github.com/coder-zs-cse/karigaar-landing.git
cd karigaar-landing

# Open index.html in browser, or serve locally:
npx serve .
```

---

## Job lifecycle

```
searching_worker ──► worker_offered ──► paired_active ──► worker_marked_complete ──► completed
       │                    │                │                                           
       ▼                    ▼                ▼                                           
   cancelled           (declined →      cancelled                                       
                    back to searching)                                                   
```

---

## Webhook design

Every Bolna call generates multiple webhook events. The backend handles them incrementally:

- **One row per call** in `call_logs` (unique on `bolna_call_id`)
- Each event merges into the existing row — only non-null fields overwrite
- DB mutations apply exactly once per call, gated by a `processed` flag
- Dispatch is by `(agent_line, agent_purpose)` — each agent has its own handler

---

## Locality matching

All 200+ Hyderabad localities are embedded in the LLM extraction prompt. The agent never reads them out — the list is used only by the extraction LLM to canonicalize spoken input (e.g., "Madyapur" → "Madhapur"). This prevents fuzzy-match drift in the database.

---

## Related

**⚙️ Backend:** [github.com/coder-zs-cse/karigaar-backend](https://github.com/coder-zs-cse/karigaar-backend)

---

## License

MIT
