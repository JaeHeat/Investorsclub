const HEADER = ({ slide, total }: { slide: string; total: string }) => (
  <>
    <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
      <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
      <div style={{ fontSize: "1.1vw", fontWeight: 700, letterSpacing: "-0.02em" }}>Bitcoin Daily</div>
    </div>
    <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)", zIndex: 10 }}>2026</div>
    <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
    <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>{slide} / {total}</div>
  </>
);

const BgGrid = () => (
  <>
    <div style={{ position: "absolute", top: "-10vh", right: "-5vw", width: "50vw", height: "50vw", borderRadius: "50%", backgroundColor: "#F7931A", opacity: 0.05, filter: "blur(10vw)" }} />
    <div style={{ position: "absolute", bottom: "-20vh", left: "-10vw", width: "55vw", height: "55vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.05, filter: "blur(12vw)" }} />
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />
  </>
);

export default function Slide2Problem() {
  const agenda = [
    { num: "01", label: "Your private portal — a full walkthrough" },
    { num: "02", label: "Portfolio audit — what we'll do together first" },
    { num: "03", label: "How we stay in sync — broadcasts, calls, alerts" },
    { num: "04", label: "Bitcoin cycle framework — the foundation of our strategy" },
    { num: "05", label: "Your exit plan, DCA model & bear protection" },
    { num: "06", label: "Your first 30 days — and what to expect" },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8vw" }}>
      <BgGrid />
      <HEADER slide="02" total="12" />

      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "8vw", alignItems: "center" }}>
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "4vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Today's Call</div>
          <h2 style={{ fontSize: "5.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Here's what<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>we're covering.</span>
          </h2>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: "1.8vh" }}>
          {agenda.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "2vw", padding: "1.6vh 2vw", backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw" }}>
              <div style={{ fontSize: "0.9vw", fontWeight: 700, color: "#F7931A", flexShrink: 0, width: "2.5vw" }}>{item.num}</div>
              <div style={{ fontSize: "1.2vw", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
