export default function Slide6Portal() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg" style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "8vh", paddingBottom: "8vh" }}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />

      {/* Step number */}
      <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>
        04
      </p>

      {/* Headline */}
      <h2
        className="font-display text-primary tracking-tight leading-none mb-[6vh]"
        style={{ fontSize: "5vw", fontWeight: 700 }}
      >
        Your Private Client Portal
      </h2>

      {/* Feature grid — 2 × 2 */}
      <div className="grid grid-cols-2 gap-x-[5vw] gap-y-[4vh]">
        <div>
          <div className="w-[3vw] h-[2px] bg-accent mb-[1.5vh]" />
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Portfolio dashboard
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Your portfolio plan, exit strategy, and DCA projections in one place.
          </p>
        </div>
        <div>
          <div className="w-[3vw] h-[2px] bg-accent mb-[1.5vh]" />
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Cycle intelligence
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Market phase, exit signals, and floor scenarios updated in real time.
          </p>
        </div>
        <div>
          <div className="w-[3vw] h-[2px] bg-accent mb-[1.5vh]" />
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Exit strategy
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            A phase-by-phase schedule for rotating out of positions at the right time.
          </p>
        </div>
        <div>
          <div className="w-[3vw] h-[2px] bg-accent mb-[1.5vh]" />
          <p className="font-display text-primary mb-[1vh]" style={{ fontSize: "2vw", fontWeight: 700 }}>
            Direct advisor access
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            A private line for key decisions — before you act, not after.
          </p>
        </div>
      </div>
    </div>
  );
}
