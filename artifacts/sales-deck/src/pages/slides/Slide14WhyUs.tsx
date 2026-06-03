export default function Slide14WhyUs() {
  const differentiators = [
    { icon: "🎯", title: "Bitcoin-Only Focus", desc: "We don't advise on 200 altcoins. We go deep on Bitcoin — the one asset that has proven institutional-grade staying power." },
    { icon: "🔬", title: "Cycle-Based Framework", desc: "Our strategies are built on Bitcoin's empirically observable 4-year cycles — not predictions, but probabilistic frameworks grounded in data." },
    { icon: "🔒", title: "Truly Private", desc: "Your portfolio details, strategy, and communications are never shared. One consultant, one client relationship." },
    { icon: "📝", title: "Written Strategy", desc: "You receive a documented, written plan — not vague verbal guidance. Something you can reference, revise, and execute with confidence." },
    { icon: "⚡", title: "Timely Alerts", desc: "When conditions change materially — price action, on-chain signals, macro — you hear about it within 24 hours, not after the fact." },
    { icon: "🤝", title: "No Conflicts", desc: "We don't earn commissions, hold your assets, or run a fund. Pure consultation. Our incentive is your outcomes." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "55vw", height: "55vw", borderRadius: "50%", backgroundColor: "#4F7FFF", opacity: 0.05, filter: "blur(15vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>Bitcoin Daily</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>14 / 15</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ textAlign: "center", marginBottom: "4vh" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Why Us</div>
          <h2 style={{ fontSize: "4vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Different by design.<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>Not by accident.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw" }}>
          {differentiators.map((d, i) => (
            <div key={i} style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", gap: "1.2vw", alignItems: "flex-start" }}>
              <div style={{ fontSize: "1.8vw", lineHeight: 1, flexShrink: 0 }}>{d.icon}</div>
              <div>
                <h3 style={{ fontSize: "1.25vw", fontWeight: 700, margin: "0 0 0.6vh 0" }}>{d.title}</h3>
                <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
