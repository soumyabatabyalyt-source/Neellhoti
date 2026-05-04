"use client"

import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Zap, Shield, Trophy } from "lucide-react"
import { useRef, useEffect, useState } from "react"

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, start: () => setStarted(true) }
}

// Magnetic button effect
function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.25)
    y.set((e.clientY - centerY) * 0.25)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}

// Horizontal scrolling ticker
function Ticker() {
  const items = [
    "Instant payouts", "26,000+ active earners", "Verified bounties",
    "Karma multipliers", "Community-powered", "Zero waiting periods",
    "Premium tiers", "Real-world rewards", "Exclusive tasks",
  ]
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-white/[0.04] py-4 bg-white/[0.01]">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            {item}
            <span className="w-1 h-1 rounded-full bg-orange-500/50 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// Floating orb cursor follower
function CursorOrb() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 60, damping: 25 })
  const springY = useSpring(y, { stiffness: 60, damping: 25 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 200)
      y.set(e.clientY - 200)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [x, y])

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
      aria-hidden
    >
      <div className="w-full h-full rounded-full bg-orange-600/[0.04] blur-[80px]" />
    </motion.div>
  )
}

// Animated stat card
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { count, start } = useCounter(value, 1800)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        setVisible(true)
        start()
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [visible, start])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative p-8 group"
    >
      <div className="absolute inset-0 border border-white/[0.04] rounded-2xl group-hover:border-orange-500/10 transition-colors duration-700" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative">
        <div className="text-5xl font-black tracking-tighter text-white mb-1 tabular-nums">
          {count.toLocaleString()}<span className="text-orange-500">{suffix}</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">{label}</div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 60, damping: 20 }
    }
  }

  return (
    <div className="relative min-h-screen bg-[#060709] overflow-x-hidden font-sans text-slate-200 selection:bg-orange-500/20 selection:text-orange-200">

      <CursorOrb />

      {/* Deep layered background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.05),transparent)]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px"
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,7,9,0.8)_100%)]" />
      </div>

      {/* Ambient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <motion.div
          animate={{ x: [-20, 20, -20], y: [-10, 20, -10] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[5%] w-[900px] h-[900px] rounded-full bg-gradient-to-br from-orange-700/10 to-rose-800/5 blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[10%] w-[700px] h-[700px] rounded-full bg-blue-800/8 blur-[180px]"
        />
      </div>

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 md:px-16 h-16"
      >
        {/* Glassmorphism bar */}
        <div className="absolute inset-0 bg-[#060709]/70 backdrop-blur-2xl border-b border-white/[0.03]" />

        <div className="relative flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-700" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-600 blur-[4px] opacity-60" />
            <div className="relative w-full h-full rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white rotate-45 scale-75" />
            </div>
          </div>
          <span className="font-bold tracking-tight text-white text-base">
            Reddit<span className="text-orange-400 font-light">Tasker</span>
          </span>
        </div>

        <div className="relative flex items-center gap-6">
          <button
            onClick={() => router.push("/dashboard/tasks")}
            className="hidden md:block text-[12px] uppercase tracking-[0.15em] text-slate-400 hover:text-white transition-colors duration-300"
          >
            Tasks
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="relative text-[12px] uppercase tracking-[0.15em] font-medium px-5 py-2.5 rounded-full transition-all duration-300 overflow-hidden group"
          >
            <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-orange-500/30 transition-colors duration-300" />
            <div className="absolute inset-0 rounded-full bg-white/[0.03] group-hover:bg-orange-500/5 transition-colors duration-300" />
            <span className="relative text-slate-300 group-hover:text-white transition-colors duration-300">Sign In</span>
          </button>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-16 px-4"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl w-full mx-auto text-center"
        >
          {/* Status badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/15 bg-orange-500/5 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-orange-400/80 font-semibold">Platform V2.0 Live</span>
            </div>
          </motion.div>

          {/* Main headline — editorial large type */}
          <motion.div variants={itemVariants} className="mb-8 overflow-hidden">
            <h1 className="text-[clamp(3.5rem,10vw,8.5rem)] font-black leading-[0.9] tracking-tighter text-white">
              Turn karma
            </h1>
          </motion.div>
          <motion.div variants={itemVariants} className="mb-10 overflow-hidden">
            <h1 className="text-[clamp(3.5rem,10vw,8.5rem)] font-black leading-[0.9] tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
                into value.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto mb-16 tracking-wide">
            The premium tasking platform built for active Redditors.
            Complete bounties, curate content, earn rewards.
          </motion.p>

          {/* CTA cluster */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => router.push("/dashboard/tasks")}
              className="group relative w-full sm:w-auto px-10 py-4 rounded-full overflow-hidden cursor-pointer"
            >
              {/* Glow layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-orange-400 to-red-500" />
              <div className="absolute inset-0 rounded-full blur-lg bg-gradient-to-b from-orange-500 to-red-600 opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-110" />
              <div className="relative flex items-center gap-2 text-white font-semibold tracking-wide text-sm">
                Start Earning Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </MagneticButton>

            <button
              onClick={() => router.push("/auth")}
              className="group relative w-full sm:w-auto px-10 py-4 rounded-full border border-white/[0.07] hover:border-white/[0.15] text-slate-400 hover:text-slate-200 text-sm font-medium tracking-wide transition-all duration-300 backdrop-blur-md hover:bg-white/[0.02]"
            >
              View Available Tasks
            </button>
          </motion.div>

          {/* Social proof line */}
          <motion.div variants={itemVariants} className="mt-16 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-600">
            <span>Trusted by 26,000+ Redditors</span>
            <span className="w-1 h-1 rounded-full bg-slate-700 inline-block" />
            <span>$2.4M paid out</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-transparent via-slate-600 to-transparent"
          />
        </motion.div>
      </motion.section>

      {/* ─── Ticker ─── */}
      <div className="relative z-10">
        <Ticker />
      </div>

      {/* ─── Stats Section ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-12 font-medium"
        >
          Platform metrics
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.04]">
          <StatCard value={26000} suffix="+" label="Active earners" delay={0} />
          <StatCard value={2400000} suffix="" label="Dollars paid out" delay={0.1} />
          <StatCard value={98} suffix="%" label="Approval rate" delay={0.2} />
          <StatCard value={4} suffix="hr" label="Avg. payout time" delay={0.3} />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-32">

        <div className="flex flex-col md:flex-row items-start gap-4 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-medium mt-2 shrink-0"
          >
            Why RedditTasker
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight"
          >
            Built for Redditors<br />
            <span className="text-slate-600">who mean business.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] rounded-3xl overflow-hidden">
          {[
            {
              icon: Zap,
              color: "orange",
              title: "Instant Payouts",
              description: "Connect your wallet or bank and withdraw immediately after task approval. No waiting periods, no minimums.",
              tag: "Finance"
            },
            {
              icon: Shield,
              color: "blue",
              title: "Verified Bounties",
              description: "Every task is pre-funded and vetted before listing. Say goodbye to scam tasks and unpaid labor forever.",
              tag: "Trust"
            },
            {
              icon: Trophy,
              color: "amber",
              title: "Karma Multipliers",
              description: "Your Reddit reputation matters here. Higher karma unlocks premium tiers and exclusive high-paying tasks.",
              tag: "Rewards"
            }
          ].map((feature, i) => {
            const Icon = feature.icon
            const colorMap: Record<string, string> = {
              orange: "from-orange-500/10 border-orange-500/15 text-orange-400",
              blue: "from-blue-500/10 border-blue-500/15 text-blue-400",
              amber: "from-amber-500/10 border-amber-500/15 text-amber-400"
            }
            const tagMap: Record<string, string> = {
              orange: "bg-orange-500/8 text-orange-500/70 border-orange-500/15",
              blue: "bg-blue-500/8 text-blue-500/70 border-blue-500/15",
              amber: "bg-amber-500/8 text-amber-500/70 border-amber-500/15"
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group relative p-10 bg-[#060709] cursor-default"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-white/[0.015] to-transparent" />

                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-b ${colorMap[feature.color]} border mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={20} className={colorMap[feature.color].split(" ").pop()} />
                </div>

                <div className="mb-4">
                  <span className={`inline-block text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-md border ${tagMap[feature.color]}`}>
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-white mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{feature.description}</p>

                {/* Bottom arrow */}
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <ArrowRight size={14} className={colorMap[feature.color].split(" ").pop()} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ─── CTA Band ─── */}
      <section className="relative z-10 mx-4 md:mx-16 mb-24 rounded-3xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 to-red-950/20 border border-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(249,115,22,0.06),transparent)]" />

        {/* Grid texture inside CTA */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }}
        />

        <div className="relative px-12 md:px-20 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="text-[10px] uppercase tracking-[0.3em] text-orange-500/60 font-medium mb-6">Ready to begin</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-4">
              Your next task<br />is waiting.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              Join thousands of Redditors already converting their community activity into tangible income.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <MagneticButton
              onClick={() => router.push("/dashboard/tasks")}
              className="group relative px-10 py-4 rounded-full overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
              <div className="absolute inset-0 rounded-full blur-lg bg-orange-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-110" />
              <div className="relative flex items-center gap-2 text-white font-semibold text-sm tracking-wide whitespace-nowrap">
                Browse All Tasks
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </MagneticButton>
            <button
              onClick={() => router.push("/auth")}
              className="text-[11px] uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors duration-300 font-medium text-center py-1"
            >
              Create free account
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/[0.03] px-8 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold tracking-tighter text-white">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-600" />
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-sm bg-white rotate-45 scale-75" />
            </div>
          </div>
          Reddit<span className="text-orange-400 font-light">Tasker</span>
        </div>
        <div className="text-[11px] text-slate-700 tracking-wider uppercase">
          Platform V2.0 — All rights reserved
        </div>
      </footer>
    </div>
  )
}