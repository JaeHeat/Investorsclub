export default function Slide13Roadmap() {
  const milestones = [
    { week: "Week 1", title: "Onboarding & Audit", items: ["Complete portfolio intake questionnaire", "Submit holdings for analysis", "Set risk tolerance and goals"] },
    { week: "Week 2", title: "Strategy Delivery", items: ["Receive written allocation structure", "Review exit plan for current cycle", "Activate private portal access"] },
    { week: "Week 3–4", title: "Implementation", items: ["Execute any rebalancing moves", "Set up DCA schedule", "Configure watchlist alerts"] },
    { week: "Ongoing", title: "Consultation Cadence", items: ["Monthly broadcast updates", "Quarterly 1-on-1 sessions", "Ad-hoc guidance on market events"] },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "10vh", right: "5vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>13 / 15</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ marginBottom: "4vh" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Onboarding Roadmap</div>
          <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Up and running<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>in two weeks.</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "2vw" }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              {i < milestones.length - 1 && (
                <div style={{ position: "absolute", top: "1.5vh", left: "100%", width: "2vw", height: "1px", backgroundColor: "rgba(247,147,26,0.3)", zIndex: 1 }} />
              )}
              <div style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2.5vh 1.8vw", height: "100%", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
                  <div style={{ width: "1.5vw", height: "1.5vw", borderRadius: "50%", backgroundColor: "#F7931A", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8vw", fontWeight: 700, color: "#0C0F1A" }}>{i + 1}</div>
                  <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#F7931A", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{m.week}</div>
                </div>
                <h3 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 1.5vh 0" }}>{m.title}</h3>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "1vh" }}>
                  {m.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.8vw", alignItems: "flex-start" }}>
                      <div style={{ width: "0.4vw", height: "0.4vw", borderRadius: "50%", backgroundColor: "#F7931A", marginTop: "0.7vh", flexShrink: 0 }} />
                      <div style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
