import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signUp } from "../services/api"
import "./Auth.css"

function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", storeName: "", vatNumber: "", password: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("All fields are required"); return }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return }
    if (!agreed) { setError("Please agree to the Terms and Conditions"); return }
    try {
      setLoading(true)
      const res = await signUp({ name: form.name, email: form.email, password: form.password, storeName: form.storeName, vatNumber: form.vatNumber })
      if (res.data.message === "Created Successfully") {
        navigate("/signin")
      } else {
        setError(res.data.message)
      }
    } catch (e) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ minHeight: "620px" }}>

        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="welcome-panel">
            <h2 className="welcome-title">Welcome Back!</h2>
            <p className="welcome-sub">Stay connected by logging in with your credentials and continue your experience.</p>
            <button className="welcome-btn" onClick={() => navigate("/signin")}>SIGN IN</button>
          </div>
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

          <div className="auth-form-title">Register</div>
          <div className="auth-form-sub">Create your store account.</div>

          <div className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-row">
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email ID</label>
                <input
                  type="email"
                  placeholder="Enter valid email ID"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Name of Store</label>
                <input
                  type="text"
                  placeholder="Enter store name"
                  value={form.storeName}
                  onChange={e => setForm({ ...form, storeName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>VAT Number</label>
                <input
                  type="text"
                  placeholder="Enter VAT number"
                  value={form.vatNumber}
                  onChange={e => setForm({ ...form, vatNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Password</label>
                <div className="field-pw">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button className="pw-eye" type="button" onClick={() => setShowPw(!showPw)}>
                    <EyeIcon show={showPw} />
                  </button>
                </div>
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <div className="field-pw">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Enter confirm password"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                  />
                  <button className="pw-eye" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            <label className="remember" style={{ marginTop: "4px" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              I have read and agreed with the{" "}
              <span style={{ color: "#c85a00", fontWeight: 600, cursor: "pointer" }}>Terms and Conditions</span>
            </label>

            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="auth-switch">
              Already a User? <span onClick={() => navigate("/signin")}>Login</span>
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

export default SignUp
