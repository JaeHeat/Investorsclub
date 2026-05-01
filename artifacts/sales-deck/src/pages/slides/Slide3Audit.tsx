export default function Slide3Audit() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg" style={{ paddingLeft: "7vw", paddingRight: "7vw", paddingTop: "8vh", paddingBottom: "8vh" }}>
      {/* Orange accent bar on right side for asymmetry */}
      <div className="absolute right-0 top-0 bottom-0 w-[0.4vw] bg-accent" />

      {/* Step number */}
      <p className="font-display text-accent mb-[1.5vh]" style={{ fontSize: "1.8vw", fontWeight: 700, letterSpacing: "0.1em" }}>
        01
      </p>

      {/* Headline */}
      <h2
        className="font-display text-primary tracking-tight leading-none mb-[6vh]"
        style={{ fontSize: "5vw", fontWeight: 700 }}
      >
        Portfolio Audit &amp; Custom Strategy
      </h2>

      {/* Three columns */}
      <div className="flex gap-[3vw]">
        {/* Col 1 */}
        <div className="flex-1" style={{ borderTop: "2px solid #F7931A", paddingTop: "2.5vh" }}>
          <p className="font-display text-primary mb-[1.5vh]" style={{ fontSize: "2.2vw", fontWeight: 700 }}>
            Holdings Breakdown
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Full breakdown of your current holdings and risk gaps.
          </p>
        </div>
        {/* Col 2 */}
        <div className="flex-1" style={{ borderTop: "2px solid rgba(247,147,26,0.4)", paddingTop: "2.5vh" }}>
          <p className="font-display text-primary mb-[1.5vh]" style={{ fontSize: "2.2vw", fontWeight: 700 }}>
            Allocation Structure
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Aligned with your goals and risk profile. Clear position sizing and capital distribution.
          </p>
        </div>
        {/* Col 3 */}
        <div className="flex-1" style={{ borderTop: "2px solid rgba(247,147,26,0.4)", paddingTop: "2.5vh" }}>
          <p className="font-display text-primary mb-[1.5vh]" style={{ fontSize: "2.2vw", fontWeight: 700 }}>
            Action Plan
          </p>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.7vw" }}>
            Clear direction on what to adjust, reduce, or reposition.
          </p>
        </div>
      </div>
    </div>
  );
}
