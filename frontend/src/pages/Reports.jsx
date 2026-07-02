import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getStocks, getAllBills } from "../services/api"
import { computeReport, presetRange, FUELS } from "../utils/reportData"
import "./UpdateStock.css"
import "./Reports.css"

const rs = (n) => "Rs. " + Math.round(Number(n) || 0).toLocaleString("en-IN")
const rs2 = (n) => "Rs. " + (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const litres = (n) => (Number(n) || 0).toLocaleString("en-IN") + " L"

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom" },
]

function Reports() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bills, setBills] = useState([])
  const [stocks, setStocks] = useState([])
  const [rates, setRates] = useState({})
  const [preset, setPreset] = useState("month")
  const [custom, setCustom] = useState({ from: "", to: "" })

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { navigate("/signin", { replace: true }); return }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) { navigate("/signin", { replace: true }); return }
      setUser(parsed)
    } catch (_) { navigate("/signin", { replace: true }) }
  }, [navigate])

  useEffect(() => {
    getAllBills().then((res) => setBills(res.data.bills || [])).catch(() => {})
    try { setRates(JSON.parse(localStorage.getItem("fuelRates") || "{}")) } catch (_) {}
    getStocks()
      .then((res) => {
        const rows = res.data && res.data.stock
        if (Array.isArray(rows)) {
          setStocks(rows.map((s) => ({
            product: s.product, name: s.name,
            current: Number(s.current_litres),
            capacity: Number(s.capacity_litres),
            threshold: Number(s.threshold_litres),
          })))
        }
      })
      .catch(() => {})
  }, [])

  const range = useMemo(() => presetRange(preset, custom.from, custom.to), [preset, custom])
  const report = useMemo(() => computeReport(bills, stocks, rates, range), [bills, stocks, rates, range])

  if (!user) return null

  const periodLabel = range.from === range.to ? range.from : `${range.from} → ${range.to}`

  const exportCSV = () => downloadCSV(report, range, user)

  return (
    <div className="us-page">
      <div className="rp-wrap">
        <div className="us-head rp-head">
          <div>
            <div className="us-title-row">
              <span className="us-title-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" /><path d="M7 14l3-3 3 2 4-5" />
                </svg>
              </span>
              <h1 className="us-title">Reports</h1>
            </div>
            <p className="us-sub">Business performance for {range.label.toLowerCase()} · {periodLabel}</p>
          </div>
          <div className="rp-exports ns-no-print">
            <button className="rp-exp" onClick={() => window.print()} title="Export to PDF">{icPdf} PDF</button>
            <button className="rp-exp" onClick={exportCSV} title="Export to Excel">{icXls} Excel</button>
            <button className="rp-exp" onClick={() => window.print()} title="Print report">{icPrint} Print</button>
          </div>
        </div>

        {/* Date range filter */}
        <div className="rp-filter ns-no-print">
          <div className="rp-presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`rp-chip ${preset === p.id ? "active" : ""}`}
                onClick={() => setPreset(p.id)}
              >{p.label}</button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="rp-custom">
              <label>From <input type="date" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} /></label>
              <label>To <input type="date" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} /></label>
            </div>
          )}
        </div>

        {report.isEmpty ? (
          <EmptyState label={range.label} />
        ) : (
          <div className="rp-print">
            <SalesSection sales={report.sales} vat={report.vat} />
            <div className="rp-grid-2">
              <ChartCard title="Sales trend" sub="Daily totals across the period">
                <TrendChart data={report.charts.trend} />
              </ChartCard>
              <ChartCard title="Payment methods" sub="Share of sales by how customers paid">
                <PaymentDonut data={report.charts.paymentDist} total={report.sales.total} />
              </ChartCard>
            </div>

            <FuelSection fuel={report.fuel} />

            <div className="rp-grid-2">
              <CreditSection credit={report.credit} progress={report.charts.creditProgress} />
              <ChequeSection cheque={report.cheque} />
            </div>

            <StockSection stock={report.stock} />
            <DailySummary daily={report.daily} />
          </div>
        )}

        <div className="us-actions ns-no-print">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </div>
    </div>
  )
}

/* ── Sales ───────────────────────────────────────────────────────────────── */
function SalesSection({ sales, vat }) {
  const cards = [
    { label: "Total sales", value: rs(sales.total) },
    { label: "Bills issued", value: String(sales.count) },
    { label: "Litres sold", value: litres(sales.litres) },
    { label: "Average bill", value: rs(sales.avg) },
    { label: "VAT collected", value: rs(vat), hint: "13% included in sales" },
  ]
  return (
    <section className="rp-section">
      <div className="rp-section-hd"><span className="us-section">SALES REPORT</span></div>
      <div className="rp-stats">
        {cards.map((c) => (
          <div className="rp-stat" key={c.label}>
            <div className="rp-stat-label">{c.label}</div>
            <div className="rp-stat-value">{c.value}</div>
            {c.hint && <div className="rp-stat-hint">{c.hint}</div>}
          </div>
        ))}
      </div>
      <div className="rp-paybar">
        {sales.byPayment.map((p) => (
          <div className="rp-paychip" key={p.name}>
            <span className="rp-dot" style={{ background: p.color }} />
            <span className="rp-pay-name">{p.name}</span>
            <span className="rp-pay-amt">{rs(p.amount)}</span>
            <span className="rp-pay-count">{p.count} bill{p.count === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Fuel ────────────────────────────────────────────────────────────────── */
function FuelSection({ fuel }) {
  const maxL = Math.max(...fuel.map((f) => f.litres), 1)
  const columns = [
    { key: "name", label: "Fuel", render: (r) => (
      <span className="rp-fuel-name"><span className="rp-dot" style={{ background: r.color }} />{r.name}</span>
    ) },
    { key: "litres", label: "Litres sold", align: "right", render: (r) => litres(r.litres) },
    { key: "amount", label: "Sales amount", align: "right", render: (r) => rs2(r.amount) },
    { key: "remaining", label: "Remaining stock", align: "right",
      sortVal: (r) => (r.remaining == null ? -1 : r.remaining),
      render: (r) => (r.remaining == null ? "—" : litres(r.remaining)) },
  ]
  return (
    <section className="rp-section">
      <div className="rp-section-hd"><span className="us-section">FUEL SALES REPORT</span></div>
      <div className="rp-grid-2 rp-grid-tight">
        <DataTable columns={columns} rows={fuel} initial={{ key: "litres", dir: "desc" }} />
        <div className="rp-fuelbars">
          <div className="rp-mini-title">Litres sold by fuel</div>
          {fuel.map((f) => (
            <div className="rp-fuelbar" key={f.key}>
              <div className="rp-fuelbar-top">
                <span>{f.name}</span><span>{litres(f.litres)}</span>
              </div>
              <div className="rp-fuelbar-track">
                <div className="rp-fuelbar-fill" style={{ width: `${Math.round((f.litres / maxL) * 100)}%`, background: f.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Credit ──────────────────────────────────────────────────────────────── */
function CreditSection({ credit, progress }) {
  return (
    <section className="rp-section rp-card-section">
      <div className="rp-section-hd"><span className="us-section">CREDIT REPORT</span></div>
      <div className="rp-rows">
        <Row k="Outstanding credit" v={rs(credit.outstanding)} strong />
        <Row k="Collected this period" v={rs(credit.collected)} note={`${credit.collectedCount} payment${credit.collectedCount === 1 ? "" : "s"}`} good />
        <Row k="Cleared credit" v={rs(credit.cleared)} />
        <Row k="Pending credit" v={rs(credit.pending)} note={`${credit.pendingCount} unpaid`} />
        <Row k="Overdue (30+ days)" v={rs(credit.overdue)} note={credit.overdueCount ? `${credit.overdueCount} bill${credit.overdueCount === 1 ? "" : "s"}` : ""} bad={credit.overdue > 0} />
      </div>
      <div className="rp-progress">
        <div className="rp-progress-top">
          <span className="rp-mini-title">Collection progress</span>
          <span>{progress.pct}%</span>
        </div>
        <div className="rp-progress-track">
          <div className="rp-progress-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="rp-progress-legend">
          <span>Collected {rs(progress.collected)}</span>
          <span>Outstanding {rs(progress.outstanding)}</span>
        </div>
      </div>
    </section>
  )
}

/* ── Cheque ──────────────────────────────────────────────────────────────── */
function ChequeSection({ cheque }) {
  if (cheque.totalCount === 0) {
    return (
      <section className="rp-section rp-card-section">
        <div className="rp-section-hd"><span className="us-section">CHEQUE REPORT</span></div>
        <div className="rp-empty-inline">No cheque payments in this period.</div>
      </section>
    )
  }
  return (
    <section className="rp-section rp-card-section">
      <div className="rp-section-hd"><span className="us-section">CHEQUE REPORT</span></div>
      <div className="rp-rows">
        <Row k="Total cheque payments" v={rs(cheque.total)} note={`${cheque.totalCount} cheque${cheque.totalCount === 1 ? "" : "s"}`} strong />
        <Row k="Cleared" v={rs(cheque.cleared)} note={`${cheque.clearedCount}`} good />
        <Row k="Pending" v={rs(cheque.pending)} note={`${cheque.pendingCount}`} />
        <Row k="Bounced" v={rs(cheque.bounced)} note={cheque.bouncedCount ? `${cheque.bouncedCount}` : "none"} bad={cheque.bounced > 0} />
      </div>
    </section>
  )
}

/* ── Stock ───────────────────────────────────────────────────────────────── */
function StockSection({ stock }) {
  const columns = [
    { key: "name", label: "Fuel", render: (r) => r.name },
    { key: "sold", label: "Sold (period)", align: "right", render: (r) => litres(r.sold) },
    { key: "current", label: "Current stock", align: "right",
      sortVal: (r) => (r.current == null ? -1 : r.current),
      render: (r) => (r.current == null ? "—" : litres(r.current)) },
    { key: "capacity", label: "Capacity", align: "right",
      sortVal: (r) => (r.capacity == null ? -1 : r.capacity),
      render: (r) => (r.capacity == null ? "—" : litres(r.capacity)) },
    { key: "low", label: "Status", render: (r) => (
      r.current == null ? "—"
        : r.low ? <span className="rp-pill bad">Low — reorder</span>
        : <span className="rp-pill ok">Healthy</span>
    ) },
  ]
  return (
    <section className="rp-section">
      <div className="rp-section-hd">
        <span className="us-section">STOCK REPORT</span>
        <span className="rp-note-inline">Opening stock &amp; deliveries aren't tracked per period yet</span>
      </div>
      <DataTable columns={columns} rows={stock} initial={{ key: "sold", dir: "desc" }} />
    </section>
  )
}

/* ── Daily summary ───────────────────────────────────────────────────────── */
function DailySummary({ daily }) {
  return (
    <section className="rp-section rp-card-section">
      <div className="rp-section-hd"><span className="us-section">DAILY SUMMARY</span></div>
      <div className="rp-rows">
        <Row k="Cash & QR received" v={rs(daily.income)} good />
        <Row k="Credit collected" v={rs(daily.collections)} />
        <Row k="Credit given out" v={rs(daily.creditGiven)} />
        <Row k="VAT collected" v={rs(daily.vat)} />
        <Row k="Other expenses" v="Not tracked" muted />
        <Row k="Opening / closing balance" v="Not tracked" muted />
      </div>
    </section>
  )
}

/* ── Small shared bits ───────────────────────────────────────────────────── */
function Row({ k, v, note, strong, good, bad, muted }) {
  return (
    <div className="rp-row">
      <span className="rp-row-k">{k}</span>
      <span className="rp-row-right">
        {note && <span className="rp-row-note">{note}</span>}
        <span className={`rp-row-v${strong ? " strong" : ""}${good ? " good" : ""}${bad ? " bad" : ""}${muted ? " muted" : ""}`}>{v}</span>
      </span>
    </div>
  )
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="rp-section">
      <div className="rp-section-hd">
        <span className="us-section">{title.toUpperCase()}</span>
        {sub && <span className="rp-note-inline">{sub}</span>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="rp-section rp-empty">
      <div className="rp-empty-ic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 14l3-3 3 2 4-5" />
        </svg>
      </div>
      <div className="rp-empty-title">No data for {label.toLowerCase()}</div>
      <div className="rp-empty-sub">Once bills are recorded in this period, your reports will appear here.</div>
    </div>
  )
}

/* ── Sortable table ──────────────────────────────────────────────────────── */
function DataTable({ columns, rows, initial }) {
  const [sort, setSort] = useState(initial || { key: columns[0].key, dir: "asc" })
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return rows
    const val = (r) => (col.sortVal ? col.sortVal(r) : r[sort.key])
    return [...rows].sort((a, b) => {
      const av = val(a), bv = val(b)
      let cmp
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sort.dir === "asc" ? cmp : -cmp
    })
  }, [rows, sort, columns])

  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))

  return (
    <div className="rp-table-wrap">
      <table className="rp-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.align === "right" ? "num" : ""} onClick={() => toggle(c.key)}>
                <span className="rp-th">{c.label}
                  <span className={`rp-arrow ${sort.key === c.key ? "on" : ""}`}>
                    {sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.key || i}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === "right" ? "num" : ""}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Charts (SVG) ────────────────────────────────────────────────────────── */
function TrendChart({ data }) {
  const max = Math.max(...data.map((d) => d.amount), 1)
  const show = data.length > 1
  const label = (day) => (data.length > 14 ? day.slice(8) : day.slice(5)) // DD or MM-DD
  if (!show) {
    return <div className="rp-single">{rs(data[0]?.amount || 0)} on {data[0]?.day}</div>
  }
  return (
    <div className="rp-bars">
      {data.map((d) => (
        <div className="rp-bar-col" key={d.day} title={`${d.day} · ${rs(d.amount)}`}>
          <div className="rp-bar-wrap">
            <div className={`rp-bar ${d.amount === 0 ? "nil" : ""}`} style={{ height: `${d.amount === 0 ? 3 : Math.round((d.amount / max) * 100)}%` }} />
          </div>
          <div className="rp-bar-day">{label(d.day)}</div>
        </div>
      ))}
    </div>
  )
}

function PaymentDonut({ data, total }) {
  if (!data.length) return <div className="rp-empty-inline">No sales to break down.</div>
  const r = 52, c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="rp-donut-wrap">
      <svg viewBox="0 0 140 140" className="rp-donut">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef0f3" strokeWidth="16" />
        {data.map((p) => {
          const len = (p.amount / total) * c
          const seg = (
            <circle key={p.name} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
          )
          offset += len
          return seg
        })}
        <text x="70" y="66" textAnchor="middle" className="rp-donut-num">{rs(total)}</text>
        <text x="70" y="84" textAnchor="middle" className="rp-donut-cap">total sales</text>
      </svg>
      <div className="rp-donut-legend">
        {data.map((p) => (
          <div className="rp-legend-row" key={p.name}>
            <span className="rp-dot" style={{ background: p.color }} />
            <span className="rp-legend-name">{p.name}</span>
            <span className="rp-legend-pct">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── CSV export ──────────────────────────────────────────────────────────── */
function downloadCSV(report, range, user) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  const lines = []
  const push = (...cells) => lines.push(cells.map(esc).join(","))
  push((user.store_name || "OilDesk") + " — Report")
  push("Period", range.label, `${range.from} to ${range.to}`)
  push("")
  push("SALES REPORT")
  push("Total sales", report.sales.total)
  push("Bills issued", report.sales.count)
  push("Litres sold", report.sales.litres)
  push("Average bill", Math.round(report.sales.avg))
  push("VAT collected", report.vat)
  push("")
  push("PAYMENT BREAKDOWN", "Amount", "Bills")
  report.sales.byPayment.forEach((p) => push(p.name, p.amount, p.count))
  push("")
  push("FUEL SALES", "Litres", "Amount", "Remaining")
  report.fuel.forEach((f) => push(f.name, f.litres, f.amount, f.remaining == null ? "" : f.remaining))
  push("")
  push("CREDIT REPORT")
  push("Outstanding", report.credit.outstanding)
  push("Collected", report.credit.collected)
  push("Cleared", report.credit.cleared)
  push("Pending", report.credit.pending)
  push("Overdue", report.credit.overdue)
  push("")
  push("CHEQUE REPORT")
  push("Total", report.cheque.total)
  push("Cleared", report.cheque.cleared)
  push("Pending", report.cheque.pending)
  push("Bounced", report.cheque.bounced)
  push("")
  push("STOCK REPORT", "Sold", "Current", "Capacity")
  report.stock.forEach((s) => push(s.name, s.sold, s.current == null ? "" : s.current, s.capacity == null ? "" : s.capacity))

  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `oildesk-report-${range.from}_to_${range.to}.csv`
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

const icPdf = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
  </svg>
)
const icXls = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8l8 8M16 8l-8 8" />
  </svg>
)
const icPrint = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
  </svg>
)

export default Reports
