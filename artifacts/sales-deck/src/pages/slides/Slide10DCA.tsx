export default function Slide10DCA() {
  const months = [30, 42, 48, 55, 60, 68, 72, 80, 88, 95, 100, 105];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "10vh", left: "10vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>10 / 15</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ display: "flex", gap: "6vw", marginBottom: "4vh", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>DCA Planning</div>
            <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Structured<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>accumulation.</span>
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "1.3vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
              We model your cost-basis trajectory over time — showing exactly how disciplined recurring purchases lower your average entry and compound your position.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1vw", padding: "3vh 2.5vw" }}>
          <div style={{ display: "flex", gap: "3vw", marginBottom: "3vh" }}>
            {[{ val: "$2,500/mo", label: "Monthly purchase" }, { val: "$87,200", label: "Projected cost basis" }, { val: "0.412 BTC", label: "Projected holdings" }].map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.5vh" }}>
                <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#F7931A" }}>{m.val}</div>
                <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: "22vh", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1vw", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2vh" }}>
            {months.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1vh" }}>
                <div style={{ width: "100%", height: `${h * 0.16}vh`, backgroundColor: i === 11 ? "#F7931A" : "rgba(247,147,26,0.25)", borderRadius: "0.3vw", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "20%", background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)" }} />
                </div>
                <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.3)" }}>{labels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
