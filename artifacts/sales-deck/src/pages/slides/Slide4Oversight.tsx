export default function Slide4Oversight() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col justify-center" style={{ paddingLeft: "7vw", paddingRight: "7vw" }}>
      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent" />

      {/* Step number */}
      <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>
        02
      </p>

      {/* Headline */}
      <h2
        className="font-display text-primary tracking-tight leading-none mb-[6vh]"
        style={{ fontSize: "5vw", fontWeight: 700 }}
      >
        Ongoing Cycle Oversight
      </h2>

      {/* Horizontal rule */}
      <div className="w-full mb-[5vh]" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

      {/* Three items in a row — large label + description */}
      <div className="flex gap-[5vw]">
        <div style={{ maxWidth: "27vw" }}>
          <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.9vw", fontWeight: 700 }}>
            Private broadcasts
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Direct updates when market conditions shift — pushed to your portal.
          </p>
        </div>
        <div style={{ maxWidth: "27vw" }}>
          <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.9vw", fontWeight: 700 }}>
            Quarterly sessions
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            1-on-1 strategy review with your consultant every quarter.
          </p>
        </div>
        <div style={{ maxWidth: "27vw" }}>
          <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.9vw", fontWeight: 700 }}>
            Phase guidance
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            When to hold, reduce exposure, or reposition capital.
          </p>
        </div>
      </div>
    </div>
  );
}
