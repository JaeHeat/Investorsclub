export default function Slide5Risk() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "#0d0d0d" }}>
      {/* Left orange panel */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center" style={{ width: "42vw", background: "#F7931A", paddingLeft: "7vw", paddingRight: "5vw" }}>
        <p className="font-display text-bg mb-[2vh]" style={{ fontSize: "1.8vw", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.6 }}>
          03
        </p>
        <h2
          className="font-display tracking-tight leading-none"
          style={{ fontSize: "5.5vw", fontWeight: 900, color: "#0A0A0A", textWrap: "balance" }}
        >
          Risk Management
        </h2>
      </div>

      {/* Right content */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center" style={{ left: "42vw", paddingLeft: "6vw", paddingRight: "7vw" }}>
        <div className="mb-[4vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4vh" }}>
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Bear market protection
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            A structured framework for navigating every phase of the cycle — from peak to floor.
          </p>
        </div>
        <div className="mb-[4vh]" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4vh" }}>
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Downside rules
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Clear guidelines to manage risk across the full cycle — no guesswork, no panic.
          </p>
        </div>
        <div>
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Capital preservation
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Focus on controlled growth and protecting your base position.
          </p>
        </div>
      </div>
    </div>
  );
}
