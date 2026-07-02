import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getStocks, getStockMovements, adjustStock } from "../services/api"
import "./UpdateStock.css"
import "./StockManagement.css"

const FUEL_ORDER = ["petrol", "diesel", "kerosene"]
const litres = (n) => (Number(n) || 0).toLocaleString("en-IN") + " L"
const litresPlain = (n) => (Number(n) || 0).toLocaleString("en-IN")
const errText = (e, fallback) => (e && e.response && e.response.data && e.response.data.message) || fallback

const localDay = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}
const isToday = (d) => localDay(d) === localDay(new Date())
const dateTime = (d) => new Date(d).toLocaleString("en-GB", {
  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
})

const TYPE_LABEL = { delivery: "Delivery", sale: "Sale", adjustment: "Adjustment" }
const REASONS = [
  "Physical stock count correction",
  "Evaporation / handling loss",
  "Spillage or leak",
  "Data entry error",
  "Tank calibration",
  "Other",
]

function StockManagement() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stocks, setStocks] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

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
    getStocks()
      .then((res) => {
        const rows = res.data && res.data.stock
        if (Array.isArray(rows)) {
          const map = {}
          rows.forEach((s) => { map[s.product] = {
            product: s.product, name: s.name, tank: s.tank,
            current: Number(s.current_litres), capacity: Number(s.capacity_litres), threshold: Number(s.threshold_litres),
          } })
          setStocks(FUEL_ORDER.map((k) => map[k]).filter(Boolean))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    getStockMovements({ limit: 200 })
      .then((res) => setMovements(res.data.movements || []))
      .catch(() => {})
  }
  useEffect(() => {
    load()
    window.addEventListener("focus", load)
    const poll = setInterval(load, 15000)
    return () => { window.removeEventListener("focus", load); clearInterval(poll) }
  }, [])

  if (!user) return null

  return (
    <div className="us-page">
      <div className="sm-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" />
              </svg>
            </span>
            <h1 className="us-title">Stock Management</h1>
          </div>
          <p className="us-sub">Live tank levels, movement history, and adjustments.</p>
        </div>

        <Alerts stocks={stocks} />
        <QuickSummary stocks={stocks} movements={movements} />
        <Overview stocks={stocks} loading={loading} />
        <MovementSummary stocks={stocks} movements={movements} />
        <AdjustForm
          stocks={stocks} user={user}
          onDone={(msg) => { setOk(msg); setError(""); load() }}
          onError={(msg) => { setError(msg); setOk("") }}
          banner={{ error, ok }}
        />
        <History movements={movements} loading={loading} />

        <div className="us-actions">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </div>
    </div>
  )
}

/* ── Alerts ──────────────────────────────────────────────────────────────── */
function Alerts({ stocks }) {
  const low = stocks.filter((s) => s.current <= s.threshold)
  const full = stocks.filter((s) => s.capacity && s.current >= s.capacity * 0.95)
  if (!low.length && !full.length) return null
  return (
    <div className="sm-alerts">
      {low.map((s) => (
        <div className="sm-alert low" key={"l" + s.product}>
          <span className="sm-alert-dot" /> {s.name} is low — {litres(s.current)} left (reorder point {litres(s.threshold)}).
        </div>
      ))}
      {full.map((s) => (
        <div className="sm-alert full" key={"f" + s.product}>
          <span className="sm-alert-dot" /> {s.name} tank is near capacity — {litres(s.current)} of {litres(s.capacity)}.
        </div>
      ))}
    </div>
  )
}

/* ── Quick summary ───────────────────────────────────────────────────────── */
function QuickSummary({ stocks, movements }) {
  const totalAvailable = stocks.reduce((s, x) => s + x.current, 0)
  const receivedToday = movements.filter((m) => m.type === "delivery" && isToday(m.created_at))
    .reduce((s, m) => s + Number(m.qty_in), 0)
  const soldToday = movements.filter((m) => m.type === "sale" && isToday(m.created_at))
    .reduce((s, m) => s + Number(m.qty_out), 0)
  const lastDelivery = movements.find((m) => m.type === "delivery")

  const cards = [
    { label: "Total stock available", value: litres(totalAvailable) },
    { label: "Received today", value: litres(receivedToday) },
    { label: "Sold today", value: litres(soldToday) },
    { label: "Latest delivery", value: lastDelivery ? `${lastDelivery.name} · ${litres(lastDelivery.qty_in)}` : "—",
      sub: lastDelivery ? dateTime(lastDelivery.created_at) : "" },
  ]
  return (
    <div className="sm-summary">
      {cards.map((c) => (
        <div className="sm-sum" key={c.label}>
          <div className="sm-sum-label">{c.label}</div>
          <div className="sm-sum-value">{c.value}</div>
          {c.sub && <div className="sm-sum-sub">{c.sub}</div>}
        </div>
      ))}
    </div>
  )
}

/* ── Stock overview ──────────────────────────────────────────────────────── */
function Overview({ stocks, loading }) {
  return (
    <section className="us-card">
      <div className="us-card-hd"><span className="us-section">STOCK OVERVIEW</span></div>
      {loading && !stocks.length ? (
        <div className="sm-muted">Loading tanks…</div>
      ) : (
        <div className="sm-overview">
          {stocks.map((s) => {
            const pct = s.capacity ? Math.round((s.current / s.capacity) * 100) : 0
            const available = Math.max(s.capacity - s.current, 0)
            const low = s.current <= s.threshold
            const color = low ? "#dc2626" : pct >= 60 ? "#16a34a" : "#d97706"
            return (
              <div className="sm-tank" key={s.product}>
                <div className="sm-tank-hd">
                  <span className="sm-tank-name">{s.name} <span className="sm-tank-tag">· {s.tank}</span></span>
                  {low
                    ? <span className="sm-pill bad">Low stock</span>
                    : <span className="sm-pill ok">Healthy</span>}
                </div>
                <div className="sm-tank-big" style={{ color }}>{litres(s.current)}</div>
                <div className="sm-tank-track"><div className="sm-tank-fill" style={{ width: `${pct}%`, background: color }} /></div>
                <div className="sm-tank-rows">
                  <div><span>Tank capacity</span><span>{litres(s.capacity)}</span></div>
                  <div><span>Available capacity</span><span>{litres(available)}</span></div>
                  <div><span>Filled</span><span>{pct}%</span></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ── Movement summary (today) ────────────────────────────────────────────── */
function MovementSummary({ stocks, movements }) {
  const rows = stocks.map((s) => {
    const mine = movements.filter((m) => m.product === s.product && isToday(m.created_at))
    const received = mine.filter((m) => m.type === "delivery").reduce((a, m) => a + Number(m.qty_in), 0)
    const sold = mine.filter((m) => m.type === "sale").reduce((a, m) => a + Number(m.qty_out), 0)
    const adjust = mine.filter((m) => m.type === "adjustment").reduce((a, m) => a + Number(m.qty_in) - Number(m.qty_out), 0)
    const closing = s.current
    const opening = closing - received - adjust + sold
    return { name: s.name, opening, received, sold, adjust, closing }
  })
  return (
    <section className="us-card">
      <div className="us-card-hd">
        <span className="us-section">STOCK MOVEMENT</span>
        <span className="sm-hint">Today</span>
      </div>
      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>Fuel</th>
              <th className="num">Opening</th>
              <th className="num">Received</th>
              <th className="num">Sold</th>
              <th className="num">Adjustments</th>
              <th className="num">Closing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="num">{litresPlain(r.opening)}</td>
                <td className="num pos">{r.received ? "+" + litresPlain(r.received) : "—"}</td>
                <td className="num neg">{r.sold ? "−" + litresPlain(r.sold) : "—"}</td>
                <td className="num">{r.adjust ? (r.adjust > 0 ? "+" : "−") + litresPlain(Math.abs(r.adjust)) : "—"}</td>
                <td className="num strong">{litresPlain(r.closing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ── Manual adjustment ───────────────────────────────────────────────────── */
function AdjustForm({ stocks, user, onDone, onError, banner }) {
  const [form, setForm] = useState({ product: "petrol", direction: "add", quantity: "", reason: REASONS[0], remarks: "" })
  const [confirm, setConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const tank = stocks.find((s) => s.product === form.product)
  const qty = Number(form.quantity) || 0
  const signed = form.direction === "remove" ? -qty : qty
  const projected = tank ? tank.current + signed : null

  const openConfirm = (e) => {
    e.preventDefault()
    if (!qty || qty <= 0) { onError("Enter an adjustment amount greater than zero."); return }
    if (tank && projected < 0) { onError(`You can't remove more than the ${tank.name} in stock (${litres(tank.current)}).`); return }
    if (tank && projected > tank.capacity) { onError(`That would exceed the ${tank.name} tank capacity (${litres(tank.capacity)}).`); return }
    setConfirm(true)
  }

  const doAdjust = async () => {
    try {
      setSaving(true)
      await adjustStock({
        product: form.product,
        quantity: signed,
        reason: form.reason,
        remarks: form.remarks.trim(),
        staff: user.name || user.email,
      })
      setConfirm(false)
      setForm((f) => ({ ...f, quantity: "", remarks: "" }))
      onDone(`${tank.name} stock adjusted to ${litres(projected)}.`)
    } catch (err) {
      setConfirm(false)
      onError(errText(err, "Couldn't save the adjustment. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="us-card">
      <div className="us-card-hd"><span className="us-section">MANUAL STOCK ADJUSTMENT</span></div>
      <form onSubmit={openConfirm}>
        <div className="us-grid">
          <div className="us-field">
            <label>Fuel <span className="req">*</span></label>
            <select value={form.product} onChange={(e) => set("product", e.target.value)}>
              {stocks.map((s) => <option key={s.product} value={s.product}>{s.name}</option>)}
            </select>
          </div>
          <div className="us-field">
            <label>Adjustment <span className="req">*</span></label>
            <div className="sm-dir">
              <button type="button" className={form.direction === "add" ? "active" : ""} onClick={() => set("direction", "add")}>Add</button>
              <button type="button" className={form.direction === "remove" ? "active" : ""} onClick={() => set("direction", "remove")}>Remove</button>
            </div>
          </div>
          <div className="us-field">
            <label>Quantity (Litres) <span className="req">*</span></label>
            <input type="number" min="0" placeholder="e.g. 150" value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)} />
          </div>
          <div className="us-field">
            <label>Reason <span className="req">*</span></label>
            <select value={form.reason} onChange={(e) => set("reason", e.target.value)}>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="us-field sm-field-wide">
            <label>Remarks</label>
            <input type="text" placeholder="Optional — extra detail for the record" value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)} />
          </div>
          <div className="us-field">
            <label>New level (preview)</label>
            <div className="us-readonly">{tank ? litres(projected < 0 ? tank.current : projected) : "—"}</div>
          </div>
        </div>

        {banner.error && <div className="us-error" style={{ marginTop: 14 }}>{banner.error}</div>}
        {banner.ok && <div className="sm-ok" style={{ marginTop: 14 }}>{banner.ok}</div>}

        <div className="us-actions">
          <button type="submit" className="us-btn us-primary">Save Adjustment</button>
        </div>
      </form>

      {confirm && (
        <div className="sm-ov" onClick={() => setConfirm(false)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="sm-modal-title">Confirm adjustment</h3>
            <p className="sm-modal-sub">
              {form.direction === "add" ? "Add" : "Remove"} <strong>{litres(qty)}</strong> {form.direction === "add" ? "to" : "from"} <strong>{tank?.name}</strong>.
            </p>
            <div className="sm-modal-rows">
              <div><span>Current</span><span>{litres(tank?.current)}</span></div>
              <div><span>New level</span><span className="strong">{litres(projected)}</span></div>
              <div><span>Reason</span><span>{form.reason}</span></div>
            </div>
            <div className="sm-modal-actions">
              <button className="us-btn us-back" onClick={() => setConfirm(false)} disabled={saving}>Cancel</button>
              <button className="us-btn us-primary" onClick={doAdjust} disabled={saving}>{saving ? "Saving…" : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ── Stock history ───────────────────────────────────────────────────────── */
function History({ movements, loading }) {
  const [fuel, setFuel] = useState("all")
  const [type, setType] = useState("all")

  const rows = useMemo(() => movements.filter((m) =>
    (fuel === "all" || m.product === fuel) && (type === "all" || m.type === type)
  ), [movements, fuel, type])

  return (
    <section className="us-card">
      <div className="us-card-hd">
        <span className="us-section">STOCK HISTORY</span>
        <div className="sm-filters">
          <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="all">All fuels</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="kerosene">Kerosene</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="delivery">Delivery</option>
            <option value="sale">Sale</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>
      {loading && !movements.length ? (
        <div className="sm-muted">Loading history…</div>
      ) : rows.length === 0 ? (
        <div className="sm-empty">
          <div className="sm-empty-title">No stock movements yet</div>
          <div className="sm-empty-sub">Deliveries, sales, and adjustments will appear here.</div>
        </div>
      ) : (
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Date &amp; time</th><th>Fuel</th><th>Type</th>
                <th className="num">In</th><th className="num">Out</th><th className="num">Remaining</th>
                <th>Reference</th><th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{dateTime(m.created_at)}</td>
                  <td>{m.name}</td>
                  <td><span className={`sm-type ${m.type}`}>{TYPE_LABEL[m.type] || m.type}</span></td>
                  <td className="num pos">{Number(m.qty_in) ? litresPlain(m.qty_in) : "—"}</td>
                  <td className="num neg">{Number(m.qty_out) ? litresPlain(m.qty_out) : "—"}</td>
                  <td className="num strong">{litresPlain(m.balance)}</td>
                  <td className="sm-ref">{m.reference || (m.reason ? m.reason : "—")}</td>
                  <td>{m.staff || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default StockManagement
