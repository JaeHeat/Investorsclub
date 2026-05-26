import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Target, TrendingUp, LineChart, Lock,
  BarChart4, BrainCircuit, Activity, ChevronDown, CheckCircle2,
  CalendarDays, PlaySquare, Mail, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
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
          <div className="hidden lg:flex items-center gap-10 text-sm text-white/60 font-medium">
            <a href="#philosophy" className="hover:text-white transition-colors tracking-wide uppercase text-xs">Philosophy</a>
            <a href="#edge" className="hover:text-white transition-colors tracking-wide uppercase text-xs">Our Edge</a>
            <a href="#offerings" className="hover:text-white transition-colors tracking-wide uppercase text-xs">Offerings</a>
            <a href="#faq" className="hover:text-white transition-colors tracking-wide uppercase text-xs">FAQ</a>
          </div>
          <div>
            <Button asChild className="bg-white text-[#0C0F1A] hover:bg-white/90 font-semibold px-6 transition-all duration-300">
              <a href="#contact">Book a Strategy Call</a>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-56 md:pb-40 overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
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
                      <div className="text-sm text-white/40 font-mono mb-2 uppercase tracking-wider">Cycle Indicator</div>
                      <div className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
                        <Activity className="w-8 h-8" />
                        Accumulation Zone
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Current Phase Progress</span>
                        <span className="text-emerald-400 font-mono">24%</span>
                      </div>
                      <div className="h-3 w-full bg-[#0A0C14] rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "24%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                      <div className="text-center">
                        <div className="text-xs text-white/40 uppercase mb-1">Status</div>
                        <div className="text-sm font-semibold text-white">Buy</div>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <div className="text-xs text-white/40 uppercase mb-1">Conviction</div>
                        <div className="text-sm font-semibold text-white">High</div>
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
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Services</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Consulting Offerings</h2>
              <p className="text-xl text-white/60 font-light">
                Tailored solutions for active traders and passive accumulators seeking maximum upside with defined risk.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {/* Signals */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-[#0C0F1A] border border-white/5 rounded-3xl p-10 flex flex-col h-[600px]"
              >
                <div className="mb-8">
                  <div className="text-white/40 font-mono text-sm uppercase tracking-wider mb-4">Tier 1</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Trading Signals</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">$1,200</span>
                    <span className="text-white/40">/ year</span>
                  </div>
                  <p className="text-white/60 font-light text-sm">For self-directed investors who just want the data.</p>
                </div>
                <ul className="space-y-5 mb-auto">
                  {["Regular buy/sell alerts", "Macro market updates", "Cycle phase identification", "Delivered securely via Telegram"].map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full h-12 mt-8 border-white/10 hover:bg-white/5 hover:text-white">
                  <a href="#contact">Book a Strategy Call</a>
                </Button>
              </motion.div>

              {/* Flagship */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-b from-[#1A150D] to-[#0C0F1A] border border-primary/30 rounded-3xl p-10 relative shadow-[0_0_50px_rgba(247,147,26,0.1)] flex flex-col h-[650px] lg:-mt-6 lg:z-10"
              >
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-[#0C0F1A] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">
                  The Core Product
                </div>
                <div className="mb-8">
                  <div className="text-primary font-mono text-sm uppercase tracking-wider mb-4">Flagship</div>
                  <h3 className="text-3xl font-bold mb-4 text-white">Cycle Consultation</h3>
                  <p className="text-white/70 font-light text-sm leading-relaxed">
                    The premier consulting service for high-net-worth individuals requiring a bespoke approach to cycle management.
                  </p>
                </div>
                <ul className="space-y-5 mb-auto">
                  {[
                    "Private client portal access",
                    "Personalized exit & entry strategy",
                    "Quarterly 1-on-1 strategy calls",
                    "Proprietary on-chain signal reports",
                    "Portfolio allocation review",
                    "Direct access to partners"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-white font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full h-14 mt-8 bg-primary text-[#0C0F1A] hover:bg-primary/90 text-base font-semibold shadow-[0_0_20px_rgba(247,147,26,0.2)]">
                  <a href="#contact">Book a Strategy Call</a>
                </Button>
              </motion.div>

              {/* Mentorship */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-[#0C0F1A] border border-white/5 rounded-3xl p-10 flex flex-col h-[600px]"
              >
                <div className="mb-8">
                  <div className="text-white/40 font-mono text-sm uppercase tracking-wider mb-4">Specialized</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Trading Mentorship</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">$5,000</span>
                  </div>
                  <p className="text-white/60 font-light text-sm">Hands-on mentorship for those who want to actively trade the volatility.</p>
                </div>
                <ul className="space-y-5 mb-auto">
                  {["Direct mentorship & coaching", "Technical analysis mastery", "Risk management frameworks", "Live trade breakdowns"].map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full h-12 mt-8 border-white/10 hover:bg-white/5 hover:text-white">
                  <a href="#contact">Book a Strategy Call</a>
                </Button>
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
                    desc: "As the cycle progresses, we hold quarterly reviews. When our on-chain indicators signal a cycle top is forming, we initiate the exit protocol."
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
