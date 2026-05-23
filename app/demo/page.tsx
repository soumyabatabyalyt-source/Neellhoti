"use client"

import { motion } from "framer-motion"
import {
  Zap, Users, TrendingUp, Award, Shield, Clock,
  ArrowRight, Check, AlertCircle, Heart, Star,
  Loader2
} from "lucide-react"

export default function ThemeDemo() {
  return (
    <main className="min-h-screen bg-[#0f0814] text-[#ffffff] font-sans">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#0f0814]/80 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold">
              N
            </div>
            <h1 className="text-2xl font-bold">Neellohit Theme Demo</h1>
          </div>
          <div className="text-sm text-gray-300">Red & White with Dark Purple</div>
        </div>
      </header>

      {/* AMBIENT GLOWS - ANIMATED */}
      <div
        
        
        className="fixed w-[600px] h-[600px] bg-red-500/8 rounded-full blur-[120px] top-[-20%] left-[-10%] pointer-events-none"
      />
      <div
        
        
        className="fixed w-[500px] h-[500px] bg-red-600/6 rounded-full blur-[120px] bottom-[-10%] right-[-5%] pointer-events-none"
      />

      {/* CONTENT */}
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* SECTION 1: HERO CARDS */}
          <motion.section
            
            whileInView={{ opacity: 1, y: 0 }}
            
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8">Glass Cards with Red Accents</h2>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Zap, title: "Fast", desc: "Quick task completion" },
                { icon: Users, title: "Community", desc: "Join thousands of users" },
                { icon: TrendingUp, title: "Grow", desc: "Increase your earnings" },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.05, borderColor: "rgba(0, 0, 0, 1)" }}
                    className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-3xl p-8 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-red-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* SECTION 2: BUTTONS */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Button Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Primary Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white font-semibold py-3 rounded-xl border border-black shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
              >
                Primary Deep Red
              </motion.button>

              {/* Secondary Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="border-2 border-red-500/60 text-red-300 hover:text-red-200 hover:bg-red-500/10 py-3 rounded-xl transition-all"
              >
                Secondary Red
              </motion.button>

              {/* Success Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-green-500/30 hover:bg-green-500/40 text-green-300 border border-green-500/50 py-3 rounded-xl transition-all"
              >
                Success
              </motion.button>

              {/* Icon Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 hover:bg-red-500/20 text-red-300 flex items-center justify-center"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>
          </section>

          {/* SECTION 3: DASHBOARD CARDS */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Dashboard Task Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Create Reddit Post", reward: "$50", time: "2 days" },
                { title: "Write Product Review", reward: "$75", time: "3 days" },
              ].map((task, i) => (
                <div
                  key={i}
                  whileHover={{ borderColor: "rgba(0, 0, 0, 1)" }}
                  className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold flex-1">{task.title}</h3>
                    <span className="px-4 py-2 rounded-full bg-red-500/30 border border-red-500/60 text-white font-semibold text-sm">
                      {task.reward}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">Complete this task and earn rewards instantly</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{task.time}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-red-500/30 hover:bg-red-500/40 border border-red-500/60 text-white font-semibold py-2 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all"
                  >
                    Claim Task
                  </motion.button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: MANAGER STATS */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Manager Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Tasks", value: "24", trend: "+2" },
                { label: "Pending Review", value: "8", trend: "-1" },
                { label: "Total Spent", value: "$2.4K", trend: "+$500" },
                { label: "Active Taskers", value: "156", trend: "+12" },
              ].map((stat, i) => (
                <div
                  key={i}
                  whileHover={{ borderColor: "rgba(0, 0, 0, 1)" }}
                  className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
                >
                  <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-red-300 text-xs font-semibold">{stat.trend} today</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: NAVIGATION TABS */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Navigation Tabs</h2>
            <div className="backdrop-blur-xl bg-white/[0.02] border border-red-500/20 rounded-3xl p-2 w-fit">
              <div className="flex gap-2">
                {["Tasks", "My Tasks", "Wallet", "Account"].map((tab, i) => (
                  <motion.button
                    key={i}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                      i === 1
                        ? "bg-[#7f1d1d] text-white border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "text-gray-300 hover:text-white hover:bg-red-500/10"
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6: LOADING & STATES */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Loading & State Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Loading Spinner */}
              <div className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-2xl p-8 flex flex-col items-center">
                <div
                  
                  
                  className="w-12 h-12 rounded-xl border-2 border-red-500/30 border-t-red-500 mb-4"
                />
                <p className="text-gray-300">Loading...</p>
              </div>

              {/* Success State */}
              <div className="backdrop-blur-xl bg-white/[0.05] border-2 border-green-500/30 rounded-2xl p-8 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-green-300 font-semibold">Success</p>
              </div>

              {/* Error State */}
              <div className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-2xl p-8 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                <p className="text-red-300 font-semibold">Error</p>
              </div>
            </div>
          </section>

          {/* SECTION 7: BADGES */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Badges & Status Indicators</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Active", color: "green" },
                { label: "Pending", color: "red" },
                { label: "Completed", color: "green" },
                { label: "Rejected", color: "red" },
              ].map((badge, i) => (
                <span
                  key={i}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    badge.color === "red"
                      ? "bg-red-500/20 text-red-300 border-red-500/50"
                      : "bg-green-500/20 text-green-300 border-green-500/50"
                  }`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </section>

          {/* SECTION 8: FORM ELEMENTS */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Form Elements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-semibold mb-2">Text Input</label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                />
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-semibold mb-2">Textarea</label>
                <textarea
                  placeholder="Describe the task..."
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all h-12 resize-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 9: HERO SECTION */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Hero Section Example</h2>
            <div className="backdrop-blur-xl bg-[#7f1d1d] border-2 border-black rounded-3xl p-12 text-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <h3 className="text-5xl font-bold mb-4">
                Earn Red-Hot <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Rewards</span>
              </h3>
              <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
                Join Neellohit and complete tasks to earn real money. Start today and grow your income.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-red-500/30 hover:bg-red-500/40 border border-black text-white px-8 py-3 rounded-lg font-semibold shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
                >
                  Become a Tasker
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-red-500/50 text-red-300 hover:text-red-200 px-8 py-3 rounded-lg font-semibold hover:bg-red-500/10 transition-all"
                >
                  Create Campaign
                </motion.button>
              </div>
            </div>
          </section>

          {/* COLOR REFERENCE */}
          <section>
            <h2 className="text-4xl font-bold mb-8">Color Reference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="w-full h-24 rounded-lg mb-3 border-2 border-red-500/50" style={{ backgroundColor: "#0a0a0a" }} />
                <p className="font-semibold">Dark Background</p>
                <p className="text-sm text-gray-400">#0a0a0a</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg mb-3 border-2 border-red-500/50" style={{ backgroundColor: "#7f1d1d" }} />
                <p className="font-semibold">Deep Red Cards</p>
                <p className="text-sm text-gray-400">#7f1d1d</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg mb-3 border-2 border-red-500/50" style={{ backgroundColor: "#000000" }} />
                <p className="font-semibold">Black Borders</p>
                <p className="text-sm text-gray-400">#000000</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg mb-3 border-2 border-red-500/50" style={{ backgroundColor: "#ffffff" }} />
                <p className="font-semibold">Pure White Text</p>
                <p className="text-sm text-gray-400">#ffffff</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
