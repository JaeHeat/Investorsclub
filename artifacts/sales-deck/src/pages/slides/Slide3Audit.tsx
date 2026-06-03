const BgGrid = () => (
  <>
    <div style={{ position: "absolute", top: "10vh", left: "20vw", width: "40vw", height: "40vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.07, filter: "blur(12vw)" }} />
    <div style={{ position: "absolute", bottom: "5vh", right: "10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.05, filter: "blur(10vw)" }} />
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />
  </>
);

export default function Slide3Audit() {
  const cols = [
    { num: "01", title: "Holdings Review", desc: "We start by going through your actual positions together — cost basis, unrealized gains, concentration, and anything that needs immediate attention.", accent: true },
    { num: "02", title: "Allocation Structure", desc: "We model the optimal position sizing for your goals, risk tolerance, and time horizon — and document it as your written strategy.", accent: false },
    { num: "03", title: "Written Action Plan", desc: "You leave with a clear, prioritized playbook: what to hold, what to trim, what to accumulate — and exactly when to act.", accent: false },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <BgGrid />
      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>Bitcoin Daily</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>04 / 12</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "3vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>First Priority</div>
        <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: "0 0 5vh 0", lineHeight: 1.1, letterSpacing: "-0.03em" }}>Portfolio audit &amp;<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>your written strategy.</span></h2>

        <div style={{ display: "flex", gap: "2.5vw" }}>
          {cols.map((col, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1vw", padding: "3vh 2vw", borderTop: `3px solid ${col.accent ? "#F7931A" : "rgba(247,147,26,0.3)"}` }}>
              <div style={{ fontSize: "0.9vw", fontWeight: 600, color: "#F7931A", marginBottom: "2vh", letterSpacing: "0.1em" }}>{col.num}</div>
              <h3 style={{ fontSize: "1.6vw", fontWeight: 700, margin: "0 0 1.5vh 0", lineHeight: 1.2 }}>{col.title}</h3>
              <p style={{ fontSize: "1.2vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{col.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
