"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, CheckCircle, Zap, Users, TrendingUp, Award, Shield, Clock } from "lucide-react"
import { useEffect, useState } from "react"

// =========================================
// STAR BACKGROUND
// =========================================

function StarField() {

  const [stars, setStars] = useState<
    {
      id: number
      left: string
      top: string
      size: number
      duration: number
      delay: number
    }[]
  >([])

  useEffect(() => {

    const generated = Array.from({
      length: 120,
    }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }))

    setStars(generated)

  }, [])

  return (

    <div className="absolute inset-0 overflow-hidden z-0">

      {stars.map((star) => (

        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />

      ))}

      <div className="
        absolute
        top-[-10%]
        left-[-10%]
        w-[500px]
        h-[500px]
        bg-red-500/8
        rounded-full
        blur-[120px]
      " />

      <div className="
        absolute
        bottom-[-20%]
        right-[-10%]
        w-[500px]
        h-[500px]
        bg-red-600/6
        rounded-full
        blur-[120px]
      " />

    </div>
  )
}

// =========================================
// GLASS CARD
// =========================================

function GlassCard({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div className="
      relative
      backdrop-blur-xl
      bg-[#1a0a2e]/80
      border-2
      border-red-500/40
      shadow-[0_0_40px_rgba(239,68,68,0.3)]
      rounded-3xl
      hover:border-red-500/60
      hover:shadow-[0_0_60px_rgba(239,68,68,0.5)]
      transition-all duration-300
    ">

      {children}

    </div>
  )
}

// =========================================
// LOGO
// =========================================

function BrandLogo() {

  return (

    <div className="flex items-center gap-3">

      <div className="
        relative
        w-11
        h-11
        rounded-2xl
        overflow-hidden
        border
        border-white/10
        bg-white/5
      ">

        <Image
          src="/logo.png"
          alt="Neellohit Logo"
          fill
          className="object-cover"
          priority
        />

      </div>

      <span className="
        text-white
        font-semibold
        text-lg
        tracking-[0.15em]
      ">

        NEELLOHIT

      </span>

    </div>
  )
}

// =========================================
// MAIN PAGE
// =========================================

export default function Home() {

  const router = useRouter()

  return (

    <main className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#0a0a14]
      text-[#f5f5f0]
      font-sans
    ">

      <StarField />

      {/* NAVBAR */}

      <header className="
        fixed
        top-0
        left-0
        right-0
        z-50
        px-4
        md:px-8
        pt-4
      ">

        <GlassCard>

          <div className="
            flex
            items-center
            justify-between
            px-5
            py-4
            flex-wrap
            gap-4
          ">

            <BrandLogo />

            {/* NAV LINKS - Hidden on mobile, shown on md+ */}

            <nav className="
              hidden
              md:flex
              items-center
              gap-8
              text-sm
              text-slate-300
            ">

              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="hover:text-white transition"
              >
                Features
              </button>

              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="hover:text-white transition"
              >
                How It Works
              </button>

              <button
                onClick={() => router.push("/client")}
                className="hover:text-white transition"
              >
                For Clients
              </button>

            </nav>

            {/* CTA */}

            <button
              onClick={() => router.push("/auth")}
              className="
                px-5
                py-2.5
                rounded-full
                bg-white
                text-black
                text-sm
                font-medium
                hover:scale-105
                transition
              "
            >

              Get Started

            </button>

          </div>

        </GlassCard>

      </header>

      {/* HERO */}

      <section className="
        relative
        z-10
        flex
        items-center
        justify-center
        min-h-screen
        px-4
        pt-32
        pb-20
      ">

        <div className="max-w-6xl mx-auto w-full">

          <GlassCard>

            <div className="
              px-6
              py-14
              md:px-14
              md:py-20
              text-center
            ">


              {/* HEADLINE */}

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="
                  text-[2.8rem]
                  sm:text-[4.5rem]
                  md:text-[6.5rem]
                  leading-[0.95]
                  font-black
                  tracking-tight
                  mb-6
                "
              >

                Your online

                <br />

                <span className="
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-red-500
                  to-white
                ">

                  presence

                </span>

                {" "}has value.

              </motion.h1>

              {/* DESCRIPTION */}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="
                  max-w-2xl
                  mx-auto
                  text-slate-300
                  text-base
                  md:text-xl
                  leading-relaxed
                  mb-12
                "
              >

                Neellohit transforms digital influence into real-world earnings.
                Complete bounties, grow communities, and earn through your online presence.

              </motion.p>

              {/* BUTTONS */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="
                  flex
                  flex-col
                  sm:flex-row
                  items-center
                  justify-center
                  gap-4
                "
              >

                {/* PRIMARY */}

                <button
                  onClick={() => router.push("/auth")}
                  className="
                    group
                    relative
                    overflow-hidden
                    px-8
                    py-4
                    rounded-full
                    bg-gradient-to-r
                    from-red-600
                    to-red-500
                    text-white
                    font-bold
                    text-sm
                    tracking-wide
                    shadow-2xl
                    shadow-red-600/50
                    hover:scale-110
                    transition-all
                    duration-300
                    w-full
                    sm:w-auto
                  "
                >

                  <span className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  ">

                    Start Earning

                    <ArrowRight size={16} />

                  </span>

                </button>

                {/* CLIENT BUTTON */}

                <button
                  onClick={() => router.push("/client")}
                  className="
                    px-8
                    py-4
                    rounded-full
                    border-2
                    border-red-500/60
                    bg-red-500/10
                    text-red-300
                    text-sm
                    font-semibold
                    hover:bg-red-500/20
                    transition-all
                    duration-300
                    w-full
                    sm:w-auto
                    shadow-lg
                    shadow-red-500/20
                  "
                >

                  Become a Client

                </button>

              </motion.div>

            </div>

          </GlassCard>

        </div>

      </section>

      {/* ========================================
          FEATURES SECTION
          ======================================== */}

      <section
        id="features"
        className="
          relative
          z-10
          py-20
          md:py-32
          px-4
        ">

        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >

            <h2 className="
              text-4xl
              md:text-5xl
              font-black
              mb-4
              text-white
            ">
              Why Choose Neellohit?
            </h2>

            <p className="
              text-lg
              text-slate-300
              max-w-2xl
              mx-auto
            ">
              Everything you need to monetize your online presence
            </p>

          </motion.div>

          {/* FEATURE GRID */}

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">

            {[
              {
                icon: Zap,
                title: "Instant Payouts",
                description: "Get paid quickly and reliably for completed tasks"
              },
              {
                icon: Users,
                title: "Growing Community",
                description: "Join thousands of creators earning real money"
              },
              {
                icon: TrendingUp,
                title: "Track Your Growth",
                description: "Real-time analytics and performance metrics"
              },
              {
                icon: Award,
                title: "Quality Tasks",
                description: "Carefully curated opportunities from verified clients"
              },
              {
                icon: Shield,
                title: "Secure & Safe",
                description: "Your data and earnings are protected with security"
              },
              {
                icon: Clock,
                title: "Work Your Schedule",
                description: "Complete tasks whenever you want, at your own pace"
              }
            ].map((feature, idx) => {

              const Icon = feature.icon

              return (

                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="
                    group
                    p-6
                    rounded-2xl
                    backdrop-blur-xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    hover:border-red-500/30
                    hover:bg-white/[0.08]
                    transition-all
                    duration-300
                  "
                >

                  <div className="
                    w-12
                    h-12
                    rounded-xl
                    bg-gradient-to-br
                    from-red-600
                    to-red-500
                    flex
                    items-center
                    justify-center
                    mb-4
                    group-hover:scale-110
                    transition-transform
                    shadow-lg
                    shadow-red-600/50
                  ">

                    <Icon
                      size={24}
                      className="text-black"
                    />

                  </div>

                  <h3 className="
                    text-lg
                    font-semibold
                    mb-2
                    text-white
                  ">
                    {feature.title}
                  </h3>

                  <p className="
                    text-slate-400
                    text-sm
                  ">
                    {feature.description}
                  </p>

                </motion.div>
              )
            })}

          </div>

        </div>

      </section>

      {/* ========================================
          HOW IT WORKS SECTION
          ======================================== */}

      <section
        id="how-it-works"
        className="
          relative
          z-10
          py-20
          md:py-32
          px-4
        ">

        <div className="max-w-6xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >

            <h2 className="
              text-4xl
              md:text-5xl
              font-black
              mb-4
              text-white
            ">
              How It Works
            </h2>

            <p className="
              text-lg
              text-slate-300
              max-w-2xl
              mx-auto
            ">
              Simple steps to start earning today
            </p>

          </motion.div>

          {/* STEPS */}

          <div className="
            grid
            grid-cols-1
            md:grid-cols-4
            gap-6
          ">

            {[
              {
                number: 1,
                title: "Sign Up",
                description: "Create your free account in minutes"
              },
              {
                number: 2,
                title: "Browse Tasks",
                description: "Browse available tasks from clients"
              },
              {
                number: 3,
                title: "Complete Task",
                description: "Complete the task according to guidelines"
              },
              {
                number: 4,
                title: "Get Paid",
                description: "Receive payment upon approval"
              }
            ].map((step, idx) => (

              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="
                  relative
                  text-center
                "
              >

                {/* CONNECTOR LINE */}
                {idx < 3 && (
                  <div className="
                    hidden
                    md:block
                    absolute
                    top-8
                    left-[60%]
                    w-[40%]
                    h-0.5
                    bg-gradient-to-r
                    from-red-500
                    to-transparent
                  " />
                )}

                {/* NUMBER CIRCLE */}
                <div className="
                  relative
                  z-10
                  w-16
                  h-16
                  rounded-full
                  mx-auto
                  mb-4
                  bg-gradient-to-br
                  from-red-600
                  to-red-500
                  flex
                  items-center
                  justify-center
                  text-2xl
                  font-black
                  text-white
                  shadow-lg
                  shadow-red-600/60
                ">

                  {step.number}

                </div>

                <h3 className="
                  text-xl
                  font-semibold
                  mb-2
                  text-white
                ">
                  {step.title}
                </h3>

                <p className="
                  text-slate-400
                  text-sm
                ">
                  {step.description}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* ========================================
          STATS SECTION
          ======================================== */}

      <section className="
        relative
        z-10
        py-20
        md:py-32
        px-4
      ">

        <div className="max-w-6xl mx-auto">

          <GlassCard>

            <div className="
              px-6
              py-12
              md:px-14
              md:py-16
              grid
              grid-cols-1
              md:grid-cols-3
              gap-8
              text-center
            ">

              {[
                { label: "Active Users", value: "5,000+" },
                { label: "Tasks Completed", value: "50,000+" },
                { label: "Total Earnings", value: "$2M+" }
              ].map((stat, idx) => (

                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >

                  <div className="
                    text-5xl
                    md:text-6xl
                    font-black
                    bg-gradient-to-r
                    from-red-500
                    to-white
                    bg-clip-text
                    text-transparent
                    mb-2
                  ">

                    {stat.value}

                  </div>

                  <p className="
                    text-slate-400
                    text-lg
                  ">

                    {stat.label}

                  </p>

                </motion.div>
              ))}

            </div>

          </GlassCard>

        </div>

      </section>

      {/* ========================================
          CTA SECTION
          ======================================== */}

      <section className="
        relative
        z-10
        py-20
        md:py-32
        px-4
      ">

        <div className="max-w-4xl mx-auto">

          <GlassCard>

            <div className="
              px-6
              py-14
              md:px-14
              md:py-20
              text-center
            ">

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="
                  text-3xl
                  md:text-5xl
                  font-black
                  mb-6
                  text-white
                "
              >

                Ready to Start Earning?

              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="
                  text-lg
                  text-slate-300
                  mb-8
                  max-w-2xl
                  mx-auto
                "
              >

                Join thousands of creators turning their online presence into real money.
                No experience required, just your genuine engagement.

              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-4
                  justify-center
                "
              >

                <button
                  onClick={() => router.push("/auth")}
                  className="
                    px-8
                    py-4
                    rounded-full
                    bg-gradient-to-r
                    from-red-600
                    to-red-500
                    text-white
                    font-bold
                    hover:scale-110
                    transition-all
                    shadow-xl
                    shadow-red-600/50
                  "
                >

                  <span className="flex items-center justify-center gap-2">
                    Start Earning Now
                    <ArrowRight size={18} />
                  </span>

                </button>

                <button
                  onClick={() => router.push("/client")}
                  className="
                    px-8
                    py-4
                    rounded-full
                    border-2
                    border-red-500/60
                    bg-red-500/10
                    text-red-300
                    font-semibold
                    hover:bg-red-500/20
                    transition-all
                    shadow-lg
                    shadow-red-500/30
                  "
                >

                  I'm a Client

                </button>

              </motion.div>

            </div>

          </GlassCard>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="
        relative
        z-10
        px-4
        pb-10
        pt-20
      ">

        <div className="max-w-6xl mx-auto">

          <GlassCard>

            <div className="
              px-6
              py-8
              md:py-10
              flex
              flex-col
              md:flex-row
              items-center
              justify-between
              gap-6
            ">

              <div className="
                text-sm
                text-slate-400
                text-center
                md:text-left
              ">

                © 2026 Neellohit. Transforming digital influence into real earnings.

              </div>

              <div className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-4
                md:gap-6
                text-sm
                text-slate-400
              ">

                <button
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white transition"
                >
                  Features
                </button>

                <button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-white transition"
                >
                  How It Works
                </button>

                <button
                  onClick={() => router.push("/client")}
                  className="hover:text-white transition"
                >
                  For Clients
                </button>

              </div>

            </div>

          </GlassCard>

        </div>

      </footer>

    </main>
  )
}