"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [reddit, setReddit] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const router = useRouter()

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password")
      return
    }

    setLoading(true)

    if (isSignup) {
      // 🔥 SIGNUP
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      // 🔥 CREATE PROFILE (IMPORTANT FIX)
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: email,
            reddit: reddit || "",
            role: "user",
          })

        if (profileError) {
          console.error(profileError)
          alert("Profile creation failed ❌")
        }
      }

      alert("Signup successful ✅ Now login")
      setIsSignup(false)
    } else {
      // 🔐 LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      alert("Login successful ✅")
      router.push("/dashboard/tasks")
    }

    setLoading(false)
  }

  return (
    <div style={container}>
      <h1>{isSignup ? "Sign Up" : "Login"}</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      {/* 🔥 Reddit field only for signup */}
      {isSignup && (
        <input
          placeholder="Reddit Profile Link"
          value={reddit}
          onChange={(e) => setReddit(e.target.value)}
          style={input}
        />
      )}

      <button onClick={handleAuth} style={btn} disabled={loading}>
        {loading
          ? "Processing..."
          : isSignup
          ? "Create Account"
          : "Login"}
      </button>

      <p style={{ marginTop: "10px" }}>
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Login" : "Sign up"}
        </span>
      </p>
    </div>
  )
}

//
// 🎨 STYLES
//

const container = {
  maxWidth: "400px",
  margin: "100px auto",
  padding: "20px",
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
}

const btn = {
  width: "100%",
  padding: "10px",
  cursor: "pointer",
}