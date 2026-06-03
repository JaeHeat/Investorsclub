export default function Slide4Oversight() {
  const items = [
    { icon: "📡", title: "Private Broadcasts", desc: "When market conditions shift meaningfully, you'll get a direct update in your portal — specific action guidance for your position, not generic noise." },
    { icon: "📅", title: "Quarterly 1-on-1 Sessions", desc: "Four strategy reviews per year. We revisit your plan, assess where the cycle stands, and update your recommendations together." },
    { icon: "🔄", title: "Phase-Based Guidance", desc: "Clear signals for each cycle phase — accumulation, markup, distribution, markdown — so you always know what posture to hold." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", alignItems: "center", gap: "6vw" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.05, filter: "blur(15vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>Bitcoin Daily</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>05 / 12</div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "3vh", paddingLeft: "7vw" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, alignSelf: "flex-start", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Our Relationship</div>
        <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          How we<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>stay in sync.</span>
        </h2>
        <p style={{ fontSize: "1.3vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: "35vw", margin: 0 }}>
          I track the market continuously so you don't have to. You'll hear from me when something is worth acting on — and we'll review everything together on a regular cadence.
        </p>
        <div style={{ display: "flex", gap: "1vw", flexWrap: "wrap" as const }}>
          {["Cycle Phase Alerts", "Position Guidance", "Quarterly Calls"].map((tag, i) => (
            <div key={i} style={{ padding: "0.6vh 1.2vw", backgroundColor: "rgba(79,127,255,0.1)", border: "1px solid rgba(79,127,255,0.25)", borderRadius: "0.3vw", fontSize: "0.9vw", color: "rgba(255,255,255,0.75)" }}>{tag}</div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "2vh", paddingRight: "7vw" }}>
        {items.map((item, i) => (
          <div key={i} style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2.5vh 2vw", display: "flex", gap: "1.5vw", alignItems: "flex-start" }}>
            <div style={{ fontSize: "2vw", lineHeight: 1, flexShrink: 0, marginTop: "0.3vh" }}>{item.icon}</div>
            <div>
              <h3 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.8vh 0" }}>{item.title}</h3>
              <p style={{ fontSize: "1.1vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
