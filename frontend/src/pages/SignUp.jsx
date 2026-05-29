import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signUp } from "../services/api"
import "./Auth.css"

function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      const res = await signUp(form)
      if (res.data.message === "Registered successfully") {
        navigate("/signin")
      } else {
        setError(res.data.message)
      }
    } catch (e) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Panel Side */}
        <div className="auth-panel">
          <div className="panel-icon">
            <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
              <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/>
            </svg>
          </div>
          <h3>Welcome Back!</h3>
          <p>Already have an account? Sign in to continue managing your oil store.</p>
          <div className="panel-divider"></div>
          <div className="panel-points">
            <div className="panel-point"><span className="pp-dot"></span>Nepal VAT compliant</div>
            <div className="panel-point"><span className="pp-dot"></span>Stock tracking & alerts</div>
            <div className="panel-point"><span className="pp-dot"></span>PDF invoices</div>
            <div className="panel-point"><span className="pp-dot"></span>Daily sales reports</div>
          </div>
          <button className="panel-btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>

        {/* Form Side */}
        <div className="auth-form">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/>
              </svg>
            </div>
            <span>Oil<b>Desk</b></span>
          </div>

          <h2>Create Account</h2>
          <p>Set up your oil store in minutes.</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Ram Bahadur"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <span onClick={() => navigate("/signin")}>Sign In</span>
          </p>
        </div>

      </div>
    </div>
  )
}

export default SignUp