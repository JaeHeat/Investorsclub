export default function Slide2Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col justify-center" style={{ paddingLeft: "7vw", paddingRight: "7vw" }}>
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />

      {/* Large background number for depth */}
      <p
        className="absolute font-display text-primary select-none pointer-events-none"
        style={{ fontSize: "38vw", fontWeight: 900, opacity: 0.025, right: "-5vw", top: "50%", transform: "translateY(-50%)", lineHeight: 1 }}
      >
        ?
      </p>

      {/* Label */}
      <p className="font-body text-accent uppercase tracking-[0.25em] mb-[3vh]" style={{ fontSize: "1.5vw", fontWeight: 500 }}>
        The problem
      </p>

      {/* Headline */}
      <h2
        className="font-display text-primary tracking-tight leading-none mb-[5vh]"
        style={{ fontSize: "5.5vw", fontWeight: 700, textWrap: "balance" }}
      >
        Most investors hold without a plan.
      </h2>

      {/* Two-column body */}
      <div className="flex gap-[5vw]">
        <div style={{ maxWidth: "38vw" }}>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.8vw" }}>
            You watch the price. You don't know when to reduce, when to add, or when to hold.
          </p>
        </div>
        <div style={{ maxWidth: "38vw" }}>
          <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.8vw" }}>
            The cycle moves faster than you can act alone.
          </p>
        </div>
      </div>
    </div>
  );
}
