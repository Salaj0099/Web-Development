import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDeliveries, recordDelivery, receiveDelivery } from "../services/api"
import "./UpdateStock.css"
import "./Supplier.css"

const FUELS = [
  { key: "petrol", name: "Petrol" },
  { key: "diesel", name: "Diesel" },
  { key: "kerosene", name: "Kerosene" },
]
const rs = (n) => "Rs. " + Math.round(Number(n) || 0).toLocaleString("en-IN")
const rs2 = (n) => "Rs. " + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const litres = (n) => (Number(n) || 0).toLocaleString("en-IN") + " L"
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const prettyDate = (s) => {
  if (!s) return "—"
  const d = new Date(s + "T00:00:00")
  return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
const errText = (e, fallback) => (e && e.response && e.response.data && e.response.data.message) || fallback

const BLANK = { product: "petrol", quantity: "", rate: "", invoiceNo: "", deliveryDate: today(), status: "received", remarks: "" }

function Supplier() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { navigate("/signin", { replace: true }); return }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) { navigate("/signin", { replace: true }); return }
      setUser(parsed)
    } catch (_) { navigate("/signin", { replace: true }) }
  }, [navigate])

  const load = () => {
    getDeliveries()
      .then((res) => {
        setSupplier(res.data.supplier)
        setDeliveries(res.data.deliveries || [])
      })
      .catch(() => setError("Couldn't load delivery records. Please try again."))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  if (!user) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const lineTotal = (Number(form.quantity) || 0) * (Number(form.rate) || 0)

  // Summary cards
  const totalDeliveries = deliveries.length
  const litresReceived = deliveries.filter((d) => d.status === "received").reduce((s, d) => s + Number(d.quantity), 0)
  const purchaseValue = deliveries.reduce((s, d) => s + Number(d.total_amount), 0)
  const lastDate = deliveries.length ? deliveries.map((d) => d.delivery_date).sort().slice(-1)[0] : null

  const submit = async (e) => {
    e.preventDefault()
    setOk("")
    if (!form.quantity || Number(form.quantity) <= 0) { setError("Enter a quantity greater than zero."); return }
    if (!form.rate || Number(form.rate) <= 0) { setError("Enter the purchase rate per litre."); return }
    if (!form.invoiceNo.trim()) { setError("Enter the invoice / reference number."); return }
    if (!form.deliveryDate) { setError("Pick the delivery date."); return }
    try {
      setSaving(true); setError("")
      await recordDelivery({
        product: form.product,
        quantity: Number(form.quantity),
        rate: Number(form.rate),
        invoiceNo: form.invoiceNo.trim(),
        deliveryDate: form.deliveryDate,
        status: form.status,
        remarks: form.remarks.trim(),
      })
      const name = FUELS.find((f) => f.key === form.product).name
      setOk(form.status === "received"
        ? `Delivery recorded — ${name} stock updated.`
        : `Delivery saved as pending. Mark it received when it arrives.`)
      setForm({ ...BLANK, deliveryDate: today() })
      load()
    } catch (err) {
      setError(errText(err, "Couldn't save this delivery. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const markReceived = async (id) => {
    try {
      setBusyId(id); setError(""); setOk("")
      await receiveDelivery(id)
      setOk("Delivery marked received — stock updated.")
      load()
    } catch (err) {
      setError(errText(err, "Couldn't update this delivery."))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="us-page">
      <div className="sup-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2" /><circle cx="18.5" cy="18.5" r="2" />
              </svg>
            </span>
            <h1 className="us-title">Supplier</h1>
          </div>
          <p className="us-sub">Deliveries from Nepal Oil Corporation.</p>
        </div>

        {/* Summary */}
        <div className="sup-summary">
          <SummaryCard label="Total deliveries" value={loading ? "—" : String(totalDeliveries)} />
          <SummaryCard label="Litres received" value={loading ? "—" : litres(litresReceived)} />
          <SummaryCard label="Total purchase value" value={loading ? "—" : rs(purchaseValue)} />
          <SummaryCard label="Last delivery" value={loading ? "—" : prettyDate(lastDate)} />
        </div>

        {/* Supplier profile */}
        {supplier && (
          <section className="us-card sup-profile">
            <div className="sup-profile-main">
              <div className="sup-logo">NOC</div>
              <div>
                <div className="sup-name">{supplier.name}
                  <span className="sup-status">{supplier.status}</span>
                </div>
                <div className="sup-tagline">Sole fuel supplier · Government of Nepal</div>
              </div>
            </div>
            <div className="sup-contacts">
              <Contact ic="phone" label="Phone" value={supplier.phone} />
              <Contact ic="mail" label="Email" value={supplier.email} />
              <Contact ic="globe" label="Website" value={supplier.website} />
              <Contact ic="pin" label="Office" value={supplier.address} />
            </div>
          </section>
        )}

        {/* Record new delivery */}
        <form onSubmit={submit}>
          <section className="us-card">
            <div className="us-card-hd"><span className="us-section">RECORD NEW DELIVERY</span></div>
            <div className="us-grid">
              <div className="us-field">
                <label>Fuel Type <span className="req">*</span></label>
                <select value={form.product} onChange={(e) => set("product", e.target.value)}>
                  {FUELS.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
                </select>
              </div>
              <div className="us-field">
                <label>Quantity Received (Litres) <span className="req">*</span></label>
                <input type="number" min="0" placeholder="e.g. 8000" value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)} />
              </div>
              <div className="us-field">
                <label>Purchase Rate / Litre <span className="req">*</span></label>
                <input type="number" min="0" step="0.01" placeholder="e.g. 124.50" value={form.rate}
                  onChange={(e) => set("rate", e.target.value)} />
              </div>
              <div className="us-field">
                <label>Invoice / Reference No. <span className="req">*</span></label>
                <input type="text" placeholder="e.g. NOC/2082/0431" value={form.invoiceNo}
                  onChange={(e) => set("invoiceNo", e.target.value)} />
              </div>
              <div className="us-field">
                <label>Delivery Date <span className="req">*</span></label>
                <input type="date" value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
              </div>
              <div className="us-field">
                <label>Status <span className="req">*</span></label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="received">Received (updates stock)</option>
                  <option value="pending">Pending arrival</option>
                </select>
              </div>
              <div className="us-field sup-field-wide">
                <label>Remarks</label>
                <input type="text" placeholder="Optional — vehicle, driver, notes" value={form.remarks}
                  onChange={(e) => set("remarks", e.target.value)} />
              </div>
              <div className="us-field">
                <label>Total Amount</label>
                <div className="us-readonly">{rs2(lineTotal)}</div>
              </div>
            </div>

            {error && <div className="us-error" style={{ marginTop: 14 }}>{error}</div>}
            {ok && <div className="sup-ok" style={{ marginTop: 14 }}>{ok}</div>}

            <div className="us-actions">
              <button type="submit" className="us-btn us-primary" disabled={saving}>
                {saving ? "Saving..." : "Record Delivery"}
              </button>
            </div>
          </section>
        </form>

        {/* Delivery history */}
        <section className="us-card">
          <div className="us-card-hd"><span className="us-section">DELIVERY HISTORY</span></div>
          {loading ? (
            <div className="sup-empty">Loading deliveries…</div>
          ) : deliveries.length === 0 ? (
            <div className="sup-empty">
              <div className="sup-empty-title">No deliveries recorded yet</div>
              <div className="sup-empty-sub">Use the form above to log your first delivery from NOC.</div>
            </div>
          ) : (
            <div className="sup-table-wrap">
              <table className="sup-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Invoice No.</th><th>Fuel</th>
                    <th className="num">Quantity</th><th className="num">Rate</th><th className="num">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td>{prettyDate(d.delivery_date)}</td>
                      <td>{d.invoice_no}</td>
                      <td>{d.name}</td>
                      <td className="num">{litres(d.quantity)}</td>
                      <td className="num">{rs2(d.rate)}</td>
                      <td className="num">{rs2(d.total_amount)}</td>
                      <td>
                        {d.status === "received" ? (
                          <span className="sup-pill ok">Received</span>
                        ) : (
                          <span className="sup-pending">
                            <span className="sup-pill pend">Pending</span>
                            <button className="sup-recv-btn" disabled={busyId === d.id} onClick={() => markReceived(d.id)}>
                              {busyId === d.id ? "…" : "Mark received"}
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="us-actions">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="sup-sum">
      <div className="sup-sum-label">{label}</div>
      <div className="sup-sum-value">{value}</div>
    </div>
  )
}

const ICONS = {
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
}
function Contact({ ic, label, value }) {
  return (
    <div className="sup-contact">
      <span className="sup-contact-ic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[ic]}</svg>
      </span>
      <div>
        <div className="sup-contact-label">{label}</div>
        <div className="sup-contact-value">{value}</div>
      </div>
    </div>
  )
}

export default Supplier
