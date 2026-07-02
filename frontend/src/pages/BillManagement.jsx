import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBills, cancelBill } from "../services/api"
import "./UpdateStock.css"
import "./NewSale.css"
import "./BillManagement.css"

const rs = (n) => "Rs. " + Math.round(Number(n) || 0).toLocaleString("en-IN")
const money = (n) => (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const litres = (n) => (Number(n) || 0).toLocaleString("en-IN") + " L"
const errText = (e, fallback) => (e && e.response && e.response.data && e.response.data.message) || fallback
const localDay = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}
const billDay = (b) => (b.createdAt ? localDay(b.createdAt) : b.date)
const STATUS = { paid: "Paid", credit: "Outstanding", cancelled: "Cancelled" }

function BillManagement() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ search: "", date: "", fuel: "all", payment: "all" })
  const [detail, setDetail] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [printing, setPrinting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState("")

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
    getAllBills({ includeCancelled: 1 })
      .then((res) => setBills(res.data.bills || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const today = localDay(new Date())
  const todays = useMemo(() => bills.filter((b) => b.status !== "cancelled" && billDay(b) === today), [bills, today])
  const sum = (arr, f) => arr.reduce((s, b) => s + (Number(f(b)) || 0), 0)
  const summary = [
    { label: "Today's sales", value: rs(sum(todays, (b) => b.amount)) },
    { label: "Bills issued", value: String(todays.length) },
    { label: "Cash collected", value: rs(sum(todays.filter((b) => b.payment === "Cash" || b.payment === "QR Payment"), (b) => b.amount)) },
    { label: "Credit sales", value: rs(sum(todays.filter((b) => b.payment === "Credit"), (b) => b.amount)) },
    { label: "Cheque payments", value: rs(sum(todays.filter((b) => b.payment === "Cheque"), (b) => b.amount)) },
    { label: "Litres sold", value: litres(sum(todays, (b) => b.litres)) },
  ]

  const rows = useMemo(() => {
    const q = filter.search.trim().toLowerCase()
    return bills.filter((b) => {
      if (q && !(`${b.id} ${b.customer || ""}`.toLowerCase().includes(q))) return false
      if (filter.date && billDay(b) !== filter.date) return false
      if (filter.fuel !== "all" && !(b.lines || []).some((l) => l.key === filter.fuel)) return false
      if (filter.payment !== "all" && b.payment !== filter.payment) return false
      return true
    })
  }, [bills, filter])

  if (!user) return null

  const doCancel = async () => {
    try {
      setBusy(true)
      await cancelBill(confirm.dbId, { staff: user.name || user.email })
      setNote(`Bill ${confirm.id} cancelled and stock returned.`)
      setConfirm(null); setDetail(null); load()
    } catch (err) {
      setNote(errText(err, "Couldn't cancel this bill."))
      setConfirm(null)
    } finally { setBusy(false) }
  }

  // ── Printable invoice ───────────────────────────────────────────────────────
  if (printing) {
    const b = printing
    return (
      <div className="ns-page">
        <div className="ns-bar ns-no-print">
          <button className="us-btn us-back" onClick={() => setPrinting(null)}>← Back</button>
          <button className="us-btn us-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
        <div className="invoice-sheet">
          <div className="inv-head">
            <div className="inv-store">{(user.store_name || "Your Store").toUpperCase()}</div>
            <div className="inv-sub">Kathmandu | Nepal</div>
            <div className="inv-vat">VAT NO. : {user.vat_number || "—"}</div>
            <div className="inv-doctitle">Invoice</div>
          </div>
          <div className="inv-meta">
            <div className="inv-meta-col">
              <div><span>Name :</span> {b.customer || "Cash Customer"}</div>
              <div><span>PAN No :</span> {b.pan || "—"}</div>
              <div><span>Mode of Payment :</span> {b.payment}</div>
            </div>
            <div className="inv-meta-col">
              <div><span>Invoice No :</span> {b.id}</div>
              <div><span>Invoice Date :</span> {b.date}</div>
              <div><span>Vehicle No :</span> {b.vehicle || "—"}</div>
            </div>
          </div>
          <table className="inv-table">
            <thead><tr><th style={{ width: "8%" }}>S.N.</th><th>Particular</th><th style={{ width: "16%" }}>Qty</th><th style={{ width: "16%" }}>Rate</th><th style={{ width: "18%" }}>Amount</th></tr></thead>
            <tbody>
              {(b.lines || []).map((l, i) => (
                <tr key={i}><td>{i + 1}</td><td>{l.fuel}</td><td>{l.qty} Ltr.</td><td>{money(l.rate)}</td><td className="num">{money(l.amount)}</td></tr>
              ))}
              <tr className="inv-spacer"><td colSpan="5"></td></tr>
            </tbody>
          </table>
          <div className="inv-bottom">
            <div className="inv-words"><div><span>Remarks :</span> {b.remarks || ""}</div></div>
            <div className="inv-totals">
              <div><span>Taxable Amount</span><span className="num">{money(b.taxable)}</span></div>
              <div><span>VAT 13% (incl.)</span><span className="num">{money(b.vat)}</span></div>
              <div className="inv-grand"><span>TOTAL :</span><span className="num">{money(b.amount)}</span></div>
            </div>
          </div>
          <div className="inv-note">Note: This is computer generated invoice. Not Required Signature and Stamp.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="us-page">
      <div className="bm-wrap">
        <div className="us-head bm-head">
          <div>
            <div className="us-title-row">
              <span className="us-title-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21V3z" /><path d="M9 8h6M9 12h5" />
                </svg>
              </span>
              <h1 className="us-title">Sales &amp; Billing</h1>
            </div>
            <p className="us-sub">Review, search and manage fuel sales.</p>
          </div>
          <button className="us-btn us-primary" onClick={() => navigate("/billing/new")}>+ New Sale</button>
        </div>

        {note && <div className="bm-note">{note}</div>}

        <div className="bm-summary">
          {summary.map((c) => (
            <div className="bm-sum" key={c.label}>
              <div className="bm-sum-label">{c.label}</div>
              <div className="bm-sum-value">{c.value}</div>
            </div>
          ))}
        </div>

        <section className="us-card">
          <div className="bm-filters">
            <input className="bm-search" placeholder="Search bill no. or customer…" value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
            <input type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
            <select value={filter.fuel} onChange={(e) => setFilter({ ...filter, fuel: e.target.value })}>
              <option value="all">All fuels</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="kerosene">Kerosene</option>
            </select>
            <select value={filter.payment} onChange={(e) => setFilter({ ...filter, payment: e.target.value })}>
              <option value="all">All payments</option>
              <option>Cash</option><option>Credit</option><option>Cheque</option><option>QR Payment</option>
            </select>
          </div>

          {loading ? (
            <div className="bm-empty">Loading bills…</div>
          ) : rows.length === 0 ? (
            <div className="bm-empty">
              <div className="bm-empty-title">No bills found</div>
              <div className="bm-empty-sub">{bills.length ? "Try clearing the filters." : "Create your first sale to get started."}</div>
            </div>
          ) : (
            <div className="bm-table-wrap">
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Bill No.</th><th>Date</th><th>Customer</th><th>Fuel</th>
                    <th className="num">Litres</th><th className="num">Amount</th><th>Payment</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.dbId} className={b.status === "cancelled" ? "bm-cancelled" : ""}>
                      <td className="bm-mono">{b.id}</td>
                      <td>{b.date}<span className="bm-time"> {b.time}</span></td>
                      <td>{b.customer || "Cash customer"}</td>
                      <td>{(b.lines || []).map((l) => l.fuel).join(", ") || "—"}</td>
                      <td className="num">{litres(b.litres)}</td>
                      <td className="num">{money(b.amount)}</td>
                      <td>{b.payment}</td>
                      <td><span className={`bm-status ${b.status}`}>{STATUS[b.status] || b.status}</span></td>
                      <td className="bm-actions">
                        <button className="bm-link" onClick={() => setDetail(b)}>View</button>
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

      {/* Bill detail */}
      {detail && (
        <div className="bm-ov" onClick={() => setDetail(null)}>
          <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bm-modal-hd">
              <div>
                <div className="bm-modal-no">{detail.id}</div>
                <div className="bm-modal-sub">{detail.date} · {detail.time}</div>
              </div>
              <span className={`bm-status ${detail.status}`}>{STATUS[detail.status] || detail.status}</span>
            </div>

            <div className="bm-modal-rows">
              <div><span>Customer</span><span>{detail.customer || "Cash customer"}</span></div>
              {detail.pan && <div><span>PAN</span><span>{detail.pan}</span></div>}
              {detail.vehicle && <div><span>Vehicle</span><span>{detail.vehicle}</span></div>}
              <div><span>Payment</span><span>{detail.payment}</span></div>
              {detail.payment === "Cheque" && (
                <>
                  <div><span>Bank</span><span>{detail.bankName || "—"}</span></div>
                  <div><span>Cheque</span><span>{detail.chequeNo || "—"} · {detail.chequeStatus === "cleared" ? "Cleared" : "Pending"}</span></div>
                </>
              )}
              {detail.remarks && <div><span>Remarks</span><span>{detail.remarks}</span></div>}
            </div>

            <table className="bm-items">
              <thead><tr><th>Fuel</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {(detail.lines || []).map((l, i) => (
                  <tr key={i}><td>{l.fuel}</td><td className="num">{litres(l.qty)}</td><td className="num">{money(l.rate)}</td><td className="num">{money(l.amount)}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan="3">Taxable</td><td className="num">{money(detail.taxable)}</td></tr>
                <tr><td colSpan="3">VAT 13% (incl.)</td><td className="num">{money(detail.vat)}</td></tr>
                <tr className="bm-grand"><td colSpan="3">Total</td><td className="num">{rs(detail.amount)}</td></tr>
              </tfoot>
            </table>

            <div className="bm-modal-actions">
              {detail.status !== "cancelled" && (
                <button className="bm-cancel-btn" onClick={() => setConfirm(detail)}>Cancel bill</button>
              )}
              <div className="bm-modal-right">
                <button className="us-btn us-back" onClick={() => setDetail(null)}>Close</button>
                <button className="us-btn us-primary" onClick={() => { setPrinting(detail); setDetail(null) }}>Print invoice</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {confirm && (
        <div className="bm-ov" onClick={() => setConfirm(null)}>
          <div className="bm-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="bm-confirm-title">Cancel this bill?</h3>
            <p className="bm-confirm-sub">
              Bill <strong>{confirm.id}</strong> for <strong>{rs(confirm.amount)}</strong> will be cancelled and its
              {" "}{litres(confirm.litres)} of fuel returned to stock. This can't be undone.
            </p>
            <div className="bm-confirm-actions">
              <button className="us-btn us-back" onClick={() => setConfirm(null)} disabled={busy}>Keep bill</button>
              <button className="bm-cancel-btn" onClick={doCancel} disabled={busy}>{busy ? "Cancelling…" : "Cancel bill"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillManagement
