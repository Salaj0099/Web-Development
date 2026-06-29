import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./UpdateStock.css"
import "./CollectCredit.css"

const money = (n) => "Rs " + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function CollectCredit() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState([])

  // Collection modal state
  const [collecting, setCollecting] = useState(null) // bill being collected
  const [method, setMethod] = useState("Cash")
  const [bank, setBank] = useState("")
  const [cleared, setCleared] = useState(true)
  const [cErr, setCErr] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { navigate("/signin", { replace: true }); return }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) { navigate("/signin", { replace: true }); return }
      setUser(parsed)
    } catch (_) {
      navigate("/signin", { replace: true })
    }
  }, [navigate])

  const loadCredits = () => {
    try {
      const bills = JSON.parse(localStorage.getItem("bills") || "[]")
      setCredits(bills.filter((b) => b.status === "credit"))
    } catch (_) { setCredits([]) }
  }

  useEffect(() => { loadCredits() }, [])

  if (!user) return null

  const total = credits.reduce((s, c) => s + (Number(c.amount) || 0), 0)

  const openCollect = (bill) => {
    setCollecting(bill)
    setMethod("Cash")
    setBank("")
    setCleared(true)
    setCErr("")
  }

  const confirmCollect = () => {
    if (method === "Cheque" && !bank.trim()) { setCErr("Enter the bank name"); return }
    try {
      const collection = {
        method,
        at: Date.now(),
        ...(method === "Cheque" ? { bank: bank.trim(), chequeCleared: cleared } : {}),
        ...(method === "Credit" ? { creditCleared: cleared } : {}),
      }
      const bills = JSON.parse(localStorage.getItem("bills") || "[]")
      const next = bills.map((b) => (b.id === collecting.id ? { ...b, status: "paid", collection } : b))
      localStorage.setItem("bills", JSON.stringify(next))
      loadCredits()
    } catch (_) {}
    setCollecting(null)
  }

  return (
    <div className="us-page">
      <div className="us-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" />
              </svg>
            </span>
            <h1 className="us-title">Collect Credit</h1>
          </div>
          <p className="us-sub">Customers with outstanding dues from credit bills.</p>
        </div>

        <section className="us-card">
          <div className="us-card-hd">
            <span className="us-section">UNPAID BILLS</span>
            <span className="cc-out">Outstanding: <strong>{money(total)}</strong></span>
          </div>

          {credits.length === 0 ? (
            <div className="cc-empty">
              <div className="cc-empty-title">No outstanding credit</div>
              <div className="cc-empty-sub">Credit bills will appear here for collection.</div>
            </div>
          ) : (
            <div className="cc-list">
              {credits.map((c) => (
                <div className="cc-row" key={c.id}>
                  <div className="cc-main">
                    <div className="cc-name">{c.customer}</div>
                    <div className="cc-meta">{c.id} · {c.items}{c.date ? ` · ${c.date}` : ""}</div>
                  </div>
                  <div className="cc-amount">{money(c.amount)}</div>
                  <button className="cc-paid-btn" onClick={() => openCollect(c)}>Mark Paid</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="us-actions">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back</button>
        </div>
      </div>

      {collecting && (
        <div className="cc-ov" onClick={() => setCollecting(null)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="cc-modal-title">Collect payment</h3>
            <p className="cc-modal-sub">{collecting.customer} · {money(collecting.amount)}</p>

            <div className="us-field">
              <label>Payment Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>Cash</option>
                <option>Cheque</option>
                <option>Credit</option>
              </select>
            </div>

            {method === "Cheque" && (
              <div className="us-field cc-field-gap">
                <label>Bank Name <span className="req">*</span></label>
                <input type="text" placeholder="Enter bank name" value={bank} onChange={(e) => setBank(e.target.value)} />
              </div>
            )}

            {(method === "Cheque" || method === "Credit") && (
              <div className="us-field cc-field-gap">
                <label>
                  {method === "Cheque"
                    ? "Has the cheque been cleared by the bank yet?"
                    : "Has this credit payment been fully cleared?"}
                </label>
                <div className="cc-toggle">
                  <button type="button" className={cleared ? "active" : ""} onClick={() => setCleared(true)}>Yes</button>
                  <button type="button" className={!cleared ? "active" : ""} onClick={() => setCleared(false)}>No</button>
                </div>
              </div>
            )}

            {cErr && <div className="us-error cc-field-gap">{cErr}</div>}

            <div className="cc-modal-actions">
              <button className="us-btn us-back" onClick={() => setCollecting(null)}>Cancel</button>
              <button className="us-btn us-primary" onClick={confirmCollect}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectCredit
