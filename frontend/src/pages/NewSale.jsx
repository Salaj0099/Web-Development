import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { updateStock } from "../services/api"
import "./UpdateStock.css"
import "./NewSale.css"

const FUEL_META = [
  { name: "Petrol", key: "petrol", defRate: "150.00", hsCode: "27101210" },
  { name: "Diesel", key: "diesel", defRate: "126.55", hsCode: "27101930" },
  { name: "Kerosene", key: "kerosene", defRate: "110.00", hsCode: "27101910" },
]
// Build the product list using any rates saved on the Rate page.
const getProducts = () => {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem("fuelRates") || "{}") } catch (_) {}
  return FUEL_META.map((f) => ({
    name: f.name,
    hsCode: f.hsCode,
    rate: saved[f.key] != null ? String(saved[f.key]) : f.defRate,
  }))
}
const VAT_RATE = 0.13

// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString).
const localDay = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}

// ── Amount in words (Nepali/Indian system: thousand, lakh, crore) ──────────────
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

function NewSale() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [view, setView] = useState("form")
  const [error, setError] = useState("")
  const [invoiceNo] = useState("EFCSB/" + Date.now().toString().slice(-5))
  const createdAtRef = useRef(null) // fixed creation time for this bill
  const stockDoneRef = useRef(false) // deduct stock only once per bill
  const today = localDay()

  const [products] = useState(getProducts) // current rates (saved on Rate page) read once on open
  const [customer, setCustomer] = useState({ name: "", pan: "", address: "", payment: "Cash", bankName: "", chequeAmount: "" })
  const [meta, setMeta] = useState({ date: today, vehicle: "" })
  const [items, setItems] = useState(() => {
    const d = products.find((p) => p.name === "Diesel")
    return [{ particular: "Diesel", hsCode: d.hsCode, qty: "", rate: d.rate }]
  })
  const [discount, setDiscount] = useState("")

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

  const lineAmount = (it) => (Number(it.qty) || 0) * (Number(it.rate) || 0)
  const subtotal = items.reduce((s, it) => s + lineAmount(it), 0) // gross, VAT already included
  const disc = Number(discount) || 0
  const netSale = Math.max(subtotal - disc, 0)        // VAT-inclusive amount after discount
  const taxable = netSale / (1 + VAT_RATE)            // base, VAT extracted out
  const vat = netSale - taxable                       // 13% VAT included in the price
  const total = netSale                               // total payable = the inclusive amount
  const money = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const setItem = (i, k, v) =>
    setItems(items.map((it, idx) => {
      if (idx !== i) return it
      const next = { ...it, [k]: v }
      if (k === "particular") {
        const p = products.find((x) => x.name === v)
        if (p) { next.rate = p.rate; next.hsCode = p.hsCode }
      }
      return next
    }))
  const addItem = () => {
    const p = products.find((x) => x.name === "Petrol")
    setItems([...items, { particular: "Petrol", hsCode: p.hsCode, qty: "", rate: p.rate }])
  }
  const removeItem = (i) => setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : items)

  // Persist the bill → Today's transactions, Recent activity, Collect Credit, stock.
  // Idempotent: re-saving the same bill updates it; stock is deducted only once.
  const persistBill = () => {
    if (!createdAtRef.current) createdAtRef.current = Date.now()
    // Cheque payments are treated as credit (counted in the Credit section).
    const status = (customer.payment === "Credit" || customer.payment === "Cheque") ? "credit" : "paid"
    // Structured per-fuel lines so Reports can break sales down accurately.
    // Line amounts are scaled to the net (post-discount) total so they sum to `amount`.
    const scale = subtotal > 0 ? netSale / subtotal : 0
    const lines = items.map((it) => {
      const m = FUEL_META.find((f) => f.name === it.particular)
      return {
        fuel: it.particular,
        key: m ? m.key : null,
        qty: Number(it.qty) || 0,
        rate: Number(it.rate) || 0,
        amount: Number((lineAmount(it) * scale).toFixed(2)),
      }
    })
    const bill = {
      id: invoiceNo,
      customer: customer.name,
      pan: customer.pan,
      items: items.map((it) => `${it.particular} — ${it.qty}L`).join(", "),
      lines,
      litres: Number(items.reduce((s, it) => s + (Number(it.qty) || 0), 0).toFixed(2)),
      amount: Number(total.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      status,
      payment: customer.payment,
      date: meta.date,
      createdAt: createdAtRef.current, // real creation moment — used for "today" stats
      time: new Date(createdAtRef.current).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    try {
      const bills = JSON.parse(localStorage.getItem("bills") || "[]").filter((b) => b.id !== bill.id)
      bills.unshift(bill)
      localStorage.setItem("bills", JSON.stringify(bills))
      console.log("[OilDesk] bill saved →", bill.id, "| total bills:", bills.length)

      const act = {
        type: status === "credit" ? "credit" : "bill",
        label: status === "credit" ? "Credit bill" : "Bill issued",
        text: `${bill.id} · ${bill.customer}`,
        sub: `Rs. ${money(bill.amount)} — ${status === "credit" ? "Credit" : "Paid"}`,
        time: bill.time,
      }
      const activity = JSON.parse(localStorage.getItem("activity") || "[]").filter((a) => a.text !== act.text)
      activity.unshift(act)
      localStorage.setItem("activity", JSON.stringify(activity))
    } catch (_) {}

    // Deduct sold quantities from tank stock — only once per bill.
    if (!stockDoneRef.current) {
      const qtyByFuel = {}
      items.forEach((it) => {
        const meta = FUEL_META.find((f) => f.name === it.particular)
        if (meta) qtyByFuel[meta.key] = (qtyByFuel[meta.key] || 0) + (Number(it.qty) || 0)
      })
      Object.entries(qtyByFuel)
        .filter(([, q]) => q > 0)
        .forEach(([product, quantity]) => updateStock({ product, type: "sale", quantity }).catch(() => {}))
      stockDoneRef.current = true
    }
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!customer.name.trim()) { setError("Enter the customer name"); return }
    if (subtotal <= 0) { setError("Add at least one item with quantity and rate"); return }
    if (customer.payment === "Cheque" && (!customer.bankName.trim() || !customer.chequeAmount)) {
      setError("Enter the bank name and cheque amount")
      return
    }
    setError("")
    persistBill() // record the sale as soon as the bill is created
    setView("invoice")
  }

  const saveBill = () => {
    persistBill() // idempotent — keeps the record in sync, then go to the dashboard
    navigate("/dashboard")
  }

  // ── Invoice / print view ──────────────────────────────────────────────────
  if (view === "invoice") {
    return (
      <div className="ns-page">
        <div className="ns-bar ns-no-print">
          <button className="us-btn us-back" onClick={() => setView("form")}>← Edit</button>
          <div className="ns-bar-right">
            <button className="us-btn us-back" onClick={() => window.print()}>Print / Save PDF</button>
            <button className="us-btn us-primary" onClick={saveBill}>Save</button>
          </div>
        </div>

        <div className="invoice-sheet">
          <div className="inv-head">
            <div className="inv-store">{(user.store_name || "Your Store").toUpperCase()}</div>
            <div className="inv-sub">{customer.address && customer.address !== "NA" ? "" : ""}Kathmandu | Nepal</div>
            <div className="inv-sub">Phone : &nbsp; Fax : &nbsp; Email :</div>
            <div className="inv-vat">VAT NO. : {user.vat_number || "—"}</div>
            <div className="inv-doctitle">Invoice</div>
          </div>

          <div className="inv-meta">
            <div className="inv-meta-col">
              <div><span>Name :</span> {customer.name}</div>
              <div><span>Address :</span> {customer.address || "NA"}</div>
              <div><span>PAN No :</span> {customer.pan || "—"}</div>
              <div><span>Mode of Payment :</span> {customer.payment}</div>
              {customer.payment === "Cheque" && (
                <>
                  <div><span>Cheque Bank :</span> {customer.bankName}</div>
                  <div><span>Cheque Amount :</span> {money(Number(customer.chequeAmount) || 0)}</div>
                </>
              )}
            </div>
            <div className="inv-meta-col">
              <div><span>Invoice No :</span> {invoiceNo}</div>
              <div><span>Invoice Date :</span> {meta.date}</div>
              <div><span>Transaction Date :</span> {meta.date}</div>
              <div><span>Vehicle No :</span> {meta.vehicle || "—"}</div>
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
              <tr>
                <td colSpan="5" className="inv-total-label">Total</td>
                <td className="num">{money(subtotal)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="inv-bottom">
            <div className="inv-words">
              <div><span>In Words :</span> {amountInWords(total)}</div>
              <div className="inv-remarks"><span>Remarks :</span></div>
            </div>
            <div className="inv-totals">
              <div><span>Trade Discount</span><span className="num">{money(disc)}</span></div>
              <div><span>Taxable Amount</span><span className="num">{money(taxable)}</span></div>
              <div><span>VAT 13% (incl.)</span><span className="num">{money(vat)}</span></div>
              <div className="inv-grand"><span>TOTAL :</span><span className="num">{money(total)}</span></div>
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
          <p className="us-sub">Create a VAT bill for a customer — cash or credit.</p>
        </div>

        <form onSubmit={handleCreate}>
          <section className="us-card">
            <div className="us-card-hd"><span className="us-section">CUSTOMER DETAILS</span></div>
            <div className="us-grid">
              <div className="us-field">
                <label>Customer Name <span className="req">*</span></label>
                <input type="text" placeholder="Enter customer name" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </div>
              <div className="us-field">
                <label>PAN No.</label>
                <input type="text" inputMode="numeric" placeholder="Enter PAN number" value={customer.pan}
                  onChange={(e) => setCustomer({ ...customer, pan: e.target.value.replace(/\D/g, "") })} />
              </div>
              <div className="us-field">
                <label>Address</label>
                <input type="text" placeholder="Enter address" value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              </div>
              <div className="us-field">
                <label>Mode of Payment <span className="req">*</span></label>
                <select value={customer.payment} onChange={(e) => setCustomer({ ...customer, payment: e.target.value })}>
                  <option>Cash</option>
                  <option>Credit</option>
                  <option>Cheque</option>
                  <option>QR Payment</option>
                </select>
              </div>
              {customer.payment === "Cheque" && (
                <>
                  <div className="us-field">
                    <label>Bank Name <span className="req">*</span></label>
                    <input type="text" placeholder="Enter bank name" value={customer.bankName}
                      onChange={(e) => setCustomer({ ...customer, bankName: e.target.value })} />
                  </div>
                  <div className="us-field">
                    <label>Cheque Amount <span className="req">*</span></label>
                    <input type="number" placeholder="Enter cheque amount" value={customer.chequeAmount}
                      onChange={(e) => setCustomer({ ...customer, chequeAmount: e.target.value })} />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="us-card">
            <div className="us-card-hd"><span className="us-section">INVOICE DETAILS</span></div>
            <div className="us-grid">
              <div className="us-field">
                <label>Invoice No.</label>
                <div className="us-readonly">{invoiceNo}</div>
              </div>
              <div className="us-field">
                <label>Invoice Date <span className="req">*</span></label>
                <input type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
              </div>
              <div className="us-field">
                <label>Vehicle No.</label>
                <input type="text" placeholder="e.g. BA 1 KHA 1573" value={meta.vehicle}
                  onChange={(e) => setMeta({ ...meta, vehicle: e.target.value })} />
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
                <span>Particular</span><span>H.S Code</span><span>Qty (Ltr.)</span><span>Rate</span><span className="num">Amount</span><span></span>
              </div>
              {items.map((it, i) => (
                <div className="ns-item-row" key={i}>
                  <select value={it.particular} onChange={(e) => setItem(i, "particular", e.target.value)}>
                    {products.map((p) => <option key={p.name}>{p.name}</option>)}
                  </select>
                  <span className="ns-hs">{it.hsCode}</span>
                  <input type="number" placeholder="0" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
                  <span className="ns-hs">{it.rate}</span>
                  <span className="ns-amount num">{money(lineAmount(it))}</span>
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
            <button type="submit" className="us-btn us-primary">Create Bill</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewSale
