import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./FAQs.css"

const faqs = [
  {
    section: "About OilDesk",
    id: "about",
    items: [
      { q: "What is OilDesk?", a: "A web application for Nepal oil store owners. It handles VAT billing, stock tracking, daily sales, and customer records from one login. The 13% VAT is extracted automatically. Bills export as PDFs. Stock drops when a sale is recorded." },
      { q: "Who is it built for?", a: "Store owners and managers who issue VAT bills and check stock daily. Accountants or assistants who handle daily records and IRD submissions. Built for Nepal petroleum retailers specifically — not a generic billing tool adjusted to fit." },
      { q: "Is it another accounting system?", a: "No. OilDesk does not do general accounting. It handles the specific daily tasks of a Nepal oil store: billing, stock, sales reports, and customer records." },
      { q: "Is it free?", a: "There is a free trial. Create an account, add products and customers, and start billing right away. No credit card needed." }
    ]
  },
  {
    section: "Account & Login",
    id: "account",
    items: [
      { q: "How do I create an account?", a: "Click Get Started on oildesk.app. Enter your name, email, and password. Done in under two minutes — no paperwork, no verification delays." },
      { q: "I forgot my password.", a: "On the sign-in page, click Forgot Password. Enter your registered email and follow the reset link sent to your inbox." },
      { q: "Can multiple staff use one account?", a: "Currently one admin login per store. Multi-user access is coming." },
      { q: "How do I change my password?", a: "Go to Profile after logging in. Click Change Password, enter your current and new password, then save." }
    ]
  },
  {
    section: "VAT Billing",
    id: "billing",
    items: [
      { q: "How does the VAT calculation work?", a: "Nepal fuel prices are VAT inclusive — the 13% is already inside the price. OilDesk extracts it using: VAT = Total × 13/113. If a customer buys petrol worth Rs. 3,000, the VAT inside is Rs. 345.13 and the base is Rs. 2,654.87. The customer pays Rs. 3,000 — not Rs. 3,390." },
      { q: "Can I print a VAT bill?", a: "Yes. Every invoice downloads as a PDF. The format is IRD-compliant and includes the customer's PAN number, product breakdown, base amount, VAT extracted, and total payable." },
      { q: "Can I apply a discount?", a: "Yes. Add a discount before VAT is extracted. The taxable amount adjusts automatically." },
      { q: "What if the customer has no PAN number?", a: "Create a walk-in bill. No customer registration needed. The VAT calculation still works correctly." },
      { q: "Can I find an old bill?", a: "Yes. Bill History stores every invoice. Search by customer name, date, or amount." }
    ]
  },
  {
    section: "Stock",
    id: "stock",
    items: [
      { q: "How does stock tracking work?", a: "Set an opening quantity when you add a product. Every bill reduces the stock automatically. No manual counting needed." },
      { q: "What happens when stock gets low?", a: "OilDesk triggers a low stock alert when a product falls below the minimum you set. Each product has its own threshold." },
      { q: "How do I update stock when new supply arrives?", a: "Go to Products, select the item, add the new quantity. A supply history is kept automatically." },
      { q: "Can I track multiple fuel types?", a: "Yes. Add as many products as your store carries — Petrol, Diesel, Kerosene, or anything else — each with its own stock level and alert." }
    ]
  },
  {
    section: "Reports",
    id: "reports",
    items: [
      { q: "What does the daily report show?", a: "Total revenue for the day, bills issued, and VAT collected. It updates every time a bill is created." },
      { q: "Can I see monthly figures?", a: "Yes. The monthly report shows revenue and VAT for any selected month. You can compare periods." },
      { q: "Can I use the VAT report for IRD?", a: "Yes. It shows total VAT collected within any time range. Built around Nepal IRD reporting requirements." },
      { q: "What is the best sellers report?", a: "It shows which products sold most in a given period. Useful for deciding how much to reorder." }
    ]
  },
  {
    section: "Customers",
    id: "customers",
    items: [
      { q: "Do I have to register every customer?", a: "No. Walk-in bills work without any customer registration. Registration is useful when you want billing history or need the PAN number on invoices." },
      { q: "What do I store for a customer?", a: "Name, phone, address, and PAN number. Only the name is required." },
      { q: "Can I see all bills for one customer?", a: "Yes. Open any customer record and their full billing history is there." }
    ]
  },
  {
    section: "Commodities",
    id: "commodities",
    items: [
      { q: "What is the commodities section on the dashboard?", a: "Live global commodity prices — Crude Oil, Natural Gas, Gasoline, Heating Oil, Gold — shown on your dashboard. Useful for checking what the global market is doing before you set daily prices." },
      { q: "Where does the data come from?", a: "From oil-price.net, a public commodity data provider. These are reference prices only. Actual Nepal fuel prices are set by NOC and will differ." }
    ]
  },
  {
    section: "Security",
    id: "security",
    items: [
      { q: "Is my data secure?", a: "Your store data is protected by password authentication. Nobody else can access your bills, stock, or reports." },
      { q: "Does OilDesk share my data?", a: "No. Customer records and billing history are private to your account." }
    ]
  },
  {
    section: "Support",
    id: "support",
    items: [
      { q: "I have a problem. Who do I contact?", a: "Email support@oildesk.app or use the Contact form. We respond within one working day." },
      { q: "Where can I learn more?", a: "Visit oildesk.app or check the How it Works section on the homepage." }
    ]
  }
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className={`faq-q ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
        {q}
        <span className="arrow">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  )
}

function FAQs() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("about")

  return (
    <div>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/>
            </svg>
          </div>
          <span className="logo-text">Oil<span>Desk</span></span>
        </div>
        <div className="nav-links">
          <a href="/#how">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#why">Why OilDesk</a>
          <a href="/faqs" style={{ color: "#c85a00", fontWeight: "600" }}>FAQs</a>
        </div>
        <div className="nav-end">
          <button className="btn-signin" onClick={() => navigate("/signin")}>Sign In</button>
          <button className="btn-start" onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="faq-hero">
        <div className="hero-tag">Help & Support</div>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about OilDesk. Can't find an answer? Email us at support@oildesk.app</p>
      </section>

      {/* LAYOUT */}
      <div className="faq-layout">

        {/* SIDEBAR */}
        <div className="faq-sidebar">
          <h4>Jump to</h4>
          {faqs.map(section => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={activeSection === section.id ? "active" : ""}
              onClick={() => setActiveSection(section.id)}
            >
              {section.section}
            </a>
          ))}
        </div>

        {/* CONTENT */}
        <div className="faq-content">
          {faqs.map(section => (
            <div key={section.id} id={section.id} className="faq-section">
              <h2>{section.section}</h2>
              {section.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* CTA */}
      <section className="faq-cta">
        <h2>Still have a question?</h2>
        <p>Email us at support@oildesk.app and we will get back to you within one working day.</p>
        <div className="cta-btns">
          <button className="cta-white" onClick={() => navigate("/signup")}>Get started free</button>
          <button className="cta-dark">Contact support</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <div className="fl-logo">Oil<span>Desk</span> Nepal</div>
          <p className="fl-desc">Oil store management for Nepal petroleum retailers.</p>
        </div>
        <div className="fc-col">
          <h5>Product</h5>
          <a href="#">Features</a>
          <a href="#">VAT Billing</a>
          <a href="#">Stock</a>
        </div>
        <div className="fc-col">
          <h5>Support</h5>
          <a href="/faqs">FAQs</a>
          <a href="#">Contact</a>
        </div>
        <div className="fc-col">
          <h5>Legal</h5>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
      <div className="foot-bottom">
        <div className="foot-copy">© 2026 OilDesk Nepal. All rights reserved.</div>
        <div className="foot-right">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>

    </div>
  )
}

export default FAQs
