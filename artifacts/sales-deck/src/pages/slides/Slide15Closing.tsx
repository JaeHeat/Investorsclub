export default function Slide15Closing() {
  const included = [
    "Initial portfolio audit & written strategy",
    "Phase-by-phase exit plan",
    "DCA accumulation model",
    "Bear market protection framework",
    "Private portal — 24/7 access",
    "Private consultant broadcasts",
    "4× quarterly 1-on-1 sessions",
    "Watchlist & cycle signal monitoring",
    "Annual strategy renewal",
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", alignItems: "center", gap: "6vw" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.07, filter: "blur(15vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", fontSize: "22vw", fontWeight: 900, opacity: 0.025, lineHeight: 1, pointerEvents: "none", color: "#F7931A", right: "-3vw", top: "50%", transform: "translateY(-50%)" }}>₿</div>

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>15 / 15</div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, paddingLeft: "7vw", display: "flex", flexDirection: "column", gap: "3vh" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, alignSelf: "flex-start", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Membership</div>
        <div style={{ fontSize: "8vw", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", color: "#F7931A" }}>$5,000</div>
        <div style={{ fontSize: "2vw", fontWeight: 300, color: "rgba(255,255,255,0.45)" }}>per year · all-inclusive</div>
        <div style={{ display: "flex", gap: "2vw", marginTop: "1vh" }}>
          <div style={{ padding: "1.8vh 3.5vw", backgroundColor: "#F7931A", color: "#0C0F1A", borderRadius: "0.5vw", fontSize: "1.2vw", fontWeight: 700, boxShadow: "0 1vh 3vh rgba(247,147,26,0.3)" }}>Apply Now</div>
          <div style={{ padding: "1.8vh 3.5vw", backgroundColor: "rgba(255,255,255,0.05)", color: "#FFF", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5vw", fontSize: "1.2vw", fontWeight: 500 }}>Schedule a Call</div>
        </div>
        <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.3)" }}>Acceptance by application only. Limited seats available. This is educational consultation, not financial advice.</div>
      </div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, paddingRight: "7vw" }}>
        <div style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1vw", padding: "3vh 2.5vw" }}>
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "2.5vh" }}>Everything included:</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "1.5vh" }}>
            {included.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
                <div style={{ width: "1.2vw", height: "1.2vw", borderRadius: "50%", backgroundColor: "rgba(247,147,26,0.15)", border: "1px solid rgba(247,147,26,0.4)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "0.4vw", height: "0.4vw", borderRadius: "50%", backgroundColor: "#F7931A" }} />
                </div>
                <div style={{ fontSize: "1.2vw", fontWeight: 400, color: "rgba(255,255,255,0.8)" }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
