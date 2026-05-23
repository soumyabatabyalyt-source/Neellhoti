"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle, Zap, Users, TrendingUp, Award, Shield, Clock } from "lucide-react"

V3 Live  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-[#0a0a14] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 md:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl text-center mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Tasks Into{" "}
            <span className="bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Real Money
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Complete tasks, earn rewards, and withdraw funds instantly. The simplest platform for task workers and managers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 border-2 border-red-500/50 text-white font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Neellohit?</h2>
            <p className="text-gray-400 text-lg">Everything you need to manage tasks and earnings</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Instant task posting and payment processing. No waiting, no delays.",
              },
              {
                icon: Shield,
                title: "Secure & Verified",
                description: "Bank-level security with identity verification for all users.",
              },
              {
                icon: Users,
                title: "Growing Community",
                description: "Join thousands of workers and managers earning real money daily.",
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "Track your earnings, task history, and growth with detailed insights.",
              },
              {
                icon: Award,
                title: "Top Performers",
                description: "Earn badges and reputation bonuses as you complete quality tasks.",
              },
              {
                icon: Clock,
                title: "24/7 Available",
                description: "Work anytime, anywhere. Your schedule, your rules.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to start earning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up in seconds with your email. Complete verification to start.",
              },
              {
                step: "2",
                title: "Find & Complete Tasks",
                description: "Browse available tasks, select ones that match your skills, and complete them.",
              },
              {
                step: "3",
                title: "Get Paid Instantly",
                description: "Earn rewards immediately upon task completion. Withdraw anytime.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Workers", value: "10K+" },
              { label: "Tasks Completed", value: "50K+" },
              { label: "Total Payouts", value: "$250K+" },
              { label: "Countries", value: "45+" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of workers making real money on Neellohit today.</p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-500/20 py-12 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Neellohit</h3>
              <p className="text-gray-400">The platform for task workers and managers to connect and grow.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-500/20 pt-8 text-center text-gray-400">
            <p>© 2026 Neellohit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
