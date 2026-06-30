import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getMe, updateProfile, changePassword } from "../services/api"
import "./UpdateStock.css"
import "./Settings.css"

const initials = (s = "") =>
  s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "U"

const errText = (e, fallback) =>
  (e && e.response && e.response.data && e.response.data.message) || fallback

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

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

  // Refresh from the server so details stay accurate across devices.
  useEffect(() => {
    getMe()
      .then((res) => {
        if (res.data && res.data.user) {
          setUser((u) => {
            const merged = { ...(u || {}), ...res.data.user }
            localStorage.setItem("user", JSON.stringify(merged))
            return merged
          })
        }
      })
      .catch(() => {}) // keep the locally cached user if offline
  }, [])

  if (!user) return null

  return (
    <div className="us-page">
      <div className="us-wrap">
        <div className="us-head">
          <div className="us-title-row">
            <span className="us-title-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </span>
            <h1 className="us-title">Settings</h1>
          </div>
          <p className="us-sub">Manage your profile, password, and account.</p>
        </div>

        <ProfileCard user={user} setUser={setUser} />
        <PasswordCard />
        <AccountCard user={user} />
        <LogoutCard />

        <div className="us-actions">
          <button className="us-btn us-back" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </div>
    </div>
  )
}

/* ── My Profile ──────────────────────────────────────────────────────────── */
function ProfileCard({ user, setUser }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", storeName: "", vatNumber: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const startEdit = () => {
    setForm({
      name: user.name || "",
      storeName: user.store_name || "",
      vatNumber: user.vat_number || "",
    })
    setError(""); setOk("")
    setEditing(true)
  }

  const cancel = () => { setEditing(false); setError("") }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Please enter your name."); return }
    if (form.vatNumber && !/^\d{6,}$/.test(form.vatNumber.trim())) {
      setError("VAT/PAN number should be at least 6 digits."); return
    }
    try {
      setSaving(true); setError("")
      const res = await updateProfile({
        name: form.name.trim(),
        storeName: form.storeName.trim(),
        vatNumber: form.vatNumber.trim(),
      })
      const merged = { ...user, ...res.data.user }
      localStorage.setItem("user", JSON.stringify(merged))
      window.dispatchEvent(new Event("storage")) // nudge other open tabs
      setUser(merged)
      setEditing(false)
      setOk("Your profile has been updated.")
    } catch (err) {
      setError(errText(err, "Couldn't save your changes. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="us-card">
      <div className="us-card-hd">
        <span className="us-section">MY PROFILE</span>
        {!editing && (
          <button className="set-text-btn" onClick={startEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Edit details
          </button>
        )}
      </div>

      <div className="set-identity">
        <div className="set-avatar">{initials(user.name || user.email)}</div>
        <div>
          <div className="set-identity-name">{user.name || "—"}</div>
          <div className="set-identity-sub">{user.email}</div>
        </div>
      </div>

      {ok && !editing && <div className="set-ok">{ok}</div>}

      {!editing ? (
        <div className="set-rows">
          <div className="set-row"><span className="set-key">Full name</span><span className="set-val">{user.name || "—"}</span></div>
          <div className="set-row"><span className="set-key">Store name</span><span className="set-val">{user.store_name || "Not set"}</span></div>
          <div className="set-row"><span className="set-key">VAT / PAN number</span><span className="set-val">{user.vat_number || "Not set"}</span></div>
        </div>
      ) : (
        <form onSubmit={save}>
          <div className="us-grid">
            <div className="us-field">
              <label>Full name <span className="req">*</span></label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ramesh Shrestha" />
            </div>
            <div className="us-field">
              <label>Store name</label>
              <input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="e.g. Elite Fuel Concern" />
            </div>
            <div className="us-field">
              <label>VAT / PAN number</label>
              <input
                value={form.vatNumber}
                inputMode="numeric"
                onChange={(e) => set("vatNumber", e.target.value.replace(/\D/g, ""))}
                placeholder="Digits only"
              />
            </div>
            <div className="us-field">
              <label>Email</label>
              <div className="us-readonly">{user.email}</div>
            </div>
          </div>
          {error && <div className="us-error" style={{ marginTop: 14 }}>{error}</div>}
          <div className="set-form-actions">
            <button type="button" className="us-btn us-back" onClick={cancel} disabled={saving}>Cancel</button>
            <button type="submit" className="us-btn us-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

/* ── Change Password ─────────────────────────────────────────────────────── */
function PasswordCard() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }))

  const eye = (on) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {on
        ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>
        : <><path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3 3.6M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.7" /><path d="M3 3l18 18" /></>}
    </svg>
  )

  const submit = async (e) => {
    e.preventDefault()
    setOk("")
    if (!form.current) { setError("Enter your current password."); return }
    if (form.next.length < 6) { setError("New password must be at least 6 characters."); return }
    if (form.next === form.current) { setError("Pick a password different from your current one."); return }
    if (form.next !== form.confirm) { setError("New password and confirmation don't match."); return }
    try {
      setSaving(true); setError("")
      await changePassword({ currentPassword: form.current, newPassword: form.next })
      setForm({ current: "", next: "", confirm: "" })
      setOk("Your password has been changed.")
    } catch (err) {
      setError(errText(err, "Couldn't update your password. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const field = (key, label) => (
    <div className="us-field">
      <label>{label} <span className="req">*</span></label>
      <div className="set-pw">
        <input
          type={show[key] ? "text" : "password"}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={key === "current" ? "Current password" : key === "next" ? "At least 6 characters" : "Re-enter new password"}
          autoComplete={key === "current" ? "current-password" : "new-password"}
        />
        <button type="button" className="set-pw-eye" onClick={() => toggle(key)} aria-label="Toggle visibility">
          {eye(show[key])}
        </button>
      </div>
    </div>
  )

  return (
    <section className="us-card">
      <div className="us-card-hd">
        <span className="us-section">CHANGE PASSWORD</span>
      </div>

      {ok && <div className="set-ok">{ok}</div>}

      <form onSubmit={submit}>
        <div className="us-grid">
          {field("current", "Current password")}
          <div className="set-spacer" />
          {field("next", "New password")}
          {field("confirm", "Confirm new password")}
        </div>
        {error && <div className="us-error" style={{ marginTop: 14 }}>{error}</div>}
        <div className="set-form-actions">
          <button type="submit" className="us-btn us-primary" disabled={saving}>
            {saving ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </section>
  )
}

/* ── My Account ──────────────────────────────────────────────────────────── */
function AccountCard({ user }) {
  const username = (user.email || "").split("@")[0] || "—"
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—"

  return (
    <section className="us-card">
      <div className="us-card-hd">
        <span className="us-section">MY ACCOUNT</span>
      </div>
      <div className="set-rows">
        <div className="set-row"><span className="set-key">Username</span><span className="set-val">{username}</span></div>
        <div className="set-row"><span className="set-key">Email</span><span className="set-val">{user.email}</span></div>
        <div className="set-row"><span className="set-key">Role</span><span className="set-val">{user.role || "Store Owner"}</span></div>
        <div className="set-row">
          <span className="set-key">Account status</span>
          <span className="set-val"><span className="set-status">Active</span></span>
        </div>
        <div className="set-row"><span className="set-key">Member since</span><span className="set-val">{memberSince}</span></div>
      </div>
      <p className="set-note">
        Need to change your email or close this account? Reach us at
        {" "}<a href="mailto:support@oildesk.app">support@oildesk.app</a>.
      </p>
    </section>
  )
}

/* ── Logout ──────────────────────────────────────────────────────────────── */
function LogoutCard() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const cancelRef = useRef(null)

  const close = (cb) => {
    setClosing(true)
    setTimeout(() => { setClosing(false); setOpen(false); cb && cb() }, 160)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    const t = setTimeout(() => cancelRef.current?.focus(), 40)
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const doLogout = () => {
    localStorage.removeItem("user")
    navigate("/signin", { replace: true })
  }

  return (
    <section className="us-card set-logout">
      <div>
        <div className="set-logout-title">Sign out</div>
        <div className="set-logout-sub">End your session on this device. You can sign back in anytime.</div>
      </div>
      <button className="set-logout-btn" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
        </svg>
        Sign out
      </button>

      {open && (
        <div className={`lo-overlay${closing ? " closing" : ""}`} onClick={() => close()} role="presentation">
          <div
            className={`lo-dialog${closing ? " closing" : ""}`}
            role="dialog" aria-modal="true" aria-labelledby="set-lo-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17l5-5-5-5" /><path d="M20 12H9" /><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <h2 id="set-lo-title" className="lo-title">Ready to sign out?</h2>
            <p className="lo-desc">
              You'll be returned to the OilDesk login screen. Before you continue, make sure any open bill has been saved.
            </p>
            <div className="lo-actions">
              <button ref={cancelRef} className="lo-btn lo-cancel" onClick={() => close()}>Stay signed in</button>
              <button className="lo-btn lo-confirm" onClick={() => close(doLogout)}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Settings
