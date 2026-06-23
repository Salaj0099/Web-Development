import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.css"
import heroImg from "../assets/hero.png"

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

      {/* HERO — ABOUT OILDESK */}
      <section className="about-od about-od-hero">
        <div className="about-od-left">
          <h1 className="about-od-h">About <em>OilDesk</em></h1>
          <p className="about-od-p">OilDesk is a billing and store management app built specifically for oil stores in Nepal. No register, no manual calculation — just your phone or computer behind the counter. You can use it to record sales, print VAT receipts, track stock, log supplier deliveries, and manage customer credit. Everything that currently lives in a handwritten book, in one place. Works on both web and mobile.</p>
        </div>

        <div className="hero-card">
          <div className="hc-head">
            <span className="hc-title">Station Dashboard</span>
            <span className="hc-live"><span className="hc-live-dot"></span>Live</span>
          </div>
          <div className="hc-body">
            <div className="tank-wrap">
              <div className="tank-row"><span>Tank 01 — Petrol</span><span style={{ color: "#22c55e" }}>82%</span></div>
              <div className="tank-bar"><div className="tb-fill tb-green" style={{ width: "82%" }}></div></div>
            </div>
            <div className="tank-wrap">
              <div className="tank-row"><span>Tank 02 — Diesel</span><span style={{ color: "#ef4444" }}>18%</span></div>
              <div className="tank-bar"><div className="tb-fill tb-red" style={{ width: "18%" }}></div></div>
              <div className="low-alert">Low Stock — Reorder Required</div>
            </div>
            <div className="tank-wrap">
              <div className="tank-row"><span>Tank 03 — Kerosene</span><span style={{ color: "#f59e0b" }}>54%</span></div>
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

      {/* GET STARTED */}
      <section className="get-started" id="how">
        <div className="gs-left">
          <h2 className="gs-h">Get Started</h2>
          <div className="gs-steps">
            <div className="gs-step">
              <div className="gs-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
                </svg>
              </div>
              <div className="gs-text">
                <div className="gs-no gs-active">STEP 1</div>
                <div className="gs-title">Create your account</div>
              </div>
            </div>
            <div className="gs-step">
              <div className="gs-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l9-4 9 4-9 4-9-4z" />
                  <path d="M3 8v8l9 4 9-4V8" />
                  <path d="M12 12v8" />
                </svg>
              </div>
              <div className="gs-text">
                <div className="gs-no">STEP 2</div>
                <div className="gs-title">Add your store and products</div>
              </div>
            </div>
            <div className="gs-step">
              <div className="gs-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                  <path d="M9 8h6M9 12h6" />
                </svg>
              </div>
              <div className="gs-text">
                <div className="gs-no">STEP 3</div>
                <div className="gs-title">Start recording sales and printing bills</div>
              </div>
            </div>
          </div>
        </div>
        <div className="gs-right">
          <div className="gs-screen"><img src={heroImg} alt="OilDesk dashboard" /></div>
          <div className="gs-caption">Create your store account, add your products, and start billing — all from one screen.</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat2" id="features">
        <div className="feat2-inner">
          <h2 className="feat2-h">Features</h2>
          <div className="feat2-grid">
            <div className="feat2-col">
              <div className="feat2-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" />
                  <path d="M9 8h6M9 12h6M9 16h3" />
                </svg>
              </div>
              <h3>VAT Billing</h3>
              <p>Every sale prints a proper VAT receipt automatically. No manual calculation, no writing by hand, no mistakes at month end.</p>
            </div>
            <div className="feat2-col">
              <div className="feat2-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l9-4 9 4-9 4-9-4z" />
                  <path d="M3 8v8l9 4 9-4V8" />
                  <path d="M12 12v8" />
                </svg>
              </div>
              <h3>Stock Tracking</h3>
              <p>Your stock updates every time you record a sale or delivery. Know exactly what's left without counting drums or checking registers.</p>
            </div>
            <div className="feat2-col">
              <div className="feat2-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4v16h16" />
                  <path d="M8 14l3-3 3 2 4-5" />
                </svg>
              </div>
              <h3>Sales Records</h3>
              <p>Every transaction is saved the moment you enter it. Pull up any day's sales in seconds — no flipping through pages.</p>
            </div>
            <div className="feat2-col">
              <div className="feat2-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20M6 15h4" />
                </svg>
              </div>
              <h3>Customer Credit</h3>
              <p>Track who bought on credit, how much they owe, and when they last paid. All in one place, always up to date.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIGN UP CTA */}
      <section className="signup-cta">
        <div className="su-inner">
          <div className="su-col">
            <h2>Sign Up and get Started</h2>
            <button className="su-btn" onClick={() => navigate("/signup")}>Sign Up</button>
            <p className="su-note">Already have an account? <span onClick={() => navigate("/signin")}>Click Here</span> to proceed</p>
          </div>
          <div className="su-col">
            <h2>OilDesk on Your Mobile</h2>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="ft-grid">
          <div className="ft-brand">
            <div className="ft-logo">Oil<span>Desk</span></div>
            <div className="ft-copy">© 2026 OilDesk Nepal — All rights reserved.</div>
          </div>
          <div className="ft-col">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#why">Why OilDesk</a>
          </div>
          <div className="ft-col">
            <span onClick={() => navigate("/faqs")}>FAQs</span>
            <span onClick={() => navigate("/faqs")}>Contact</span>
          </div>
          <div className="ft-col">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

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
