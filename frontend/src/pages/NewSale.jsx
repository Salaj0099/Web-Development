import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { createBill } from "../services/api"
import "./UpdateStock.css"
import "./NewSale.css"

const FUEL_META = [
  { name: "Petrol", key: "petrol", defRate: "150.00", hsCode: "27101210" },
  { name: "Diesel", key: "diesel", defRate: "126.55", hsCode: "27101930" },
  { name: "Kerosene", key: "kerosene", defRate: "110.00", hsCode: "27101910" },
]
const getProducts = () => {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem("fuelRates") || "{}") } catch (_) {}
  return FUEL_META.map((f) => ({
    name: f.name, key: f.key, hsCode: f.hsCode,
    rate: saved[f.key] != null ? String(saved[f.key]) : f.defRate,
  }))
}
const VAT_RATE = 0.13
const fuelKey = (name) => (FUEL_META.find((f) => f.name === name) || {}).key

// ── Amount in words (Nepali/Indian system) ────────────────────────────────────
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
const two = (x) => (x < 20 ? ONES[x] : TENS[Math.floor(x / 10)] + (x % 10 ? " " + ONES[x % 10] : ""))
const three = (x) => {
  const h = Math.floor(x / 100), r = x % 100
  return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : "")
}
const numToWords = (n) => {
  if (n === 0) return "Zero"
  let w = ""
  const crore = Math.floor(n / 10000000); n %= 10000000
  const lakh = Math.floor(n / 100000); n %= 100000
  const thousand = Math.floor(n / 1000); n %= 1000
  if (crore) w += three(crore) + " Crore "
  if (lakh) w += two(lakh) + " Lakh "
  if (thousand) w += two(thousand) + " Thousand "
  if (n) w += three(n)
  return w.trim()
}
const amountInWords = (total) => {
  const rupees = Math.floor(total)
  const paisa = Math.round((total - rupees) * 100)
  let w = numToWords(rupees) + " Rupees"
  if (paisa > 0) w += " and " + numToWords(paisa) + " Paisa"
  return w + " only."
}

const errText = (e, fallback) => (e && e.response && e.response.data && e.response.data.message) || fallback
const localDay = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}

