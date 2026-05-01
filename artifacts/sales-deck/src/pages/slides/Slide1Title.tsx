export default function Slide1Title() {
  const BG = "#0C0F1A";
  const ORANGE = "#F7931A";
  const PURPLE = "#7C6BF0";
  const Surface = "#131726";

  const Bg = () => (
    <>
      <div style={{ position: "absolute", top: "-20vh", right: "-10vw", width: "55vw", height: "55vw", borderRadius: "50%", backgroundColor: ORANGE, opacity: 0.06, filter: "blur(10vw)" }} />
      <div style={{ position: "absolute", bottom: "-30vh", left: "-15vw", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: PURPLE, opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.6, pointerEvents: "none" }} />
    </>
  );

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: BG, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", color: "#FFF" }}>
      <Bg />
      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: ORANGE, borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: BG }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700, letterSpacing: "-0.02em" }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)", zIndex: 10 }}>2026</div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "70vw" }}>
        <div style={{ display: "inline-flex", alignItems: "center", padding: "0.6vh 1.4vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: ORANGE, fontSize: "0.95vw", fontWeight: 600, marginBottom: "4vh", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          ₿ Application Only · $5,000 / year
        </div>
        <h1 style={{ fontSize: "6.5vw", fontWeight: 900, margin: "0 0 2vh 0", lineHeight: 1.05, letterSpacing: "-0.04em" }}>
          Bitcoin Daily<br /><span style={{ color: ORANGE }}>Advisory</span>
        </h1>
        <p style={{ fontSize: "1.75vw", fontWeight: 300, color: "rgba(255,255,255,0.65)", margin: "0 0 6vh 0", lineHeight: 1.55, maxWidth: "52vw" }}>
          Institutional-grade Bitcoin cycle intelligence, personalized portfolio strategy, and private client access — for those who refuse to leave returns on the table.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "2vw", marginBottom: "7vh" }}>
          <div style={{ padding: "1.5vh 3vw", backgroundColor: ORANGE, color: BG, borderRadius: "0.5vw", fontSize: "1.1vw", fontWeight: 700, boxShadow: "0 1vh 2.5vh rgba(247,147,26,0.25)" }}>Apply for Membership</div>
          <div style={{ padding: "1.5vh 3vw", backgroundColor: "transparent", color: "#FFF", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.5vw", fontSize: "1.1vw", fontWeight: 500 }}>View Portfolio Audit</div>
        </div>
        <div style={{ display: "flex", gap: "1.5vw", opacity: 0.8 }}>
          {[{ label: "Cycle-Timed Entries", icon: "📈" }, { label: "Bear Market Coverage", icon: "🛡️" }, { label: "Private Client Portal", icon: "🔐" }].map((pill, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5vw", padding: "0.9vh 1.5vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "0.4vw", fontSize: "0.95vw", color: "rgba(255,255,255,0.8)" }}>
              <span>{pill.icon}</span><span>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "10vh", right: "-4vw", width: "24vw", height: "16vh", backgroundColor: Surface, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1vw", padding: "1.5vw", boxShadow: "0 2vh 5vh rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: "1.5vh", transform: "rotate(-4deg)", opacity: 0.85 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", borderRadius: "50%", backgroundColor: ORANGE }} />
          <div style={{ height: "0.9vw", width: "9vw", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0.2vw" }} />
        </div>
        <div style={{ height: "0.7vw", width: "14vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "0.2vw" }} />
        <div style={{ height: "0.7vw", width: "11vw", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "0.2vw" }} />
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY ADVISORY, LLC.</div>
    </div>
  );
}
