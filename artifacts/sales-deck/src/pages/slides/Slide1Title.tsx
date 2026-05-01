import heroImg from "@assets/generated_images/btc_hero.png";

export default function Slide1Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      {/* Hero image */}
      <img
        src={heroImg}
        crossOrigin="anonymous"
        alt="City skyline at night"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.92) 45%, rgba(10,10,10,0.55) 100%)" }} />

      {/* Orange accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[0.4vw] bg-accent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: "7vw", paddingRight: "52vw" }}>
        <p className="font-body text-accent uppercase tracking-[0.25em] mb-[2vh]" style={{ fontSize: "1.5vw", fontWeight: 500 }}>
          Private Portfolio Consulting
        </p>
        <h1
          className="font-display text-primary tracking-tight leading-none mb-[3.5vh]"
          style={{ fontSize: "7vw", fontWeight: 900, textWrap: "balance" }}
        >
          Bitcoin Daily
          <br />
          Advisory
        </h1>
        <div className="w-[8vw] h-[2px] bg-accent mb-[3.5vh]" />
        <p className="font-body text-muted leading-relaxed" style={{ fontSize: "1.8vw", fontWeight: 400 }}>
          Private portfolio guidance through every phase of the Bitcoin cycle.
        </p>
      </div>
    </div>
  );
}
