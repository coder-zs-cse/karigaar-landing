'use client';
import { useState, useEffect } from "react";

const ACCENT = "#00D2D3";
const PURPLE = "#6C5CE7";
const CORAL = "#FF6B6B";
const GREEN = "#00E676";
const BG = "#06060C";
const CARD = "#0E0E1A";
const TEXT = "#E8E8F0";
const MUTED = "#6B6B8D";

const WORKER_PHONE = "+1 (978) 307-8564";
const CUSTOMER_PHONE = "+1 (229) 629-7740";

const agents = [
  { id: 1, name: "Arjun", type: "Inbound", line: "Worker", purpose: "Registration + queries + job completion", color: ACCENT, icon: "🎙️" },
  { id: 2, name: "Arjun — Job Offer", type: "Outbound", line: "Worker", purpose: "Calls worker → presents job → captures accept/decline", color: PURPLE, icon: "⚡" },
  { id: 3, name: "Priya", type: "Inbound", line: "Customer", purpose: "Job registration + status queries + cancellation", color: CORAL, icon: "👤" },
  { id: 4, name: "Priya — Pairing", type: "Outbound", line: "Customer", purpose: "Shares worker's phone number after acceptance", color: GREEN, icon: "📞" },
  { id: 5, name: "Priya — Feedback", type: "Outbound", line: "Customer", purpose: "NPS rating + punctuality, behavior, quality", color: "#FFD93D", icon: "⭐" },
];

const timeline = [
  { step: 1, label: "Worker Registration", time: "~90s", agent: "Agent 1", desc: "Worker calls → name, trade, locality, experience → registered" },
  { step: 2, label: "Customer Job Post", time: "~90s", agent: "Agent 3", desc: "Customer calls → service type, description, locality → job created" },
  { step: 3, label: "Job Queue Match", time: "≤15s", agent: "Backend", desc: "Polls DB → finds available worker → reserves → triggers outbound" },
  { step: 4, label: "Worker Job Offer", time: "~60s", agent: "Agent 2", desc: "Calls worker → presents job details → captures accept/decline" },
  { step: 5, label: "Customer Pairing", time: "~45s", agent: "Agent 4", desc: "Calls customer → shares worker's number → confirms noted" },
  { step: 6, label: "Job Execution", time: "IRL", agent: "Worker ↔ Customer", desc: "Worker and customer coordinate directly via phone" },
  { step: 7, label: "Feedback Collection", time: "~120s", agent: "Agent 1 → 5", desc: "Worker marks complete → system calls customer for structured feedback" },
];

const trades = [
  "Electrician", "Plumber", "Painter", "Mason", "Locksmith", "Carpenter",
  "AC Technician", "Tile Worker", "Welder", "CCTV Installer", "Pest Control",
  "Cleaning Service", "Waterproofing", "False Ceiling", "Appliance Repair",
  "Geyser Repair", "Glass Fabricator", "Solar Installer", "Civil Work", "Interior Texture"
];

const bolnaFeatures = [
  { title: "Caller-Context API", desc: "GET /caller-context injects DB state as prompt variables before each call — the agent knows who's calling before speaking.", icon: "🔌" },
  { title: "LLM Extraction", desc: "Post-call structured data extraction with typed enums, confidence scores, and reasoning — powers all DB mutations.", icon: "🧠" },
  { title: "Outbound POST /call", desc: "Programmatic outbound calls with user_data injection for personalized welcome messages and context.", icon: "📡" },
  { title: "Webhook Pipeline", desc: "Incremental event merging — every event upserts into a single call_logs row. Idempotent processing via processed flag.", icon: "🔄" },
  { title: "Multi-Agent Architecture", desc: "5 agents across 2 accounts — each with specialized prompts, extractions, and a single clear responsibility.", icon: "🤖" },
  { title: "Voice Personalization", desc: "ElevenLabs TTS with Hinglish prompts, feminine verb enforcement for Priya, paired-digit phone delivery.", icon: "🗣️" },
];

function GlowText({ children, color = ACCENT, as: Tag = "span" }) {
  return <Tag style={{ color, textShadow: `0 0 20px ${color}40, 0 0 40px ${color}20` }}>{children}</Tag>;
}

