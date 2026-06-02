import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn } from "../services/api"
import "./Auth.css"

function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("All fields are required"); return }
    try {
      setLoading(true)
      const res = await signIn(form)
      if (res.data.message === "login successful") {
  localStorage.setItem("user", JSON.stringify({
    ...res.data.user,
    token: res.data.token
  }))
  navigate("/dashboard")
} else {
        setError(res.data.message)
      }
    } catch (e) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {showPw
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="left-brand">
            <div className="left-logo" onClick={() => navigate("/")}>
              <div className="left-logo-icon">
                <svg viewBox="0 0 24 24"><path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/></svg>
              </div>
              <span className="left-logo-text">Oil<span>Desk</span></span>
            </div>
            <div className="left-tagline">Your oil store,<br />managed properly.</div>
            <p className="left-sub">VAT billing, stock tracking, and daily sales — all from one login.</p>
          </div>
          <div className="left-stats">
            <div className="left-stat">
              <div className="stat-icon">⛽</div>
              <div><div className="stat-label">VAT Calculation</div><div className="stat-val">13% extracted automatically</div></div>
            </div>
            <div className="left-stat">
              <div className="stat-icon">📄</div>
              <div><div className="stat-label">Invoices</div><div className="stat-val">IRD-compliant PDFs</div></div>
            </div>
            <div className="left-stat">
              <div className="stat-icon">📦</div>
              <div><div className="stat-label">Stock</div><div className="stat-val">Live alerts & tracking</div></div>
            </div>
          </div>
          <div className="left-footer">© 2026 OilDesk Nepal</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <div className="auth-right-logo" onClick={() => navigate("/")}>
            <div className="auth-right-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/></svg>
            </div>
            <div className="auth-right-logo-name">Oil<span>Desk</span></div>
            <div className="auth-right-logo-tag">Nepal Oil Store Management</div>
          </div>

          <div className="auth-right-divider"></div>

          <div className="auth-form-title">Login</div>
          <div className="auth-form-sub">Sign in to your account.</div>

          <div className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="field-pw">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button className="pw-eye" type="button" onClick={() => setShowPw(!showPw)}>
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="auth-extra">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <span className="forgot" onClick={() => navigate("/forgot-password")}>
                Forgot username or password?
              </span>
            </div>

            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="auth-switch">
              Don't have an account? <span onClick={() => navigate("/signup")}>Create One</span>
            </div>
          </div>

          <div className="auth-support">
            <div className="support-dot"></div>
            Email us: <a href="mailto:support@oildesk.app">support@oildesk.app</a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignIn
