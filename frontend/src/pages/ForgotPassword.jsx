import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Auth.css"

// Step 1: Enter email
// Step 2: Check your inbox (confirmation screen)

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email address"); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address"); return }
    setLoading(true)
    // Simulate sending reset email (connect to backend when ready)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ minHeight: "480px" }}>

        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="welcome-panel">
            <h2 className="welcome-title">Welcome Back!</h2>
            <p className="welcome-sub">Remember your password? Log in and pick up right where you left off.</p>
            <button className="welcome-btn" onClick={() => navigate("/signin")}>SIGN IN</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right" style={{ justifyContent: "center" }}>
          <div className="auth-right-logo" onClick={() => navigate("/")}>
            <div className="auth-right-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 3C12 3 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 3 12 3Z"/></svg>
            </div>
            <div className="auth-right-logo-name">Oil<span>Desk</span></div>
            <div className="auth-right-logo-tag">Nepal Oil Store Management</div>
          </div>

          <div className="auth-right-divider"></div>

          {!sent ? (
            <>
              <div className="auth-form-title">Forgot Password?</div>
              <div className="auth-form-sub">Enter your registered email address to receive a reset link.</div>

              <div className="auth-form">
                {error && <div className="auth-error">{error}</div>}

                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError("") }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    autoFocus
                  />
                </div>

                <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Sending reset link..." : "Send Reset Link"}
                </button>

                <div className="fp-back" onClick={() => navigate("/signin")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Back to Login
                </div>
              </div>
            </>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <h3 className="fp-success-title">Check your inbox</h3>
              <p className="fp-success-sub">
                We sent a password reset link to<br />
                <strong>{email}</strong>
              </p>
              <p className="fp-success-note">
                The link expires in 30 minutes. Check your spam folder if you do not see it.
              </p>
              <button className="auth-btn" onClick={() => navigate("/signin")}>
                Back to Login
              </button>
              <div className="fp-resend">
                Did not receive it?{" "}
                <span onClick={() => { setSent(false); setEmail("") }}>Try again</span>
              </div>
            </div>
          )}

          <div className="auth-support">
            <div className="support-dot"></div>
            Email us: <a href="mailto:support@oildesk.app">support@oildesk.app</a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword
