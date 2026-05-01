export default function Slide7Closing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col items-center justify-center text-center">
      {/* Orange accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-[0.4vw] bg-accent" />
      {/* Orange accent bar bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.4vw] bg-accent" />

      {/* Large ghost type for depth */}
      <p
        className="absolute font-display text-accent select-none pointer-events-none"
        style={{ fontSize: "22vw", fontWeight: 900, opacity: 0.04, lineHeight: 1, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        BTC
      </p>

      {/* Price / stat */}
      <p className="font-display text-accent mb-[2vh]" style={{ fontSize: "10vw", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
        $5,000
        <span className="text-muted" style={{ fontSize: "3vw", fontWeight: 400 }}> / year</span>
      </p>

      {/* Divider */}
      <div className="w-[8vw] h-[2px] bg-accent mb-[4vh]" />

      {/* Body lines */}
      <p className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "1.8vw" }}>
        One membership. One Consultant.
      </p>
      <p className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "1.8vw" }}>
        A structured plan through every phase of the Bitcoin cycle.
      </p>
      <p className="font-body text-muted" style={{ fontSize: "1.8vw" }}>
        Acceptance by application only.
      </p>

      {/* Small label at bottom */}
      <p className="absolute font-body text-muted" style={{ bottom: "4vh", fontSize: "1.5vw", opacity: 0.5 }}>
        Bitcoin Daily Advisory
      </p>
    </div>
  );
}
