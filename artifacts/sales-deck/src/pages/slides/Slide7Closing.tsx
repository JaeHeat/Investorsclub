export default function Slide7Closing() {
  const metrics = [
    { val: "100%", label: "Bitcoin-focused" },
    { val: "4×", label: "Quarterly sessions" },
    { val: "24/7", label: "Portal access" },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.07, filter: "blur(15vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ position: "absolute", fontSize: "20vw", fontWeight: 900, opacity: 0.03, lineHeight: 1, pointerEvents: "none", color: "#F7931A" }}>₿TC</div>

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>Bitcoin Daily</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>07 / 15</div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "65vw", padding: "5vw", backgroundColor: "rgba(19,23,38,0.7)", backdropFilter: "blur(2vw)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2vw", boxShadow: "0 4vh 8vh rgba(0,0,0,0.5)" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "3vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>The Investment</div>

        <div style={{ fontSize: "8vw", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: "#F7931A", marginBottom: "1vh" }}>$5,000</div>
        <div style={{ fontSize: "2vw", fontWeight: 300, color: "rgba(255,255,255,0.5)", marginBottom: "4vh" }}>per year · all-inclusive</div>

        <div style={{ display: "flex", gap: "3vw", marginBottom: "4vh" }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5vw", fontWeight: 800, color: "#FFF" }}>{m.val}</div>
              <div style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: "0.5vh" }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "2vw" }}>
          <div style={{ padding: "1.8vh 4vw", backgroundColor: "#F7931A", color: "#0C0F1A", borderRadius: "0.5vw", fontSize: "1.2vw", fontWeight: 700, boxShadow: "0 1vh 3vh rgba(247,147,26,0.3)" }}>Apply Now</div>
          <div style={{ padding: "1.8vh 4vw", backgroundColor: "rgba(255,255,255,0.05)", color: "#FFF", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5vw", fontSize: "1.2vw", fontWeight: 500 }}>Schedule a Call</div>
        </div>
        <div style={{ marginTop: "2.5vh", fontSize: "0.95vw", color: "rgba(255,255,255,0.35)" }}>Acceptance by application only. Limited seats available. This is educational consultation, not financial advice.</div>
      </div>
    </div>
  );
}
