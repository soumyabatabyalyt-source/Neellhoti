"use client"

export default function Sidebar({ setPage }: any) {
  return (
    <div style={{ width: "200px", background: "#111", color: "#fff", padding: "20px" }}>
      <h3>Menu</h3>

      <p
        style={{ cursor: "pointer", marginBottom: "10px" }}
        onClick={() => setPage("pool")}
      >
        Task Pool
      </p>

      <p
        style={{ cursor: "pointer" }}
        onClick={() => setPage("my")}
      >
        My Tasks
      </p>
    </div>
  )
}