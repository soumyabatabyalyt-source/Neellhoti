"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet as WalletIcon, 
  Send, 
  History, 
  IndianRupee, 
  RefreshCw,
  Building,
  CreditCard
} from "lucide-react"

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [activeTab, setActiveTab] = useState("wallet")

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("upi")
  const [details, setDetails] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchWallet = async () => {
    setIsRefreshing(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single()

    if (data) setBalance(data.balance)
    setTimeout(() => setIsRefreshing(false), 500) // Fake slight delay for UI feedback
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const withdraw = async () => {
    if (!amount || !details) return alert("Fill all fields")
    if (Number(amount) > balance) return alert("Insufficient balance")

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: Number(amount),
      method,
      details,
      status: "pending",
    })

    alert("Withdrawal request sent ✅")
    setAmount("")
    setDetails("")
  }

  return (
    <div className="w-full font-sans text-slate-200">
      
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-500">Wallet</span>
        </h1>
        <p className="text-slate-400 font-light">Manage your funds and request withdrawals.</p>
      </div>

      {/* 🔁 SECTION SWITCH TABS */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
        {[
          { id: "wallet", label: "Balance", icon: WalletIcon },
          { id: "withdraw", label: "Withdraw", icon: Send },
          { id: "history", label: "History", icon: History }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-400' : 'opacity-70'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 📦 CONTENT CONTAINER */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          
          {/* 💰 WALLET TAB */}
          {activeTab === "wallet" && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)] text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center mb-6">
                <WalletIcon size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-400 mb-2">Available Balance</h3>
              <h1 className="text-6xl font-extrabold text-white mb-8 tracking-tighter flex items-center gap-2">
                <span className="text-blue-500">₹</span>{balance}
              </h1>

              <button 
                onClick={fetchWallet} 
                disabled={isRefreshing}
                className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border-2 border-white/20 text-white text-sm font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin text-blue-400" : "text-blue-400"} />
                Refresh Balance
              </button>
            </motion.div>
          )}

          {/* 💸 WITHDRAW TAB */}
          {activeTab === "withdraw" && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Send size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                  <p className="text-sm text-slate-400 font-light">Transfer your earnings to your bank or wallet.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Amount Input */}
                <div className="relative group/input">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/20 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 font-medium"
                  />
                </div>

                {/* Method Select */}
                <div className="relative group/input">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors pointer-events-none" size={18} />
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-black/20 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-200 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 font-medium appearance-none cursor-pointer"
                  >
                    <option value="upi" className="bg-slate-900">UPI Transfer</option>
                    <option value="crypto" className="bg-slate-900">Crypto Wallet</option>
                  </select>
                </div>

                {/* Details Input */}
                <div className="relative group/input">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder={method === "upi" ? "Enter UPI ID (e.g., name@bank)" : "Enter Wallet Address"}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-black/20 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 font-medium"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  onClick={withdraw}
                  className="w-full mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 border-2 border-blue-400/30 flex items-center justify-center gap-2"
                >
                  Request Withdrawal
                </button>
              </div>
            </motion.div>
          )}

          {/* 📊 HISTORY TAB */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-[2rem] bg-blue-500/[0.04] border-2 border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_30px_rgba(0,0,0,0.2)] text-center flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center mb-4">
                <History size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transaction History</h3>
              <p className="text-slate-400 font-light">Your past withdrawals will appear here soon.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}