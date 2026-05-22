"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Auth() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    if (saved === "light") setDark(false)
  }, [])

  const router = useRouter()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [username, setUsername] =
    useState("")

  const [reddit, setReddit] =
    useState("")

  const [discord, setDiscord] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [isSignup, setIsSignup] =
    useState(false)

  const wait = (ms: number) =>
    new Promise((resolve) =>
      setTimeout(resolve, ms)
    )

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Google login error:', error)
        alert(error.message || 'Google login failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('Google login error:', err)
      alert('Something went wrong with Google login')
      setLoading(false)
    }
  }

  const handleAuth = async () => {

    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (!email || !password) {

      alert(
        "Enter email and password"
      )

      return
    }

    // =========================================
    // SIGNUP VALIDATION
    // =========================================

    if (isSignup) {

      if (
        !username ||
        !reddit ||
        !discord
      ) {

        alert(
          "Fill all signup fields"
        )

        return
      }

      if (
        !reddit.includes(
          "reddit.com"
        )
      ) {

        alert(
          "Enter valid Reddit URL"
        )

        return
      }
    }

    setLoading(true)

    try {

      // =========================================
      // SIGNUP
      // =========================================

      if (isSignup) {

        // =========================================
        // CALL SERVER SIGNUP API
        // =========================================
        //
        // The browser is anon-key only, and
        // `public.profiles` has RLS enabled with
        // NO insert policy and a tightly-scoped
        // select policy. Trying to create the
        // profile (or pre-check duplicates) from
        // the client silently fails or leaves an
        // orphan auth user behind. The signup
        // happens server-side via the service
        // role key in /api/signup, which also
        // rolls the auth user back if the
        // profile insert errors out.

        const signupRes =
          await fetch("/api/signup", {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
              username,
              reddit,
              discord,
            }),
          })

        const signupJson =
          await signupRes
            .json()
            .catch(() => ({}))

        if (
          !signupRes.ok ||
          !signupJson.success
        ) {

          console.error(
            "SIGNUP FAILED:",
            signupJson
          )

          alert(
            signupJson?.error ||
            "Signup failed"
          )

          setLoading(false)

          return
        }

        // =========================================
        // REDIRECT TO PENDING APPROVAL
        // =========================================

        window.location.href = `/pending-approval?email=${encodeURIComponent(email)}`
        return
      }

      // =========================================
      // LOGIN
      // =========================================

      const {
        error: loginError,
      } = await supabase.auth.signInWithPassword({

        email,
        password,
      })

      if (loginError) {

        alert(
          loginError.message
        )

        setLoading(false)

        return
      }

      // =========================================
      // WAIT FOR SESSION
      // =========================================

      await wait(1200)

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession()

      const user =
        session?.user

      if (!user) {

        alert(
          "Session fetch failed"
        )

        setLoading(false)

        return
      }

      // =========================================
      // FETCH PROFILE
      // =========================================

      let profile = null
      let profileError = null

      for (
        let i = 0;
        i < 5;
        i++
      ) {

        const response =
          await supabase
            .from("profiles")
            .select(`
              approval_status,
              role
            `)
            .eq(
              "id",
              user.id
            )
            .maybeSingle()

        profile =
          response.data

        profileError =
          response.error

        if (profile) {
          break
        }

        await wait(800)
      }

      // =========================================
      // PROFILE FAILED
      // =========================================

      if (
        profileError ||
        !profile
      ) {

        console.error(
          profileError
        )

        alert(
          profileError?.message ||
          "Profile fetch failed"
        )

        setLoading(false)

        return
      }

      // =========================================
      // SUSPENDED
      // =========================================

      if (
        profile.approval_status === 'suspended'
      ) {

        alert(
          "Your account has been suspended. Please contact support."
        )

        setLoading(false)

        return
      }

      // =========================================
      // NOT APPROVED
      // =========================================

      if (
        profile.approval_status !== 'approved'
      ) {

        window.location.href = `/pending-approval?email=${encodeURIComponent(email)}`
        return
      }

      // =========================================
      // ROLE REDIRECT
      // =========================================

      if (
        profile.role === "admin"
      ) {

        router.replace("/admin")

      } else if (
        profile.role === "manager"
      ) {

        router.replace(
          "/manager/tasks"
        )

      } else {

        router.replace(
          "/dashboard/tasks"
        )
      }

    } catch (err) {

      console.error(err)

      alert(
        "Something went wrong"
      )
    }

    setLoading(false)
  }

  // ✅ Move conditional rendering into JSX, not early return
  if (!mounted) return null

  return (

    <div className={`
      min-h-screen
      flex
      items-center
      justify-center
      px-4
      relative
      overflow-hidden
      transition-colors duration-500
      ${dark ? "bg-[#0f0814]" : "bg-[#fafaf8]"}
    `}>

      {/* HOME BUTTON */}
      <button
        onClick={() => router.push("/")}
        className={`
          fixed
          top-6
          left-6
          z-50
          px-4
          py-2
          rounded-full
          font-semibold
          text-sm
          transition-all
          hover:scale-105
          ${dark
            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/50"
            : "bg-red-600 text-white hover:bg-red-700"}
        `}
      >
        Home
      </button>

      {/* GLOW */}
      <div className={`
        absolute
        w-[700px]
        h-[700px]
        rounded-full
        blur-[140px]
        top-[-20%]
        left-[-10%]
        ${dark ? "bg-red-500/10" : "bg-red-500/5"}
      `} />

      {/* CARD */}
      <motion.div

        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        className={`
          relative
          z-10
          w-full
          max-w-md
          border-2
          backdrop-blur-2xl
          rounded-3xl
          p-8
          shadow-2xl
          transition-colors duration-500
          ${dark
            ? "bg-[#7f1d1d] border-black shadow-[0_0_40px_rgba(239,68,68,0.2)] hover:shadow-[0_0_60px_rgba(239,68,68,0.3)]"
            : "bg-[#7f1d1d] border-black shadow-[0_20px_60px_rgba(0,0,0,0.3)]"}
        `}
      >

        <h1 className={`
          text-3xl
          font-bold
          mb-8
          text-center
          ${dark ? "text-white" : "text-white"}
        `}>

          {isSignup
            ? "Create Account"
            : "Welcome Back"}

        </h1>

        {/* USERNAME */}
        {isSignup && (
          <input
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className={getInputClass(dark)}
          />
        )}

        {/* EMAIL */}
        <input
          placeholder="Email Address"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className={getInputClass(dark)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className={getInputClass(dark)}
        />

        {/* REDDIT */}
        {isSignup && (
          <input
            placeholder="Reddit Profile URL"
            value={reddit}
            onChange={(e) =>
              setReddit(
                e.target.value
              )
            }
            className={getInputClass(dark)}
          />
        )}

        {/* DISCORD */}
        {isSignup && (
          <input
            placeholder="Discord Username"
            value={discord}
            onChange={(e) =>
              setDiscord(
                e.target.value
              )
            }
            className={getInputClass(dark)}
          />
        )}

        {/* BUTTON */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`
            w-full
            py-3
            rounded-xl
            transition-all
            text-white
            font-semibold
            mt-2
            disabled:opacity-50
            ${dark
              ? "bg-red-500 hover:bg-red-600"
              : "bg-red-500 hover:bg-red-600"}
          `}
        >

          {loading
            ? "Processing..."
            : isSignup
            ? "Create Account"
            : "Login"}

        </button>

        {/* DIVIDER */}
        {!isSignup && (
          <>
            <div className="
              flex
              items-center
              gap-4
              my-6
            ">
              <div className={`
                flex-1
                h-[1px]
                ${dark ? "bg-white/10" : "bg-red-500/20"}
              `} />
              <span className={`
                text-xs
                ${dark ? "text-white/40" : "text-slate-500"}
              `}>OR</span>
              <div className={`
                flex-1
                h-[1px]
                ${dark ? "bg-white/10" : "bg-red-500/20"}
              `} />
            </div>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`
                w-full
                py-3
                rounded-xl
                border
                transition-all
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-50
                ${dark
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-white"}
              `}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none"/>
              </svg>
              {loading ? "Connecting..." : "Login with Google"}
            </button>
          </>
        )}

        {/* TOGGLE */}
        <p className={`
          text-center
          mt-6
          text-sm
          ${dark ? "text-slate-400" : "text-slate-600"}
        `}>

          {isSignup
            ? "Already have an account?"
            : "New here?"}

          <span
            onClick={() =>
              setIsSignup(
                !isSignup
              )
            }
            className={`
              ml-2
              cursor-pointer
              transition-colors
              ${dark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"}
            `}
          >

            {isSignup
              ? "Login"
              : "Sign Up"}

          </span>

        </p>

      </motion.div>

    </div>
  )
}

const getInputClass = (dark: boolean) => `
  w-full
  border
  rounded-xl
  px-4
  py-3
  outline-none
  mb-4
  transition-all
  ${dark
    ? "bg-black/30 border-white/10 text-white placeholder:text-slate-500 focus:border-red-400/40"
    : "bg-white/60 border-red-500/30 text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"}
`
