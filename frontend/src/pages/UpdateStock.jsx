import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { updateStock } from "../services/api"
import "./UpdateStock.css"

const TANKS = {
  petrol: { label: "Petrol", current: "16,400 L", capacity: "20,000 L" },
  diesel: { label: "Diesel", current: "3,600 L", capacity: "20,000 L" },
  kerosene: { label: "Kerosene", current: "8,100 L", capacity: "15,000 L" },
}

function UpdateStock() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    product: "petrol",
    type: "delivery",
    quantity: "",
    supplier: "",
    reference: "",
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

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

  const tank = TANKS[form.product]
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Enter a valid quantity in litres")
      return
    }
    if (!form.supplier) {
      setError("Please select a supplier")
      return
    }
    try {
      setSaving(true)
      setError("")
      await updateStock({
        product: form.product,
        type: form.type,
        quantity: Number(form.quantity),
      })
      navigate("/dashboard")
    } catch (_) {
      setError("Could not update stock. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="us-page">
      <div className="us-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" />
              </svg>
            </span>
            <h1 className="us-title">Update Stock</h1>
          </div>
          <p className="us-sub">Record a delivery or adjust a tank's level.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="us-card">
            <div className="us-card-hd">
              <span className="us-section">STOCK DETAILS</span>
            </div>
            <div className="us-grid">
              <div className="us-field">
                <label>Product <span className="req">*</span></label>
                <select value={form.product} onChange={(e) => set("product", e.target.value)}>
                  {Object.entries(TANKS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="us-field">
                <label>Current Stock</label>
                <div className="us-readonly">
                  {tank.current} <span className="us-muted">/ {tank.capacity}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="us-card">
            <div className="us-card-hd">
              <span className="us-section">MOVEMENT DETAILS</span>
              <span className="us-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v5h5" /><path d="M3.05 13a9 9 0 1 0 2.6-6.4L3 8" />
                </svg>
                Recent deliveries
              </span>
            </div>
            <div className="us-grid">
              <div className="us-field">
                <label>Movement Type <span className="req">*</span></label>
                <select value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option value="delivery">Delivery received (stock in)</option>
                  <option value="adjustment">Manual adjustment</option>
                </select>
              </div>
              <div className="us-field">
                <label>Quantity (Litres) <span className="req">*</span></label>
                <input
                  type="number"
                  placeholder="Enter quantity in litres"
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
              <div className="us-field">
                <label>Supplier <span className="req">*</span></label>
                <select value={form.supplier} onChange={(e) => set("supplier", e.target.value)}>
                  <option value="">Select supplier</option>
                  <option>Nepal Oil Corporation</option>
                  <option>Others</option>
                </select>
              </div>
              <div className="us-field">
                <label>Reference No.</label>
                <input
                  type="text"
                  placeholder="Delivery / invoice number"
                  value={form.reference}
                  onChange={(e) => set("reference", e.target.value)}
                />
              </div>
            </div>
          </section>

          {error && <div className="us-error">{error}</div>}

          <div className="us-actions">
            <button type="button" className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back</button>
            <button type="submit" className="us-btn us-primary" disabled={saving}>
              {saving ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateStock
