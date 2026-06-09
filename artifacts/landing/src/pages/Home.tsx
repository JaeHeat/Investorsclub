import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Target, TrendingUp, LineChart, Lock,
  BarChart4, BrainCircuit, Activity, ChevronDown, CheckCircle2,
  CalendarDays, PlaySquare, Mail, AlertTriangle, ArrowUpRight, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFearGreedView } from "@/hooks/useFearGreedView";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const NAV_LINKS = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#edge", label: "Our Edge" },
  { href: "#offerings", label: "Offerings" },
  { href: "#faq", label: "FAQ" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fg = useFearGreedView();

  // Cycle widget values — live Fear & Greed when available, else a sensible static default.
  const cycle = {
    zone: fg?.zone ?? "Accumulation Zone",
    color: fg?.color ?? "#34d399",
    pct: fg?.value ?? 24,
    status: fg?.status ?? "Buy",
    conviction: fg?.conviction ?? "High",
    live: fg != null,
  };

  function closeMenu() { setMobileMenuOpen(false); }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0C0F1A]/80 backdrop-blur-xl transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(247,147,26,0.3)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#0C0F1A]" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22h20L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Bitcoin Daily</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10 text-sm text-white/60 font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-white transition-colors tracking-wide uppercase text-xs">{label}</a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/cryptotrackr/" className="text-xs font-medium text-white/50 hover:text-white transition-colors tracking-wide uppercase">
              Member Login
            </a>
            <Button asChild className="bg-white text-[#0C0F1A] hover:bg-white/90 font-semibold px-6 transition-all duration-300">
              <a href="#contact">Book a Strategy Call</a>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-white/5"
              style={{ background: "#0C0F1A" }}
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="py-3 text-sm font-medium text-white/60 hover:text-white transition-colors tracking-wide uppercase border-b border-white/5 last:border-0"
                  >
                    {label}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  <a href="/cryptotrackr/" className="text-xs font-medium text-white/50 tracking-wide uppercase text-center py-2">
                    Member Login
                  </a>
                  <Button asChild className="w-full bg-white text-[#0C0F1A] hover:bg-white/90 font-semibold">
                    <a href="#contact" onClick={closeMenu}>Book a Strategy Call</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-56 md:pb-40 overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-5xl mx-auto text-center flex flex-col items-center"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" />
                <span className="tracking-wide">Private Consulting for High-Net-Worth Investors</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8 text-white">
                Master the cycle.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500">
                  Protect your wealth.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl mb-12 font-light">
                We read on-chain data and macro signals so you can accumulate near bottoms, 
                take profit near tops, and eliminate the guesswork of Bitcoin investing.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                <Button asChild size="lg" className="bg-primary text-[#0C0F1A] hover:bg-primary/90 h-14 px-10 text-base font-semibold shadow-[0_0_30px_rgba(247,147,26,0.3)]">
                  <a href="#contact">
                    Book a Strategy Call <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 text-base font-semibold border-white/10 text-white hover:bg-white/5 hover:text-white backdrop-blur-sm">
                  <a href="#philosophy">Explore Our Approach</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Philosophy */}
        <section id="philosophy" className="py-32 bg-[#0A0C14] border-y border-white/5 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn} className="text-primary font-mono text-sm tracking-widest uppercase mb-4">The Reality</motion.div>
                <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
                  Hope is not an <br/>exit strategy.
                </motion.h2>
                <motion.div variants={fadeIn} className="space-y-6 text-lg text-white/60 font-light">
                  <p>
                    Most investors hold through the top and watch their net worth collapse by 80% during the bear market. They let emotion override logic.
                  </p>
                  <p>
                    At Bitcoin Daily, we believe in a methodical approach. By analyzing on-chain metrics, miner behavior, and global liquidity, we identify high-probability pivot points in the cycle.
                  </p>
                  <p className="text-white/80 font-normal pl-4 border-l-2 border-primary">
                    "Clients don't guess; they follow a plan. We provide the map."
                  </p>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-[80px] rounded-full" />
                <div className="relative bg-[#0C0F1A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <div className="text-sm text-white/40 font-mono mb-2 uppercase tracking-wider flex items-center gap-2">
                        Cycle Indicator
                        {cycle.live && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold normal-case tracking-normal px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: "#34d399" }} />Live
                          </span>
                        )}
                      </div>
                      <div className="text-3xl font-bold flex items-center gap-3" style={{ color: cycle.color }}>
                        <Activity className="w-8 h-8" />
                        {cycle.zone}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">{cycle.live ? "Fear & Greed Index" : "Current Phase Progress"}</span>
                        <span className="font-mono" style={{ color: cycle.color }}>{cycle.pct}{cycle.live ? "/100" : "%"}</span>
                      </div>
                      <div className="h-3 w-full bg-[#0A0C14] rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${cycle.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: cycle.color }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase mb-1">Status</div>
                        <div className="text-sm font-semibold text-white">{cycle.status}</div>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <div className="text-xs text-white/40 uppercase mb-1">Conviction</div>
                        <div className="text-sm font-semibold text-white">{cycle.conviction}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase mb-1">Timeframe</div>
                        <div className="text-sm font-semibold text-white">12-18mo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Edge */}
        <section id="edge" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Our Edge</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Data over emotion.</h2>
              <p className="text-xl text-white/60 font-light">
                We remove the psychological burden of investing by relying on proven frameworks and hard data.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit className="w-8 h-8 text-primary" />,
                  title: "Macro Signals",
                  desc: "We track global liquidity, central bank balance sheets, and interest rate cycles to understand when capital will flow into risk assets."
                },
                {
                  icon: <BarChart4 className="w-8 h-8 text-primary" />,
                  title: "On-Chain Analytics",
                  desc: "By monitoring miner capitulation, dormant coins moving, and exchange flows, we see market turns before they manifest in price."
                },
                {
                  icon: <Target className="w-8 h-8 text-primary" />,
                  title: "Risk Management",
                  desc: "Protecting capital is more important than chasing the absolute top. We employ structured exit strategies to secure life-changing wealth."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="bg-[#0A0C14] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-10 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#0C0F1A] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Offerings Section */}
        <section id="offerings" className="py-32 bg-[#0A0C14] border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-primary font-mono text-sm tracking-widest uppercase mb-4">The Package</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Everything included.</h2>
              <p className="text-xl text-white/60 font-light">
                One engagement. Everything you need to navigate the Bitcoin cycle with precision.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Value stack */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl overflow-hidden"
                style={{ border: "1px solid rgba(247,147,26,0.2)", background: "linear-gradient(160deg, #13100A 0%, #0C0F1A 100%)" }}
              >
                {/* Header */}
                <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-primary font-mono text-xs tracking-widest uppercase mb-2">Bitcoin Cycle Consultation</div>
                  <p className="text-white/50 text-sm">Private client engagement — application required</p>
                </div>

                {/* Line items */}
                {[
                  {
                    name: "Cycle Consultation",
                    desc: "A complete, data-driven system built around your portfolio — from accumulation to exit.",
                    value: "Core",
                    highlight: true,
                    features: [
                      "Private client portal",
                      "Portfolio rebalancing",
                      "Risk management framework",
                      "Monthly cycle intel reports",
                      "Expected value modeling",
                      "Algorithm probability scores (tops & bottoms)",
                      "Exit & entry protocol execution",
                      "Quarterly 1-on-1 strategy calls",
                      "On-chain signal monitoring",
                      "Portfolio allocation review",
                    ],
                  },
                  {
                    name: "Day Trading Mentorship",
                    desc: "Direct coaching, technical analysis mastery, risk management frameworks, live trade breakdowns",
                    value: "$5,000 value",
                    highlight: false,
                    bonus: true,
                  },
                  {
                    name: "Trading Signals Access",
                    desc: "Regular buy/sell alerts, macro market updates, cycle phase identification — delivered securely via Discord",
                    value: "$1,200/yr value",
                    highlight: false,
                    bonus: true,
                  },
                ].map((item, i) => (
                  <div key={i}>
                    {/* Bonus section divider before first bonus */}
                    {i === 1 && (
                      <div className="flex items-center gap-4 px-8 py-3"
                        style={{ background: "rgba(124,107,240,0.06)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(124,107,240,0.2)", color: "#A89CF7" }}>
                          Bonuses
                        </span>
                        <span className="text-xs text-white/30">Included at no extra cost</span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                      className="flex items-start gap-5 px-8 py-6"
                      style={{ borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
                    >
                      <div className="mt-0.5 shrink-0">
                        <CheckCircle2 className="w-5 h-5" style={{ color: item.highlight ? "#F7931A" : "rgba(124,107,240,0.7)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-white font-semibold">{item.name}</span>
                          {item.bonus && (
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(124,107,240,0.15)", color: "#A89CF7" }}>
                              Bonus
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/45 leading-relaxed mb-3">{item.desc}</p>
                        {item.features && (
                          <div className="flex flex-wrap gap-2">
                            {item.features.map((f: string, fi: number) => (
                              <span key={fi} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                                style={{ background: "rgba(247,147,26,0.08)", color: "rgba(247,147,26,0.75)", border: "1px solid rgba(247,147,26,0.15)" }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right pl-4">
                        <span
                          className="text-sm font-semibold whitespace-nowrap"
                          style={{ color: item.highlight ? "#F7931A" : "rgba(255,255,255,0.35)" }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}

                {/* Total value row */}
                <div
                  className="px-8 py-5 flex items-center justify-between"
                  style={{ background: "rgba(247,147,26,0.04)", borderTop: "1px solid rgba(247,147,26,0.15)" }}
                >
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-widest font-mono mb-0.5">Total value</div>
                    <div className="text-white font-semibold">$6,200+ included</div>
                  </div>
                  <Button asChild className="h-12 px-8 text-sm font-semibold"
                    style={{ background: "#F7931A", color: "#0C0F1A" }}>
                    <a href="#contact">Book a Strategy Call</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Engagement</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">How we work together.</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                {[
                  {
                    step: "01",
                    title: "Strategy Assessment",
                    desc: "We audit your current holdings, risk tolerance, and ultimate financial goals. We assess your storage security and operational readiness."
                  },
                  {
                    step: "02",
                    title: "The Playbook",
                    desc: "You receive a custom execution plan detailing exactly which price levels trigger our scaling in or scaling out mechanisms. No ambiguity."
                  },
                  {
                    step: "03",
                    title: "Execution & Monitoring",
                    desc: "As the cycle progresses, we hold quarterly reviews. When our on-chain indicators signal a cycle top forming, we initiate the exit protocol. When they signal a cycle bottom, we execute the entry protocol."
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                    className="flex gap-8 md:gap-12"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary font-mono text-xl font-bold bg-[#0A0C14]">
                        {item.step}
                      </div>
                      {i !== 2 && <div className="w-px h-full bg-gradient-to-b from-primary/30 to-transparent mt-4 min-h-[60px]" />}
                    </div>
                    <div className="pt-3 pb-8">
                      <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                      <p className="text-white/60 font-light text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-primary font-mono text-sm tracking-widest uppercase mb-4">FAQ</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Common questions.</h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              {[
                {
                  q: "Who is this for?",
                  a: "This is for Bitcoin holders and active traders who want a data-driven plan — not guesswork. Ideal for high-net-worth individuals who take their portfolio seriously and want professional cycle guidance.",
                },
                {
                  q: "What does the consultation actually involve?",
                  a: "You get access to a private client portal with a complete system: personalized exit and entry protocol execution, portfolio rebalancing recommendations, a risk management framework, monthly cycle intel reports, expected value modeling using our algorithm's probability scores for cycle tops and bottoms, on-chain signal monitoring, portfolio allocation review, and quarterly 1-on-1 strategy calls. It's a full advisory system — not a newsletter.",
                },
                {
                  q: "How are the trading signals delivered?",
                  a: "Signals are delivered securely via a private Discord channel — buy/sell alerts, cycle phase updates, and macro commentary in real time.",
                },
                {
                  q: "Do I need to be an active trader?",
                  a: "No. Most clients are long-term holders who want to protect their wealth at cycle tops and maximize accumulation at cycle bottoms. The day trading mentorship is a bonus for those who want to go deeper.",
                },
                {
                  q: "How do I get started?",
                  a: "Book a 30-minute strategy call. We'll review your current positioning, explain the process, and determine if there's a fit. There's no obligation.",
                },
              ].map((item, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <summary className="flex items-center justify-between gap-4 px-7 py-5 list-none select-none">
                    <span className="text-white font-medium">{item.q}</span>
                    <span className="text-white/30 text-xl shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-7 pb-6 pt-1">
                    <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact / Calendar Section */}
        <section id="contact" className="py-32 bg-[#0A0C14] border-t border-white/5 relative">
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto bg-[#0C0F1A] border border-white/10 rounded-[40px] p-8 md:p-16 lg:p-24 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2Z" />
                </svg>
              </div>

              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Secure your <br/>private briefing.</h2>
                  <p className="text-lg text-white/60 font-light mb-10">
                    Discuss your current positioning and discover how Bitcoin Daily can help you navigate the coming cycle with precision.
                  </p>
                  
                  <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-medium">30-Minute Strategy Call</div>
                        <div className="text-sm text-white/40">Directly with our senior consultants</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Strictly Confidential</div>
                        <div className="text-sm text-white/40">Your data is never shared</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0C14] border border-white/5 rounded-2xl p-2 relative h-[500px] flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 mb-4">
                    <span className="text-sm text-white/60 font-medium flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Select a Date & Time
                    </span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                  </div>
                  
                  {/* Calendar Embed Placeholder */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl m-2 bg-white/[0.02]">
                    <Activity className="w-10 h-10 text-white/20 mb-4" />
                    <h4 className="text-white font-medium mb-2">Calendar Integration</h4>
                    <p className="text-sm text-white/40 max-w-[250px] mx-auto mb-6">
                      This space is reserved for your scheduling tool (e.g., Calendly, SavvyCal).
                    </p>
                    <div className="px-4 py-2 bg-white/5 rounded text-xs text-white/40 font-mono border border-white/5">
                      {'<script src="embed.js"></script>'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A0C14] pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#0C0F1A]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22h20L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="font-bold text-lg text-white">Bitcoin Daily Consulting, LLC</span>
              </div>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                Strategic cycle consulting for high-net-worth individuals. We provide the data, frameworks, and accountability to protect and grow your wealth.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Navigation</h4>
              <ul className="space-y-3">
                <li><a href="#philosophy" className="text-white/40 hover:text-white text-sm transition-colors">Philosophy</a></li>
                <li><a href="#edge" className="text-white/40 hover:text-white text-sm transition-colors">Our Edge</a></li>
                <li><a href="#offerings" className="text-white/40 hover:text-white text-sm transition-colors">Offerings</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h4>
              <ul className="space-y-3">
                <li><a href="#contact" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2"><Mail className="w-4 h-4" /> Inquiries</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Bitcoin Daily Consulting, LLC. All rights reserved.
            </p>
          </div>
          
          <div className="mt-10 p-6 bg-white/[0.02] border border-white/5 rounded-xl flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-white/20 shrink-0" />
            <p className="text-xs text-white/30 leading-relaxed text-justify">
              Disclaimer: The information provided by Bitcoin Daily Consulting, LLC is for educational and informational purposes only and does not constitute financial, investment, tax, or legal advice. Cryptocurrency investments are highly volatile, speculative, and carry significant risk of loss, including the potential loss of principal. Past performance is not indicative of future results. Consult with a qualified financial advisor, tax professional, or legal counsel before making any investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
