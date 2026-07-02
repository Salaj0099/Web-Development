import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBills, collectBill } from "../services/api"
import "./UpdateStock.css"
import "./CollectCredit.css"

const money = (n) => "Rs " + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function CollectCredit() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState([])

  // Collection modal state
  const [collecting, setCollecting] = useState(null) // bill being collected
  const [cleared, setCleared] = useState(true)

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
    getAllBills()
      .then((res) => setCredits((res.data.bills || []).filter((b) => b.status === "credit")))
      .catch(() => setCredits([]))
  }

  useEffect(() => { loadCredits() }, [])

  if (!user) return null

  const total = credits.reduce((s, c) => s + (Number(c.amount) || 0), 0)

  const openCollect = (bill) => {
    setCollecting(bill)
    setCleared(true)
  }

  const confirmCollect = async () => {
    // Only clear the due when the payment is actually cleared.
    // If "No", the bill stays in the credit list as outstanding.
    if (!cleared) { setCollecting(null); return }
    try {
      await collectBill(collecting.dbId, { cleared: true, staff: user.name || user.email })
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
                    <div className="cc-name">
                      {c.customer}
                      <span className={`cc-tag ${c.payment === "Cheque" ? "cheque" : "credit"}`}>
                        {c.payment === "Cheque" ? "Cheque" : "Credit"}
                      </span>
                    </div>
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
              <label>
                {collecting.payment === "Cheque"
                  ? "Has the cheque been cleared?"
                  : "Has the full amount been cleared?"}
              </label>
              <div className="cc-toggle">
                <button type="button" className={cleared ? "active" : ""} onClick={() => setCleared(true)}>Yes</button>
                <button type="button" className={!cleared ? "active" : ""} onClick={() => setCleared(false)}>No</button>
              </div>
            </div>

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
