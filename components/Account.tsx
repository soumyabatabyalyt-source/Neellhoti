"use client"

export default function Account({ user }: any) {
  return (
    <div>
      <h2>Account</h2>
      <p>Email: {user?.email}</p>
    </div>
  )
}