function PhoneCard({ label, phone, color, side }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${CARD} 0%, ${color}08 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: 16,
      padding: "28px 32px",
      textAlign: side === "left" ? "left" : "right",
      flex: 1,
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}80`}
    onMouseLeave={e => e.currentTarget.style.borderColor = `${color}30`}
    onClick={() => { navigator.clipboard?.writeText(phone.replace(/[^+\d]/g, "")); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <div style={{ position: "absolute", top: -40, [side === "left" ? "right" : "left"]: -40, width: 120, height: 120, borderRadius: "50%", background: `${color}08` }} />
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, color: MUTED, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: 1.5 }}>{phone}</div>
      <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12, color: copied ? GREEN : `${color}90` }}>
        {copied ? "✓ copied" : "tap to copy"}
      </div>
    </div>
  );
}

function AgentCard({ agent }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${agent.color}20`,
      borderRadius: 12,
      padding: "20px 24px",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${agent.color}60`; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = `${agent.color}20`; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: agent.color }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{agent.icon}</span>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: TEXT, fontSize: 15 }}>Agent {agent.id}: {agent.name}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, background: `${agent.color}15`, color: agent.color, padding: "2px 8px", borderRadius: 4 }}>{agent.type}</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, background: `${MUTED}15`, color: MUTED, padding: "2px 8px", borderRadius: 4 }}>{agent.line} Line</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, paddingLeft: 30 }}>{agent.purpose}</div>
    </div>
  );
}

function TimelineStep({ item, isLast }) {
  const colors = [ACCENT, CORAL, MUTED, PURPLE, GREEN, "#FFD93D", ACCENT];
  const c = colors[(item.step - 1) % colors.length];
  return (
    <div style={{ display: "flex", gap: 20, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: `${c}20`, border: `2px solid ${c}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: c
        }}>{item.step}</div>
        {!isLast && <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom, ${c}40, transparent)`, marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 24, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: TEXT, fontSize: 16 }}>{item.label}</span>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: c }}>{item.time}</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>{item.agent}</span>
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{item.desc}</div>
      </div>
    </div>
  );
}

export default function UrbanCallLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionStyle = { maxWidth: 960, margin: "0 auto", padding: "0 24px" };
  const headingStyle = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: TEXT, margin: 0 };
  const labelStyle = { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 };

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.6 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${BG}; }
        ::-webkit-scrollbar-thumb { background: ${MUTED}40; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 60, paddingBottom: 80 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}, ${PURPLE}, ${CORAL}, transparent)` }} />
        <div style={{ position: "absolute", top: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}06, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -150, left: -150, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${PURPLE}06, transparent 70%)` }} />

        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s ease infinite" }} />
            <span style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>LIVE — Hyderabad, India</span>
          </div>

          <h1 style={{ ...headingStyle, fontSize: 56, letterSpacing: -1 }}>
            <GlowText color={ACCENT}>Urban</GlowText>Call
          </h1>
          <p style={{ fontSize: 20, color: MUTED, marginTop: 12, maxWidth: 600 }}>
            Voice AI marketplace for blue-collar services. Workers register, customers post jobs, AI agents handle everything — through phone calls.
          </p>

          {/* Phone numbers */}
          <div style={{ display: "flex", gap: 20, marginTop: 40, flexWrap: "wrap" }}>
            <PhoneCard label="Worker Line — Call to Register" phone={WORKER_PHONE} color={ACCENT} side="left" />
            <PhoneCard label="Customer Line — Post a Job" phone={CUSTOMER_PHONE} color={CORAL} side="right" />
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
            {[
              { n: "0", l: "Apps Required" },
              { n: "5", l: "AI Agents" },
              { n: "20", l: "Trade Types" },
              { n: "~7min", l: "End-to-End" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: ACCENT }}>{s.n}</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — TIMELINE ═══ */}
      <section style={{ paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${MUTED}15` }}>
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: PURPLE }}>HOW IT WORKS</div>
          <h2 style={{ ...headingStyle, fontSize: 32, marginBottom: 40 }}>End-to-end autonomous flow</h2>
          {timeline.map((item, i) => (
            <TimelineStep key={item.step} item={item} isLast={i === timeline.length - 1} />
          ))}
        </div>
      </section>

      {/* ═══ ARCHITECTURE — 5 AGENTS ═══ */}
      <section style={{ paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${MUTED}15` }}>
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: ACCENT }}>SYSTEM ARCHITECTURE</div>
          <h2 style={{ ...headingStyle, fontSize: 32, marginBottom: 8 }}>5 Specialized Voice Agents</h2>
          <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>2 inbound (general-purpose) + 3 outbound (single-purpose) across 2 Bolna accounts</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {agents.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>

          {/* Backend card */}
          <div style={{
            marginTop: 16, background: CARD, border: `1px solid ${MUTED}20`, borderRadius: 12, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>🗄️</span>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: TEXT, fontSize: 15 }}>FastAPI Backend</div>
              <div style={{ fontSize: 13, color: MUTED }}>PostgreSQL (pg8000) • Background job queue (15s polling) • Webhook upsert pipeline • Deployed on Render</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BOLNA FEATURES ═══ */}
      <section style={{ paddingTop: 80, paddingBottom: 80, borderTop: `1px solid ${MUTED}15` }}>
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: CORAL }}>BOLNA AI FEATURES LEVERAGED</div>
          <h2 style={{ ...headingStyle, fontSize: 32, marginBottom: 32 }}>Every capability, pushed to production</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {bolnaFeatures.map((f, i) => (
              <div key={i} style={{
                background: CARD, border: `1px solid ${MUTED}15`, borderRadius: 12, padding: "24px",
                transition: "border-color 0.3s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${ACCENT}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${MUTED}15`}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRADES ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 60, borderTop: `1px solid ${MUTED}15` }}>
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: GREEN }}>SUPPORTED TRADES</div>
          <h2 style={{ ...headingStyle, fontSize: 24, marginBottom: 20 }}>20 categories across Hyderabad</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {trades.map((t, i) => (
              <span key={i} style={{
                fontFamily: "monospace", fontSize: 12, color: TEXT, background: `${MUTED}10`, border: `1px solid ${MUTED}20`,
                padding: "6px 14px", borderRadius: 6, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}60`; e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${MUTED}20`; e.currentTarget.style.color = TEXT; }}
              >{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section style={{ paddingTop: 60, paddingBottom: 80, borderTop: `1px solid ${MUTED}15` }}>
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, color: MUTED }}>TECH STACK</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {["Bolna AI", "FastAPI", "PostgreSQL", "ElevenLabs TTS", "Deepgram STT", "GPT-4.1-mini", "pg8000", "Render"].map((t, i) => (
              <span key={i} style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: ACCENT, background: `${ACCENT}08`,
                border: `1px solid ${ACCENT}20`, padding: "8px 16px", borderRadius: 8
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: `1px solid ${MUTED}15`, padding: "32px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>
          Built for the Bolna AI Hiring Challenge • Hyderabad, India • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