function NewSale() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [view, setView] = useState("form")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [bill, setBill] = useState(null) // the saved bill (from the server)

  const [products] = useState(getProducts)
  const [customer, setCustomer] = useState({
    name: "", pan: "", address: "", payment: "Cash",
    bankName: "", chequeNo: "", chequeDate: localDay(), chequeStatus: "pending",
  })
  const [meta, setMeta] = useState({ vehicle: "", remarks: "" })
  const [items, setItems] = useState(() => {
    const d = products.find((p) => p.name === "Diesel")
    return [{ particular: "Diesel", hsCode: d.hsCode, qty: "", amount: "", rate: d.rate }]
  })
  const [discount, setDiscount] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { navigate("/signin", { replace: true }); return }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) { navigate("/signin", { replace: true }); return }
      setUser(parsed)
    } catch (_) { navigate("/signin", { replace: true }) }
  }, [navigate])

  if (!user) return null

  const lineAmount = (it) => (Number(it.qty) || 0) * (Number(it.rate) || 0)
  const subtotal = items.reduce((s, it) => s + lineAmount(it), 0)
  const disc = Number(discount) || 0
  const netSale = Math.max(subtotal - disc, 0)
  const taxable = netSale / (1 + VAT_RATE)
  const vat = netSale - taxable
  const total = netSale
  const money = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Litres ⇄ amount stay in sync through the rate.
  const setItem = (i, k, v) =>
    setItems(items.map((it, idx) => {
      if (idx !== i) return it
      const next = { ...it, [k]: v }
      const rate = Number(next.rate) || 0
      if (k === "particular") {
        const p = products.find((x) => x.name === v)
        if (p) { next.rate = p.rate; next.hsCode = p.hsCode }
        const r2 = Number(next.rate) || 0
        next.amount = next.qty ? (Number(next.qty) * r2).toFixed(2) : ""
      } else if (k === "qty") {
        next.amount = v && rate ? (Number(v) * rate).toFixed(2) : ""
      } else if (k === "amount") {
        next.qty = v && rate ? (Number(v) / rate).toFixed(2) : ""
      }
      return next
    }))

  const addItem = () => {
    const p = products.find((x) => x.name === "Petrol")
    setItems([...items, { particular: "Petrol", hsCode: p.hsCode, qty: "", amount: "", rate: p.rate }])
  }
  const removeItem = (i) => setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : items)

  const handleCreate = async (e) => {
    e.preventDefault()
    const pay = customer.payment
    if ((pay === "Credit" || pay === "Cheque") && !customer.name.trim()) {
      setError("Customer name is required for credit and cheque sales."); return
    }
    if (subtotal <= 0) { setError("Add at least one item with quantity and rate."); return }
    if (pay === "Cheque" && (!customer.bankName.trim() || !customer.chequeNo.trim() || !customer.chequeDate)) {
      setError("Enter the bank name, cheque number and cheque date."); return
    }
    setError("")
    try {
      setSaving(true)
      const res = await createBill({
        customer: customer.name.trim(),
        pan: customer.pan,
        address: customer.address,
        vehicle: meta.vehicle,
        payment: pay,
        discount: disc,
        remarks: meta.remarks,
        staff: user.name || user.email,
        items: items.map((it) => ({ product: fuelKey(it.particular), qty: Number(it.qty), rate: Number(it.rate) })),
        bank: pay === "Cheque"
          ? { name: customer.bankName.trim(), number: customer.chequeNo.trim(), date: customer.chequeDate, status: customer.chequeStatus }
          : undefined,
      })
      setBill(res.data.bill)
      setView("invoice")
    } catch (err) {
      setError(errText(err, "Couldn't save this bill. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const newSale = () => {
    setBill(null); setError(""); setView("form")
    const d = products.find((p) => p.name === "Diesel")
    setItems([{ particular: "Diesel", hsCode: d.hsCode, qty: "", amount: "", rate: d.rate }])
    setCustomer({ name: "", pan: "", address: "", payment: "Cash", bankName: "", chequeNo: "", chequeDate: localDay(), chequeStatus: "pending" })
    setMeta({ vehicle: "", remarks: "" })
    setDiscount("")
  }

  // ── Invoice / print view ──────────────────────────────────────────────────
  if (view === "invoice" && bill) {
    return (
      <div className="ns-page">
        <div className="ns-bar ns-no-print">
          <button className="us-btn us-back" onClick={() => navigate("/billing")}>Bills</button>
          <div className="ns-bar-right">
            <button className="us-btn us-back" onClick={() => window.print()}>Print / Save PDF</button>
            <button className="us-btn us-primary" onClick={newSale}>New sale</button>
          </div>
        </div>

        <div className="invoice-sheet">
          <div className="inv-head">
            <div className="inv-store">{(user.store_name || "Your Store").toUpperCase()}</div>
            <div className="inv-sub">Kathmandu | Nepal</div>
            <div className="inv-sub">Phone : &nbsp; Fax : &nbsp; Email :</div>
            <div className="inv-vat">VAT NO. : {user.vat_number || "—"}</div>
            <div className="inv-doctitle">Invoice</div>
          </div>

          <div className="inv-meta">
            <div className="inv-meta-col">
              <div><span>Name :</span> {bill.customer || "Cash Customer"}</div>
              <div><span>Address :</span> {bill.address || "NA"}</div>
              <div><span>PAN No :</span> {bill.pan || "—"}</div>
              <div><span>Mode of Payment :</span> {bill.payment}</div>
              {bill.payment === "Cheque" && (
                <>
                  <div><span>Cheque Bank :</span> {bill.bankName}</div>
                  <div><span>Cheque No :</span> {bill.chequeNo}</div>
                  <div><span>Cheque Date :</span> {bill.chequeDate}</div>
                  <div><span>Cheque Status :</span> {bill.chequeStatus === "cleared" ? "Cleared" : "Pending"}</div>
                </>
              )}
            </div>
            <div className="inv-meta-col">
              <div><span>Invoice No :</span> {bill.id}</div>
              <div><span>Invoice Date :</span> {bill.date}</div>
              <div><span>Transaction Date :</span> {bill.date}</div>
              <div><span>Vehicle No :</span> {bill.vehicle || "—"}</div>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>S.N.</th>
                <th style={{ width: "14%" }}>H.S Code</th>
                <th>Particular</th>
                <th style={{ width: "14%" }}>Qty</th>
                <th style={{ width: "14%" }}>Rate</th>
                <th style={{ width: "16%" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.hsCode}</td>
                  <td>{it.particular}</td>
                  <td>{it.qty} Ltr.</td>
                  <td>{it.rate}</td>
                  <td className="num">{money(lineAmount(it))}</td>
                </tr>
              ))}
              <tr className="inv-spacer"><td colSpan="6"></td></tr>
            </tbody>
            <tfoot>
              <tr><td colSpan="5" className="inv-total-label">Total</td><td className="num">{money(subtotal)}</td></tr>
            </tfoot>
          </table>

          <div className="inv-bottom">
            <div className="inv-words">
              <div><span>In Words :</span> {amountInWords(bill.amount)}</div>
              <div className="inv-remarks"><span>Remarks :</span> {bill.remarks || ""}</div>
            </div>
            <div className="inv-totals">
              <div><span>Trade Discount</span><span className="num">{money(bill.discount)}</span></div>
              <div><span>Taxable Amount</span><span className="num">{money(bill.taxable)}</span></div>
              <div><span>VAT 13% (incl.)</span><span className="num">{money(bill.vat)}</span></div>
              <div className="inv-grand"><span>TOTAL :</span><span className="num">{money(bill.amount)}</span></div>
            </div>
          </div>

          <div className="inv-note">Note: This is computer generated invoice. Not Required Signature and Stamp.</div>
          <div className="inv-footrow">
            <div>Printed By: {user.name || "—"}</div>
            <div>Print Date(Time): {new Date().toLocaleString()}</div>
            <div>For: {(user.store_name || "Your Store").toUpperCase()}</div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  const pay = customer.payment
  return (
    <div className="us-page">
      <div className="us-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21V3z" /><path d="M9 8h6M9 12h5" />
              </svg>
            </span>
            <h1 className="us-title">New Sale</h1>
          </div>
          <p className="us-sub">Create a VAT bill — cash, credit or cheque.</p>
        </div>

        <form onSubmit={handleCreate}>
          <section className="us-card">
            <div className="us-card-hd"><span className="us-section">CUSTOMER DETAILS</span></div>
            <div className="us-grid">
              <div className="us-field">
                <label>Customer Name {(pay === "Credit" || pay === "Cheque") && <span className="req">*</span>}</label>
                <input type="text" placeholder="Optional for cash" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </div>
              <div className="us-field">
                <label>PAN No.</label>
                <input type="text" inputMode="numeric" placeholder="Enter PAN number" value={customer.pan}
                  onChange={(e) => setCustomer({ ...customer, pan: e.target.value.replace(/\D/g, "") })} />
              </div>
              <div className="us-field">
                <label>Vehicle No.</label>
                <input type="text" placeholder="e.g. BA 1 KHA 1573" value={meta.vehicle}
                  onChange={(e) => setMeta({ ...meta, vehicle: e.target.value })} />
              </div>
              <div className="us-field">
                <label>Mode of Payment <span className="req">*</span></label>
                <select value={pay} onChange={(e) => setCustomer({ ...customer, payment: e.target.value })}>
                  <option>Cash</option>
                  <option>Credit</option>
                  <option>Cheque</option>
                  <option>QR Payment</option>
                </select>
              </div>
              {pay === "Cheque" && (
                <>
                  <div className="us-field">
                    <label>Bank Name <span className="req">*</span></label>
                    <input type="text" placeholder="Enter bank name" value={customer.bankName}
                      onChange={(e) => setCustomer({ ...customer, bankName: e.target.value })} />
                  </div>
                  <div className="us-field">
                    <label>Cheque Number <span className="req">*</span></label>
                    <input type="text" placeholder="Enter cheque number" value={customer.chequeNo}
                      onChange={(e) => setCustomer({ ...customer, chequeNo: e.target.value })} />
                  </div>
                  <div className="us-field">
                    <label>Cheque Date <span className="req">*</span></label>
                    <input type="date" value={customer.chequeDate}
                      onChange={(e) => setCustomer({ ...customer, chequeDate: e.target.value })} />
                  </div>
                  <div className="us-field">
                    <label>Cheque Status <span className="req">*</span></label>
                    <select value={customer.chequeStatus} onChange={(e) => setCustomer({ ...customer, chequeStatus: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="cleared">Cleared</option>
                    </select>
                  </div>
                </>
              )}
              <div className="us-field sup-field-wide" style={{ gridColumn: "1 / -1" }}>
                <label>Bill Remarks</label>
                <input type="text" placeholder="Optional note for this bill" value={meta.remarks}
                  onChange={(e) => setMeta({ ...meta, remarks: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="us-card">
            <div className="us-card-hd">
              <span className="us-section">ITEMS</span>
              <span className="us-link" onClick={addItem}>+ Add item</span>
            </div>

            <div className="ns-items">
              <div className="ns-item-head">
                <span>Particular</span><span>H.S Code</span><span>Qty (Ltr.)</span><span>Rate</span><span>Amount (Rs.)</span><span></span>
              </div>
              {items.map((it, i) => (
                <div className="ns-item-row" key={i}>
                  <select value={it.particular} onChange={(e) => setItem(i, "particular", e.target.value)}>
                    {products.map((p) => <option key={p.name}>{p.name}</option>)}
                  </select>
                  <span className="ns-hs">{it.hsCode}</span>
                  <input type="number" min="0" placeholder="0" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
                  <span className="ns-hs">{it.rate}</span>
                  <input type="number" min="0" placeholder="0.00" value={it.amount} onChange={(e) => setItem(i, "amount", e.target.value)} />
                  <button type="button" className="ns-remove" onClick={() => removeItem(i)} title="Remove" disabled={items.length === 1}>×</button>
                </div>
              ))}
            </div>

            <div className="ns-summary">
              <div className="ns-disc">
                <label>Trade Discount</label>
                <input type="number" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div className="ns-totals">
                <div><span>Taxable Amount</span><span className="num">{money(taxable)}</span></div>
                <div><span>VAT 13% (incl.)</span><span className="num">{money(vat)}</span></div>
                <div className="ns-grand"><span>Total Payable</span><span className="num">Rs. {money(total)}</span></div>
              </div>
            </div>
          </section>

          {error && <div className="us-error">{error}</div>}

          <div className="us-actions">
            <button type="button" className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back</button>
            <button type="submit" className="us-btn us-primary" disabled={saving}>{saving ? "Saving…" : "Create Bill"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewSale
