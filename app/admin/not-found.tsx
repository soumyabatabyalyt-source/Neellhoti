import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-bold text-white mb-3">
          Admin Page Not Found
        </h2>

        <p className="text-slate-400 mb-8">
          This resource doesn't exist in the admin panel.
        </p>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-all font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Admin
        </Link>
