import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./UpdateStock.css"
import "./NewSale.css"

const PRODUCTS = [
  { name: "Petrol", rate: "150.00", hsCode: "27101210" },
  { name: "Diesel", rate: "126.55", hsCode: "27101930" },
  { name: "Kerosene", rate: "110.00", hsCode: "27101910" },
]
const VAT_RATE = 0.13

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
  const today = new Date().toISOString().slice(0, 10)

  const [customer, setCustomer] = useState({ name: "", pan: "", address: "", payment: "Cash", bankName: "", chequeAmount: "" })
  const [meta, setMeta] = useState({ date: today, vehicle: "" })
  const [items, setItems] = useState([{ particular: "Diesel", hsCode: "27101930", qty: "", rate: "126.55" }])
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
        const p = PRODUCTS.find((x) => x.name === v)
        if (p) { next.rate = p.rate; next.hsCode = p.hsCode }
      }
      return next
    }))
  const addItem = () => setItems([...items, { particular: "Petrol", hsCode: "27101210", qty: "", rate: "150.00" }])
  const removeItem = (i) => setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : items)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!customer.name.trim()) { setError("Enter the customer name"); return }
    if (subtotal <= 0) { setError("Add at least one item with quantity and rate"); return }
    if (customer.payment === "Cheque" && (!customer.bankName.trim() || !customer.chequeAmount)) {
      setError("Enter the bank name and cheque amount")
      return
    }
    setError("")
    setView("invoice")
  }

  // ── Invoice / print view ──────────────────────────────────────────────────
  if (view === "invoice") {
    return (
      <div className="ns-page">
        <div className="ns-bar ns-no-print">
          <button className="us-btn us-back" onClick={() => setView("form")}>← Edit</button>
          <div className="ns-bar-right">
            <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
            <button className="us-btn us-primary" onClick={() => window.print()}>Print / Save PDF</button>
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
                <input type="text" placeholder="Enter PAN number" value={customer.pan}
                  onChange={(e) => setCustomer({ ...customer, pan: e.target.value })} />
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
                    {PRODUCTS.map((p) => <option key={p.name}>{p.name}</option>)}
                  </select>
                  <span className="ns-hs">{it.hsCode}</span>
                  <input type="number" placeholder="0" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
                  <input type="number" placeholder="0.00" value={it.rate} onChange={(e) => setItem(i, "rate", e.target.value)} />
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
