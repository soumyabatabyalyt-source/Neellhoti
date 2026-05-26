"use client"

import { useState } from "react"
import { Plus, X, Printer, FileText, ChevronDown, ChevronRight } from "lucide-react"

type Service = {
  id: number
  name: string
  sub: string
  qty: number
  price: number
}

const INV_STYLES = `
  @media print {
    @page { size: A4; margin: 14mm 18mm; }

    /* Hide everything except the invoice */
    body * { visibility: hidden !important; }
    #invoice-doc, #invoice-doc * { visibility: visible !important; }

    /* Natural-flow, multi-page safe */
    #invoice-doc {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      min-height: unset !important;
    }

    /* Prevent awkward mid-element breaks */
    table { page-break-inside: auto; }
    tr    { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  }
`

// ── helpers ──────────────────────────────────────────
const fmt    = (n: number) => "$"   + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
const fmtUS  = (n: number) => "US$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
const fmtINR = (n: number) => "₹"   + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

function statusStyle(s: string): React.CSSProperties {
  if (s.includes("PARTIAL")) return { color: "#c0392b" }
  if (s === "PAID")          return { color: "#27ae60" }
  if (s === "UNPAID")        return { color: "#e67e22" }
  return { color: "#7f8c8d" }
}

// ── reusable form primitives ─────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1 mt-3">
    {children}
  </label>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
  />
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors resize-y min-h-[52px] font-sans"
  />
)

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    {...props}
    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
  >
    {props.children}
  </select>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mt-6 mb-2 pb-1.5 border-b border-zinc-800">
    {children}
  </div>
)

function Toggle({
  label, open, onToggle, children,
}: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        {label}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

// ── main component ───────────────────────────────────
export default function BillingPage() {
  // ── from ──
  const [fromName, setFromName] = useState("Soumya Batabyal")
  const [fromWeb,  setFromWeb]  = useState("neellohit.xyz")
  const [fromAddr, setFromAddr] = useState("Belmuri, Hooghly, West Bengal, India")

  // ── billed to ──
  const [toName, setToName] = useState("Eyooz OÜ")
  const [toAddr, setToAddr] = useState("Ahtri 12, 10151, Tallinn, Estonia")
  const [toReg,  setToReg]  = useState("14907169")
  const [toVat,   setToVat]   = useState("EE102239313")
  const [toEmail, setToEmail] = useState("")

  // ── meta ──
  const [invNo,   setInvNo]   = useState("INV-001")
  const [invDate, setInvDate] = useState("21 May 2026")
  const [status,  setStatus]  = useState("PARTIAL — DUES PENDING")

  // ── services ──
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: "Reddit Posts",    sub: "Posting work on client subreddit",    qty: 17,   price: 3.00 },
    { id: 2, name: "Reddit Comments", sub: "Commenting work on client subreddit", qty: 1025, price: 1.00 },
  ])
  const [nextId, setNextId] = useState(3)

  // ── payment received ──
  const [showPayment, setShowPayment] = useState(false)
  const [payTitle,  setPayTitle]  = useState("Payment Received from Eyooz OÜ")
  const [payGross,  setPayGross]  = useState(1204.33)
  const [payBuyer,  setPayBuyer]  = useState(34.33)
  const [paySeller, setPaySeller] = useState(99.97)
  const [payIntl,   setPayIntl]   = useState(18.07)
  const [payRate,   setPayRate]   = useState(96)

  // ── outstanding dues ──
  const [showDues, setShowDues] = useState(false)

  // ── note ──
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState(
    "The balance represents the shortfall between the agreed service value and the net amount received due to platform fee misappropriation. This amount remains outstanding and is requested to be settled separately."
  )

  // ── bank ──
  const [bankName,  setBankName]  = useState("State Bank of India")
  const [bankAcc,   setBankAcc]   = useState("40982147073")
  const [bankSwift, setBankSwift] = useState("SBININBB331")
  const [bankCurr,  setBankCurr]  = useState("USD (received in INR equivalent)")

  // ── payment method ──
  const [paymentMethod, setPaymentMethod] = useState<null | "bank" | "crypto">(null)

  // ── crypto ──
  const [cryptoBinanceId,   setCryptoBinanceId]   = useState("")
  const [cryptoBinanceUser, setCryptoBinanceUser] = useState("")
  const [cryptoWallet,      setCryptoWallet]      = useState("")
  const [cryptoNetwork,     setCryptoNetwork]     = useState("BEP-20 (BSC)")
  const [cryptoCoins,       setCryptoCoins]       = useState("USDT, USDC, BNB")

  // ── computed ──
  const totalServices   = services.reduce((s, r) => s + r.qty * r.price, 0)
  const totalDeductions = payBuyer + paySeller + payIntl
  const netUSD          = payGross - totalDeductions
  const netINR          = netUSD * payRate
  const balanceDue      = totalServices - netUSD

  // ── service helpers ──
  function addService() {
    setServices(prev => [...prev, { id: nextId, name: "", sub: "", qty: 1, price: 0 }])
    setNextId(n => n + 1)
  }
  function removeService(id: number) {
    setServices(prev => prev.filter(s => s.id !== id))
  }
  function updateService(id: number, field: keyof Service, value: string | number) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  // ── invoice styles (inline) ──
  const inv: Record<string, React.CSSProperties> = {
    doc: {
      width: 794, background: "#fff",
      padding: "60px 60px 50px", fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#222", fontSize: 13, lineHeight: 1.5,
      boxShadow: "0 4px 24px rgba(0,0,0,.15)",
    },
    title: { fontSize: 40, fontWeight: 800, color: "#1a3a5c", letterSpacing: 1, marginBottom: 22 },
    divider: { height: 3, background: "linear-gradient(90deg,#1a3a5c,#4a90d9)", margin: "0 0 28px", border: "none" },
    header: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 32 },
    invLabel: { fontSize: 10, fontWeight: 700, color: "#8a9ab0", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 },
    invName:  { fontSize: 16, fontWeight: 700, color: "#1a3a5c" },
    invAddr:  { fontSize: 12.5, color: "#555", marginTop: 3 },
    meta: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 32, paddingTop: 18, borderTop: "1px solid #e0e8f0" },
    metaLabel: { fontSize: 10, fontWeight: 700, color: "#8a9ab0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
    metaVal:   { fontSize: 14, fontWeight: 700, color: "#1a3a5c" },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1a3a5c", marginBottom: 12 },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 24 },
    boxTitle: { fontSize: 14, fontWeight: 700, color: "#1a3a5c", marginBottom: 10 },
    note: { background: "#f4f7fb", borderLeft: "3px solid #4a90d9", padding: "12px 16px", fontSize: 11.5, color: "#555", marginBottom: 24, borderRadius: "0 6px 6px 0" },
    thankyou: { textAlign: "center", fontStyle: "italic", color: "#8a9ab0", marginTop: 32, fontSize: 13, paddingTop: 20, borderTop: "1px solid #e0e8f0" },
    cryptoBlock: { background: "#fffbf0", border: "1px solid #f0d070", borderRadius: 8, padding: "14px 16px" },
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: INV_STYLES }} />

      {/* ══ LEFT: FORM PANEL ══ */}
      <div className="w-[400px] min-w-[360px] bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Invoice Generator</h2>
            <p className="text-[11px] text-zinc-500">Fill in details — preview updates live</p>
          </div>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0 scrollbar-thin scrollbar-thumb-zinc-700">

          {/* FROM */}
          <SectionTitle>From (You)</SectionTitle>
          <Label>Full Name</Label>
          <Input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Your name" />
          <Label>Website / Handle</Label>
          <Input value={fromWeb} onChange={e => setFromWeb(e.target.value)} placeholder="yoursite.com" />
          <Label>Address</Label>
          <Textarea value={fromAddr} onChange={e => setFromAddr(e.target.value)} rows={2} />

          {/* BILLED TO */}
          <SectionTitle>Billed To</SectionTitle>
          <Label>Company / Person</Label>
          <Input value={toName} onChange={e => setToName(e.target.value)} placeholder="Client name" />
          <Label>Address</Label>
          <Textarea value={toAddr} onChange={e => setToAddr(e.target.value)} rows={2} />
          <Label>Email Address</Label>
          <Input type="email" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="client@gmail.com" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Registry Code</Label>
              <Input value={toReg} onChange={e => setToReg(e.target.value)} />
            </div>
            <div>
              <Label>VAT Number</Label>
              <Input value={toVat} onChange={e => setToVat(e.target.value)} />
            </div>
          </div>

          {/* INVOICE META */}
          <SectionTitle>Invoice Details</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Invoice No.</Label>
              <Input value={invNo} onChange={e => setInvNo(e.target.value)} />
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input value={invDate} onChange={e => setInvDate(e.target.value)} placeholder="21 May 2026" />
            </div>
          </div>
          <Label>Status</Label>
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="PARTIAL — DUES PENDING">PARTIAL — DUES PENDING</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="DRAFT">DRAFT</option>
          </Select>

          {/* SERVICES */}
          <SectionTitle>Services Rendered</SectionTitle>
          <div className="space-y-3">
            {services.map(s => (
              <div key={s.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 relative">
                <button
                  onClick={() => removeService(s.id)}
                  className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <Label>Service Name</Label>
                <Input
                  value={s.name}
                  onChange={e => updateService(s.id, "name", e.target.value)}
                  placeholder="e.g. Reddit Posts"
                />
                <Label>Description (optional)</Label>
                <Input
                  value={s.sub}
                  onChange={e => updateService(s.id, "sub", e.target.value)}
                  placeholder="Short description"
                />
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label>Qty</Label>
                    <Input
                      type="number" min={0}
                      value={s.qty}
                      onChange={e => updateService(s.id, "qty", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Unit Price (USD)</Label>
                    <Input
                      type="number" min={0} step={0.01}
                      value={s.price}
                      onChange={e => updateService(s.id, "price", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addService}
            className="w-full mt-2 py-2 border border-dashed border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            <Plus className="w-3 h-3 inline mr-1" />Add Service Line
          </button>

          {/* PAYMENT RECEIVED */}
          <SectionTitle>Optional Sections</SectionTitle>
          <Toggle label="Payment Received" open={showPayment} onToggle={() => setShowPayment(v => !v)}>
            <Label>Section Title</Label>
            <Input value={payTitle} onChange={e => setPayTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Amount Paid (USD)</Label><Input type="number" step={0.01} value={payGross} onChange={e => setPayGross(+e.target.value)} /></div>
              <div><Label>Buyer Fees (USD)</Label><Input type="number" step={0.01} value={payBuyer} onChange={e => setPayBuyer(+e.target.value)} /></div>
              <div><Label>Seller Fees (USD)</Label><Input type="number" step={0.01} value={paySeller} onChange={e => setPaySeller(+e.target.value)} /></div>
              <div><Label>Intl. Payment Fee</Label><Input type="number" step={0.01} value={payIntl} onChange={e => setPayIntl(+e.target.value)} /></div>
            </div>
            <Label>INR Exchange Rate (₹/USD)</Label>
            <Input type="number" step={0.01} value={payRate} onChange={e => setPayRate(+e.target.value)} />
          </Toggle>

          <Toggle label="Outstanding Dues" open={showDues} onToggle={() => setShowDues(v => !v)}>
            <p className="text-[11px] text-zinc-500 italic">
              Auto-calculated: Total Services Value − Net Received = <span className="text-red-400 font-semibold">{fmtUS(Math.max(0, balanceDue))}</span>
            </p>
          </Toggle>

          <Toggle label="Note" open={showNote} onToggle={() => setShowNote(v => !v)}>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </Toggle>

          {/* PAYMENT METHOD SELECTOR */}
          <SectionTitle>Payment Method</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod(paymentMethod === "bank" ? null : "bank")}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${
                paymentMethod === "bank"
                  ? "bg-blue-500/20 border-blue-500 text-blue-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span className="text-lg">🏦</span>
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod(paymentMethod === "crypto" ? null : "crypto")}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${
                paymentMethod === "crypto"
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span className="text-lg">₿</span>
              Crypto / Web3
            </button>
          </div>

          {/* BANK DETAILS (shown when bank selected) */}
          {paymentMethod === "bank" && (
            <div className="mt-3 space-y-0">
              <Label>Bank Name</Label>
              <Input value={bankName} onChange={e => setBankName(e.target.value)} />
              <Label>Account Number</Label>
              <Input value={bankAcc} onChange={e => setBankAcc(e.target.value)} />
              <Label>SWIFT / BIC</Label>
              <Input value={bankSwift} onChange={e => setBankSwift(e.target.value)} />
              <Label>Currency Note</Label>
              <Input value={bankCurr} onChange={e => setBankCurr(e.target.value)} />
            </div>
          )}

          {/* CRYPTO DETAILS (shown when crypto selected) */}
          {paymentMethod === "crypto" && (
            <div className="mt-3 bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 space-y-0">
              <Label>Binance Pay ID</Label>
              <Input
                value={cryptoBinanceId}
                onChange={e => setCryptoBinanceId(e.target.value)}
                placeholder="e.g. 123456789"
              />
              <Label>Binance Email / Username (optional)</Label>
              <Input
                value={cryptoBinanceUser}
                onChange={e => setCryptoBinanceUser(e.target.value)}
                placeholder="e.g. user@email.com"
              />
              <Label>Wallet / Token Address</Label>
              <input
                value={cryptoWallet}
                onChange={e => setCryptoWallet(e.target.value)}
                placeholder="e.g. 0xAbCd1234..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
              <Label>Network</Label>
              <Select value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)}>
                <option value="BEP-20 (BSC)">BEP-20 (BSC) — Binance Smart Chain</option>
                <option value="ERC-20 (Ethereum)">ERC-20 (Ethereum)</option>
                <option value="TRC-20 (TRON)">TRC-20 (TRON)</option>
                <option value="Solana (SOL)">Solana (SOL)</option>
                <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
              </Select>
              <Label>Accepted Coins (comma-separated)</Label>
              <Input
                value={cryptoCoins}
                onChange={e => setCryptoCoins(e.target.value)}
                placeholder="e.g. USDT, USDC, BNB"
              />
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* Footer: print button */}
        <div className="px-5 py-4 bg-zinc-950 border-t border-zinc-800">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Download / Print as PDF
          </button>
        </div>
      </div>

      {/* ══ RIGHT: PREVIEW PANEL ══ */}
      <div className="flex-1 bg-zinc-800 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-5">
          <span className="text-sm font-semibold text-zinc-300">Live Preview</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>

        {/* Scrollable preview area */}
        <div
          id="billing-invoice-root"
          className="flex-1 overflow-y-auto flex justify-center py-8 px-4"
        >
          <div id="invoice-doc" style={inv.doc}>

            {/* Title + divider */}
            <div style={inv.title}>INVOICE</div>
            <hr style={inv.divider} />

            {/* From / Billed To */}
            <div style={inv.header}>
              <div>
                <div style={inv.invLabel}>From</div>
                <div style={inv.invName}>{fromName}</div>
                <div style={inv.invAddr}>
                  {fromWeb && <>{fromWeb}<br /></>}
                  {fromAddr.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                </div>
              </div>
              <div>
                <div style={inv.invLabel}>Billed To</div>
                <div style={inv.invName}>{toName}</div>
                <div style={inv.invAddr}>
                  {toAddr.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                  {toEmail && <><br />Email: {toEmail}</>}
                  {toReg && <><br />Registry Code: {toReg}</>}
                  {toVat && <><br />VAT Number: {toVat}</>}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div style={inv.meta}>
              <div>
                <div style={inv.metaLabel}>Invoice No.</div>
                <div style={inv.metaVal}>{invNo}</div>
              </div>
              <div>
                <div style={inv.metaLabel}>Invoice Date</div>
                <div style={inv.metaVal}>{invDate}</div>
              </div>
              <div>
                <div style={inv.metaLabel}>Status</div>
                <div style={{ ...inv.metaVal, ...statusStyle(status) }}>{status}</div>
              </div>
            </div>

            {/* Services table */}
            <div style={inv.sectionTitle}>Services Rendered</div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
              <thead>
                <tr style={{ background: "#1a3a5c" }}>
                  {["Description", "QTY", "Unit Price", "Amount"].map((h, i) => (
                    <th key={h} style={{
                      color: "#fff", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 0.8, padding: "10px 12px",
                      textAlign: i === 0 ? "left" : i === 3 ? "right" : "center",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #e8eef5", background: idx % 2 === 1 ? "#f7f9fc" : "transparent" }}>
                    <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 600, color: "#1a3a5c" }}>{s.name}</div>
                      {s.sub && <div style={{ fontSize: 11.5, color: "#777", marginTop: 2 }}>{s.sub}</div>}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{s.qty.toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{fmt(s.price)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(s.qty * s.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#1a3a5c" }}>
                  <td colSpan={3} style={{ padding: "11px 12px", fontWeight: 700, color: "#fff", letterSpacing: 0.5, fontSize: 13 }}>
                    TOTAL SERVICES VALUE
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontWeight: 700, color: "#fff", fontSize: 13 }}>
                    {fmt(totalServices)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Payment + Dues two-col */}
            {(showPayment || showDues) && (
              <div style={inv.twoCol}>
                {showPayment && (
                  <div>
                    <div style={inv.boxTitle}>{payTitle}</div>
                    {[
                      { label: "Amount Paid by Client", val: fmtUS(payGross), bold: true, red: false },
                      { label: "Less: Buyer Fees",        val: `- ${fmtUS(payBuyer)}`,  bold: false, red: true, italic: true },
                      { label: "Less: Seller Fees",       val: `- ${fmtUS(paySeller)}`, bold: false, red: true, italic: true },
                      { label: "Less: International Fee", val: `- ${fmtUS(payIntl)}`,   bold: false, red: true, italic: true },
                      { label: "Total Deductions",        val: `- ${fmtUS(totalDeductions)}`, bold: true, red: true },
                      { label: "Net Amount Received (USD)", val: fmtUS(netUSD), bold: true, red: false },
                      { label: `INR Equivalent (@ ₹${payRate}/USD)`, val: fmtINR(netINR), bold: false, small: true },
                    ].map(({ label, val, bold, red, italic, small }, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "7px 0", borderBottom: "1px solid #eef2f7",
                        fontSize: small ? 12 : 12.5,
                      }}>
                        <span style={{ color: "#555", fontStyle: italic ? "italic" : "normal" }}>{label}</span>
                        <span style={{ fontWeight: bold ? 700 : 600, color: red ? "#c0392b" : "#1a3a5c" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDues && (
                  <div>
                    <div style={{ ...inv.boxTitle, color: "#c0392b" }}>Outstanding Dues</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eef2f7", fontSize: 12.5 }}>
                      <span style={{ color: "#555" }}>Net Received</span>
                      <span style={{ fontWeight: 600 }}>{fmtUS(netUSD)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 700, color: "#c0392b", fontSize: 14 }}>
                      <span>BALANCE DUE</span>
                      <span>{fmtUS(Math.max(0, balanceDue))}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            {showNote && (
              <div style={inv.note}>
                <strong style={{ color: "#1a3a5c" }}>Note:</strong> {note}
              </div>
            )}

            {/* Payment Details — only shown when a method is selected */}
            {paymentMethod && (
              <div style={{ marginBottom: 12 }}>
                <div style={inv.sectionTitle}>Payment Details</div>
                <hr style={{ height: 1, background: "#e0e8f0", margin: "0 0 14px", border: "none" }} />

                {/* Bank Transfer */}
                {paymentMethod === "bank" && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                      🏦 Bank Transfer
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {[
                          ["Bank Name",      bankName],
                          ["Account Number", bankAcc],
                          ["SWIFT / BIC",    bankSwift],
                          ["Currency",       bankCurr],
                        ].map(([k, v]) => (
                          <tr key={k}>
                            <td style={{ padding: "5px 12px 5px 0", fontSize: 11, fontWeight: 700, color: "#8a9ab0", textTransform: "uppercase", letterSpacing: 0.8, width: 140, verticalAlign: "top" }}>{k}</td>
                            <td style={{ padding: "5px 0", fontSize: 12.5, fontWeight: 600, color: "#222" }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Crypto */}
                {paymentMethod === "crypto" && (
                  <div style={inv.cryptoBlock}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7a5800", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>₿</span> Crypto Payment
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {[
                          cryptoBinanceId   && ["Binance Pay ID",  cryptoBinanceId,   false],
                          cryptoBinanceUser && ["Binance User",     cryptoBinanceUser, false],
                          cryptoWallet      && ["Wallet Address",   cryptoWallet,      true],
                          cryptoNetwork     && ["Network",          cryptoNetwork,     false],
                          cryptoCoins       && ["Accepted Coins",   cryptoCoins,       false],
                        ].filter(Boolean).map(([k, v, mono]) => (
                          <tr key={k as string}>
                            <td style={{ padding: "5px 8px 5px 0", fontSize: 10.5, fontWeight: 700, color: "#a07820", textTransform: "uppercase", letterSpacing: 0.8, width: 120, verticalAlign: "top" }}>{k as string}</td>
                            <td style={{ padding: "5px 0", fontSize: mono ? 11 : 12.5, fontWeight: 600, color: "#333", fontFamily: mono ? "'Courier New', monospace" : "inherit", wordBreak: "break-all" }}>{v as string}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={inv.thankyou}>Thank you for your business.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
