export default function Slide6Portal() {
  const features = [
    { icon: "📊", title: "Portfolio Dashboard", desc: "Your live holdings, cost basis, performance tracking, and milestone progress — all in one view. Log in any time." },
    { icon: "🎯", title: "Exit Strategy Planner", desc: "Your personalized, phase-by-phase distribution schedule lives here. Know exactly when to sell and how much." },
    { icon: "🔄", title: "DCA Projections", desc: "Model your accumulation pace, projected cost basis, and compound scenarios as you add to your position." },
    { icon: "📡", title: "Consultant Broadcasts", desc: "When I post an update or alert, it appears here first. Check this whenever you log in — not email, not Twitter." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "10vh", left: "20vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.07, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", bottom: "10vh", right: "10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.05, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>Bitcoin Daily</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>03 / 12</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ textAlign: "center", marginBottom: "5vh" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "2vw", color: "#22c55e", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>● Now Active</div>
          <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Your portal is live.<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>Let's walk through it.</span></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vw" }}>
          {features.map((f, i) => (
            <div key={i} style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw", display: "flex", gap: "1.5vw", alignItems: "flex-start" }}>
              <div style={{ fontSize: "2vw", lineHeight: 1, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.8vh 0" }}>{f.title}</h3>
                <p style={{ fontSize: "1.1vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
