export default function Slide5Risk() {
  const pillars = [
    { title: "Bear Market Protection", desc: "A structured playbook for every bear phase — from early distribution signals through floor confirmation." },
    { title: "Downside Rules", desc: "Pre-defined sell triggers, allocation caps, and stop-loss guidelines so you act on logic, not emotion." },
    { title: "Capital Preservation", desc: "We model how to protect your base position while still participating in the upside of any recovery." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      {/* Left orange panel */}
      <div style={{ position: "relative", zIndex: 10, width: "38vw", backgroundColor: "#F7931A", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 5vw 0 7vw" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vw", borderRadius: "50%", backgroundColor: "#FFF", opacity: 0.05, filter: "blur(8vw)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.6, color: "#0C0F1A", marginBottom: "2vh" }}>STEP THREE</div>
          <h2 style={{ fontSize: "5vw", fontWeight: 900, color: "#0C0F1A", lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 3vh 0" }}>Risk<br />Mgmt.</h2>
          <p style={{ fontSize: "1.4vw", fontWeight: 500, color: "rgba(10,10,10,0.65)", lineHeight: 1.5, margin: 0 }}>A structured framework for navigating every phase of the cycle — peak to floor.</p>
        </div>
      </div>

      {/* Right content */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 7vw 0 5vw", gap: "3vh" }}>
        <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
        <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>05 / 15</div>
        {pillars.map((p, i) => (
          <div key={i} style={{ paddingBottom: i < 2 ? "3vh" : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <h3 style={{ fontSize: "1.7vw", fontWeight: 700, margin: "0 0 1vh 0" }}>{p.title}</h3>
            <p style={{ fontSize: "1.2vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(10,10,10,0.45)", letterSpacing: "0.05em", zIndex: 10 }}>BITCOIN DAILY CONSULTING, LLC.</div>
    </div>
  );
}
