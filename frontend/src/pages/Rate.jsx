import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./UpdateStock.css"
import "./Rate.css"

const dropIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" />
  </svg>
)

const FUELS = [
  { key: "petrol", name: "Petrol", color: "#16a34a" },
  { key: "diesel", name: "Diesel", color: "#c85a00" },
  { key: "kerosene", name: "Kerosene", color: "#2456b8" },
]

function Rate() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [rates, setRates] = useState(() => {
    const def = { petrol: "150.00", diesel: "126.55", kerosene: "110.00" }
    try { return { ...def, ...JSON.parse(localStorage.getItem("fuelRates") || "{}") } } catch (_) { return def }
  })
  const [editing, setEditing] = useState(null) // fuel key or null
  const [newRate, setNewRate] = useState("")
  const [error, setError] = useState("")

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

  if (!user) return null

  const openEdit = (f) => { setEditing(f.key); setNewRate(rates[f.key]); setError("") }

  const handleSave = (e) => {
    e.preventDefault()
    if (!newRate || Number(newRate) <= 0) { setError("Enter a valid rate"); return }
    const updated = { ...rates, [editing]: Number(newRate).toFixed(2) }
    setRates(updated)
    localStorage.setItem("fuelRates", JSON.stringify(updated))
    setEditing(null)
  }

  // ── Edit view (Update Stock style) ─────────────────────────────────────────
  if (editing) {
    const fuel = FUELS.find((f) => f.key === editing)
    return (
      <div className="us-page">
        <div className="us-wrap">
          <div className="us-head">
            <div className="us-title-row">
              <span className="us-title-ic" style={{ color: fuel.color, background: "#f4f6f8" }}>{dropIcon}</span>
              <h1 className="us-title">Set {fuel.name} Rate</h1>
            </div>
            <p className="us-sub">Update the per-litre selling price.</p>
          </div>

          <form onSubmit={handleSave}>
            <section className="us-card">
              <div className="us-card-hd"><span className="us-section">RATE DETAILS</span></div>
              <div className="us-grid">
                <div className="us-field">
                  <label>Fuel</label>
                  <div className="us-readonly">{fuel.name}</div>
                </div>
                <div className="us-field">
                  <label>Current Rate</label>
                  <div className="us-readonly">Rs {rates[fuel.key]} <span className="us-muted">/ litre</span></div>
                </div>
                <div className="us-field">
                  <label>New Rate <span className="req">*</span></label>
                  <input type="number" step="0.01" placeholder="Enter new rate (Rs / litre)"
                    value={newRate} onChange={(e) => setNewRate(e.target.value)} autoFocus />
                </div>
              </div>
            </section>

            {error && <div className="us-error">{error}</div>}

            <div className="us-actions">
              <button type="button" className="us-btn us-back" onClick={() => setEditing(null)}>Back</button>
              <button type="submit" className="us-btn us-primary">Save Rate</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── List view (cards) ──────────────────────────────────────────────────────
  return (
    <div className="us-page">
      <div className="us-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">{dropIcon}</span>
            <h1 className="us-title">Fuel Rates</h1>
          </div>
          <p className="us-sub">Current per-litre selling price. Tap a fuel to set a new rate.</p>
        </div>

        <section className="us-card">
          <div className="us-card-hd">
            <span className="us-section">TODAY'S RATE</span>
            <span className="rate-date">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="rate-grid">
            {FUELS.map((f) => (
              <button type="button" className="rate-mini" key={f.key} onClick={() => openEdit(f)}>
                <div className="rate-mini-ic" style={{ color: f.color }}>{dropIcon}</div>
                <div className="rate-mini-body">
                  <div className="rate-mini-name">{f.name}</div>
                  <div className="rate-mini-val">Rs {rates[f.key]}<span className="rate-mini-unit"> / litre</span></div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="us-actions">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back</button>
        </div>
      </div>
    </div>
  )
}

export default Rate
