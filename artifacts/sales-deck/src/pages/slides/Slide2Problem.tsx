const HEADER = ({ slide, total }: { slide: string; total: string }) => (
  <>
    <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
      <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
      <div style={{ fontSize: "1.1vw", fontWeight: 700, letterSpacing: "-0.02em" }}>CryptoTrackr</div>
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
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8vw" }}>
      <BgGrid />
      <HEADER slide="02" total="15" />

      <div style={{ position: "absolute", fontSize: "35vw", fontWeight: 900, opacity: 0.025, right: "-3vw", top: "50%", transform: "translateY(-50%)", lineHeight: 1, pointerEvents: "none", color: "#FFF" }}>?</div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "80vw" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "4vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>The Problem</div>
        <h2 style={{ fontSize: "5.5vw", fontWeight: 800, margin: "0 0 5vh 0", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Most investors hold<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>without a plan.</span>
        </h2>
        <div style={{ display: "flex", gap: "5vw" }}>
          {[
            { stat: "92%", label: "of retail holders", desc: "have no defined exit strategy before a market peak." },
            { stat: "3×", label: "average drawdown", desc: "experienced by those who held through the 2021–2022 cycle without guidance." },
            { stat: "$0", label: "in structured guidance", desc: "is what most people spend on a $100K+ position — until it's too late." },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: "4vw", fontWeight: 900, color: "#F7931A", lineHeight: 1, marginBottom: "1vh" }}>{item.stat}</div>
              <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "1vh", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{item.label}</div>
              <div style={{ fontSize: "1.3vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
