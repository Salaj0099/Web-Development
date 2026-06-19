import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.css"

function Home() {
  const navigate = useNavigate()
  const [showHiw, setShowHiw] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div>

      {/* NAV */}
      <nav>
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/></svg>
          </div>
          <div className="logo-text">Oil<span>Desk</span>.app</div>
        </div>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowHiw(true) }}>How it works</a>
          <a href="#features">Features</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowWhy(true) }}>Why OilDesk</a>
          <a href="/faqs">FAQs</a>
        </div>
        <div className="nav-end">
          <button className="btn-signin" onClick={() => navigate("/signin")}>Sign In</button>
          <button className="btn-start" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="hero-tag">⛽ For Nepal Petroleum Retailers</div>
          <h1>Oil store management,<br /><em>done properly.</em></h1>
          <p className="hero-sub">OilDesk handles your VAT billing, stock tracking, daily sales, and customer records. The 13% VAT calculates itself. Bills print as PDFs. Everything is in one place.</p>
          <div className="hero-btns">
            <button className="hbtn-p" onClick={() => navigate("/signup")}>Get started free</button>
            <button className="hbtn-s" onClick={() => setShowHiw(true)}>See how it works</button>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><div className="trust-dot"></div>13% VAT auto-calculated</div>
            <div className="trust-item"><div className="trust-dot"></div>Print bills as PDF</div>
            <div className="trust-item"><div className="trust-dot"></div>Stock alerts</div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hc-head">
            <span className="hc-title">Station Dashboard</span>
            <span className="hc-live"><span className="hc-live-dot"></span>Live</span>
          </div>
          <div className="hc-body">
            <div className="hc-stats">
              <div className="hc-stat"><div className="hc-stat-val">Rs 42K</div><div className="hc-stat-label">Today Sales</div></div>
              <div className="hc-stat"><div className="hc-stat-val">12</div><div className="hc-stat-label">Bills Today</div></div>
              <div className="hc-stat"><div className="hc-stat-val">Rs 5.2K</div><div className="hc-stat-label">VAT Collected</div></div>
            </div>
            <div className="tank-wrap">
              <div className="tank-row"><span>Petrol — Tank 01</span><span style={{ color: "#22c55e" }}>82%</span></div>
              <div className="tank-bar"><div className="tb-fill tb-green" style={{ width: "82%" }}></div></div>
            </div>
            <div className="tank-wrap">
              <div className="tank-row"><span>Diesel — Tank 02</span><span style={{ color: "#ef4444" }}>18%</span></div>
              <div className="tank-bar"><div className="tb-fill tb-red" style={{ width: "18%" }}></div></div>
              <div className="low-alert">Low Stock — Reorder Required</div>
            </div>
            <div className="tank-wrap">
              <div className="tank-row"><span>Kerosene — Tank 03</span><span style={{ color: "#f59e0b" }}>54%</span></div>
              <div className="tank-bar"><div className="tb-fill" style={{ width: "54%", background: "#f59e0b" }}></div></div>
            </div>
            <div className="hc-divider" style={{ marginTop: "12px" }}></div>
            <div style={{ background: "#f8f9fa", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "#0b1a2e", padding: "6px 10px", fontSize: "10px", fontWeight: "700", color: "#fff", letterSpacing: "1px", textTransform: "uppercase", textAlign: "center" }}>Commodities</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e8ecf0" }}>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#1a6bb5", fontWeight: "600" }}>Crude Oil</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#333", textAlign: "right" }}>88.57</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#ef4444", textAlign: "right" }}>-0.37%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e8ecf0" }}>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#1a6bb5", fontWeight: "600" }}>Natural Gas</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#333", textAlign: "right" }}>3.33</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#22c55e", textAlign: "right" }}>+1.44%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e8ecf0" }}>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#1a6bb5", fontWeight: "600" }}>Gasoline</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#333", textAlign: "right" }}>3.01</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#ef4444", textAlign: "right" }}>-0.23%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e8ecf0" }}>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#1a6bb5", fontWeight: "600" }}>Heating Oil</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#333", textAlign: "right" }}>3.55</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#555", textAlign: "right" }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#1a6bb5", fontWeight: "600" }}>Gold</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#333", textAlign: "right" }}>4545.60</td>
                    <td style={{ padding: "5px 10px", fontSize: "11px", color: "#22c55e", textAlign: "right" }}>+0.29%</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ padding: "4px 10px", fontSize: "9px", color: "#999", textAlign: "right", borderTop: "1px solid #e8ecf0" }}>2026.05.29</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="ss-item"><div className="ss-num">13%</div><div className="ss-label">VAT auto-calculated</div></div>
        <div className="ss-item"><div className="ss-num">20+</div><div className="ss-label">Built-in features</div></div>
        <div className="ss-item"><div className="ss-num">PDF</div><div className="ss-label">Bills ready to print</div></div>
        <div className="ss-item"><div className="ss-num">100%</div><div className="ss-label">Nepal IRD compliant</div></div>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="sec-tag">How it works</div>
        <h2 className="sec-h">Up and running in <em>three steps</em></h2>
        <p className="sec-p">No setup fees, no training needed. Most store owners have their first bill ready within ten minutes of signing up.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Create your account</h3>
            <p>Sign up with your store name and VAT number. Takes about two minutes. No paperwork, no verification delays.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Add your products and customers</h3>
            <p>Enter your oil products — petrol, diesel, whatever you stock — with prices. Add customer details including PAN numbers.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Start billing and tracking</h3>
            <p>Select a customer, add products, and OilDesk generates a VAT-compliant invoice. Stock updates automatically. Reports update in real time.</p>
          </div>
        </div>
      </section>

      {/* MAIN FEATURES */}
      <section className="feat-bg" id="features">
        <div className="sec-tag">Features</div>
        <h2 className="sec-h">What OilDesk <em>actually does</em></h2>
        <p className="sec-p">The things a Nepal oil store needs every day. Nothing more, nothing less.</p>
        <div className="feat-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
          <div className="fc"><div className="fc-tag-id">F-01</div><h3>VAT Billing</h3><p>13% VAT calculated automatically on every transaction. Select customer and products — invoice ready in seconds. Print or download as PDF.</p><span className="fc-badge badge-green">VAT Auto · PDF Ready</span></div>
          <div className="fc"><div className="fc-tag-id">F-02</div><h3>Stock Tracking</h3><p>Petrol, diesel, kerosene — stock updates with every sale. Low stock alert fires when a tank drops below your set minimum. No manual counting.</p><span className="fc-badge badge-red">Live · Alerts</span></div>
          <div className="fc"><div className="fc-tag-id">F-03</div><h3>Daily &amp; Monthly Sales Reports</h3><p>Today's revenue, bills issued, and VAT collected — on the dashboard the moment you log in. Monthly view for comparing periods and IRD reporting.</p><span className="fc-badge badge-blue">Daily · Monthly · IRD</span></div>
          <div className="fc"><div className="fc-tag-id">F-04</div><h3>Customer Records</h3><p>Name, phone, address, and PAN number stored per customer. Pull up a full billing history for any customer in one click.</p><span className="fc-badge badge-blue">PAN · History</span></div>
          <div className="fc"><div className="fc-tag-id">F-05</div><h3>Bill History &amp; Search</h3><p>Every invoice stored and searchable. Filter by customer, date, or amount. Nothing gets lost, nothing needs filing manually.</p><span className="fc-badge badge-blue">Full History</span></div>
          <div className="fc"><div className="fc-tag-id">F-06</div><h3>Secure Login &amp; Dashboard</h3><p>Password-protected access. One dashboard shows sales, stock levels, VAT collected, and recent bills — updated live every time something changes.</p><span className="fc-badge badge-amber">Secure · Live</span></div>
        </div>
      </section>

      {/* BILLING HIGHLIGHT */}
      <section className="billing-block">
        <div>
          <div className="bb-tag">VAT Billing</div>
          <h2 className="bb-h">IRD-compliant invoices<br />in under 30 seconds</h2>
          <p className="bb-p">Select the customer, add products, and OilDesk does the rest. The 13% VAT is applied automatically. The invoice is ready to print or download as a PDF before the customer is done paying.</p>
          <div className="check-list">
            <div className="ci"><div className="ci-dot">✓</div><span>13% VAT extracted from price (VAT inclusive)</span></div>
            <div className="ci"><div className="ci-dot">✓</div><span>PDF download in one click</span></div>
            <div className="ci"><div className="ci-dot">✓</div><span>Customer PAN number on every invoice</span></div>
            <div className="ci"><div className="ci-dot">✓</div><span>Discounts applied before VAT</span></div>
            <div className="ci"><div className="ci-dot">✓</div><span>Every bill stored and searchable</span></div>
          </div>
        </div>
        <div className="invoice">
          <div className="inv-top">
            <div><div className="inv-name">VAT Invoice</div><div className="inv-no">BILL-2026-1206</div></div>
            <div className="inv-status">Paid</div>
          </div>
          <div className="inv-meta">
            <div><div className="inv-meta-k">Customer</div><div className="inv-meta-v">Ram Bahadur</div></div>
            <div><div className="inv-meta-k">PAN No.</div><div className="inv-meta-v">123456789</div></div>
            <div><div className="inv-meta-k">Date</div><div className="inv-meta-v">20 May 2026</div></div>
            <div><div className="inv-meta-k">Station</div><div className="inv-meta-v">Kathmandu #01</div></div>
          </div>
          <table className="inv-tbl">
            <thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>
              <tr><td>Petrol</td><td>20L</td><td>Rs 150</td><td>Rs 3,000</td></tr>
              <tr><td>Diesel</td><td>10L</td><td>Rs 120</td><td>Rs 1,200</td></tr>
            </tbody>
          </table>
          <div className="inv-totals">
            <div className="inv-row"><span>Total Sales</span><span>Rs 4,200.00</span></div>
            <div className="inv-row"><span>Base Amount (excl. VAT)</span><span>Rs 3,716.81</span></div>
            <div className="inv-row"><span className="g">VAT included (13/113)</span><span className="g">Rs 483.19</span></div>
            <div className="inv-row total"><span>Total Payable</span><span className="o">Rs 4,200.00</span></div>
          </div>
          <div className="inv-foot">VAT is included in the price · Print or download as PDF</div>
        </div>
      </section>

      {/* WHY OILDESK */}
      <section className="section" id="why" style={{ background: "#f8f9fa" }}>
        <div className="sec-tag">Why OilDesk</div>
        <h2 className="sec-h">Built for Nepal oil stores, <em>not adapted for them</em></h2>
        <p className="sec-p">Most billing software is built for generic retail. OilDesk is built around how a Nepal petroleum store actually works.</p>
        <div className="why-grid">
          <div className="wc"><div className="wc-n">1</div><h4>Nepal VAT compliant</h4><p>13% VAT applied on every bill. No manual calculation, no IRD submission worries.</p></div>
          <div className="wc"><div className="wc-n">2</div><h4>No paper records needed</h4><p>Bills, stock, customers — all stored digitally. Searchable in seconds.</p></div>
          <div className="wc"><div className="wc-n">3</div><h4>You know your stock</h4><p>Real-time tracking means you know when to reorder before you run out.</p></div>
          <div className="wc"><div className="wc-n">4</div><h4>Daily numbers, automatically</h4><p>Revenue, VAT, and bill count for today — no adding up receipts at the end of the day.</p></div>
          <div className="wc"><div className="wc-n">5</div><h4>PDF bills in one click</h4><p>Professional VAT invoices ready to print or send. No formatting required.</p></div>
          <div className="wc"><div className="wc-n">6</div><h4>Simple enough to use immediately</h4><p>No training, no manual. Any store owner can figure it out in a few minutes.</p></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to stop doing this by hand?</h2>
        <p>Set up your store in a few minutes. First bill ready before the end of the day.</p>
        <div className="cta-btns">
          <button className="cta-white" onClick={() => navigate("/signup")}>Get started free</button>
          <button className="cta-dark" onClick={() => navigate("/signin")}>Sign in</button>
        </div>
        <div className="cta-note">No credit card required · Nepal IRD compliant</div>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="fl-logo">Oil<span>Desk</span>.app</div>
          <div className="fl-desc">Oil store management for Nepal petroleum retailers. VAT billing, stock, and sales in one place.</div>
        </div>
        <div className="fc-col">
          <h5>Product</h5>
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#why">Why OilDesk</a>
        </div>
        <div className="fc-col">
          <h5>Support</h5>
          <a href="#">FAQs</a>
          <a href="#">Contact</a>
        </div>
        <div className="fc-col">
          <h5>Legal</h5>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>
      <div className="foot-bottom">
        <div className="foot-copy">© 2026 OilDesk Nepal. All rights reserved.</div>
        <div className="foot-right">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>

      {/* ── HOW IT WORKS MODAL ── */}
      {showHiw && (
        <div style={styles.overlay} onClick={() => setShowHiw(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.close} onClick={() => setShowHiw(false)}>×</button>
            <div style={styles.title}>How it works</div>
            <div style={styles.sub}>Everything you need to run your oil store.</div>

            {[
              { icon: "🧾", name: "VAT Billing", desc: "Prints a proper receipt every sale. 13% VAT comes out of the price — not added on after. Customer gets a copy, you keep one." },
              { icon: "📦", name: "Stock Tracking", desc: "Sell a drum, the count drops. Receive a delivery, it goes back up. Check what's left from your phone without counting anything." },
              { icon: "📊", name: "Sales Reports", desc: "Yesterday's sales, this week's revenue, your top product — one screen. Filter by date, print the month-end summary." },
              { icon: "👤", name: "Customer Credit", desc: "Some customers pay later. Log the amount, see the balance, know what's outstanding before the next delivery arrives." },
              { icon: "🚚", name: "Supplier Purchases", desc: "Every delivery goes in with the date, quantity, and price. Stock goes up automatically. When something doesn't add up, you have something to check." },
              { icon: "⚡", name: "Quick Setup", desc: "Add your store, set up your products, start recording sales. Most shops are live within a couple of hours." },
            ].map((f, i) => (
              <div key={i} style={styles.row}>
                <div style={styles.icon}>{f.icon}</div>
                <div>
                  <div style={styles.fname}>{f.name}</div>
                  <div style={styles.fdesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WHY THIS EXISTS MODAL ── */}
      {showWhy && (
        <div style={styles.overlay} onClick={() => setShowWhy(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.close} onClick={() => setShowWhy(false)}>×</button>
            <div style={styles.title}>Why this exists</div>
            <div style={styles.sub}>Built because the register system was broken.</div>
            <p style={styles.para}>Walk into any oil store in Nepal and you'll find the same thing — a thick register behind the counter. One for sales. One for stock. One for customer credit. Sometimes just one book for everything, with columns that run out of space by mid-month.</p>
            <p style={styles.para}>It works, until it doesn't. A page gets torn. Numbers don't match. A customer disputes a balance you can't prove. Month end arrives and someone has to sit down and add up every single sale by hand just to figure out the VAT.</p>
            <p style={styles.para}>Nobody built anything for this. The accounting software was made for big businesses. The billing apps didn't understand Nepal's VAT rules. Everything assumed you had an accountant, a computer, and time to figure it out.</p>
            <p style={styles.para}>So we built OilDesk. Something small enough for a shop counter, specific enough for how oil stores actually work, and simple enough that you don't need any training to use it.</p>
            <p style={{ ...styles.para, fontWeight: "600", color: "#111", marginBottom: 0 }}>If you've ever missed a closing because you were still balancing the register — this is for you.</p>
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflowY: "auto",
    padding: "28px 28px 24px",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
    fontFamily: "-apple-system, 'Inter', sans-serif",
  },
  close: {
    position: "absolute",
    top: "14px",
    right: "14px",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#f0f0f0",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111",
    marginBottom: "5px",
    letterSpacing: "-0.02em",
    paddingRight: "28px",
  },
  sub: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    padding: "12px 0",
    borderBottom: "1px solid #f2f2f2",
  },
  icon: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "14px",
  },
  fname: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111",
    marginBottom: "3px",
  },
  fdesc: {
    fontSize: "12px",
    color: "#888",
    lineHeight: "1.55",
  },
  para: {
    fontSize: "13px",
    color: "#444",
    lineHeight: "1.65",
    marginBottom: "14px",
  },
}

export default Home
