import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn } from "../services/api"
import "./Auth.css"

function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required")
      return
    }
    try {
      setLoading(true)
      const res = await signIn(form)
      if (res.data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify(res.data.user))
        navigate("/dashboard")
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

          <h2>Sign In</h2>
          <p>Welcome back. Enter your credentials to continue.</p>

          {error && <div className="auth-error">{error}</div>}

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
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="auth-forgot" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </div>

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>

        {/* Panel Side */}
        <div className="auth-panel">
          <div className="panel-icon">
            <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
              <path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/>
            </svg>
          </div>
          <h3>OilDesk Nepal</h3>
          <p>Your complete oil store management system. VAT billing, stock tracking and daily sales — all in one place.</p>
          <div className="panel-divider"></div>
          <div className="panel-points">
            <div className="panel-point"><span className="pp-dot"></span>13% VAT extracted automatically</div>
            <div className="panel-point"><span className="pp-dot"></span>Print bills as PDF</div>
            <div className="panel-point"><span className="pp-dot"></span>Live stock alerts</div>
            <div className="panel-point"><span className="pp-dot"></span>Daily & monthly reports</div>
          </div>
          <button className="panel-btn" onClick={() => navigate("/signup")}>
            Create Account
          </button>
        </div>

      </div>
    </div>
  )
}

export default SignIn