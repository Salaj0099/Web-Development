import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) {
      navigate("/signin", { replace: true })
      return
    }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) {
        navigate("/signin", { replace: true })
        return
      }
      setUser(parsed)
    } catch (_) {
      navigate("/signin", { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/signin", { replace: true })
  }

  if (!user) return null

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logoText}>Oil<span style={styles.logoAccent}>Desk</span></span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Welcome to Dashboard</h1>
        <p style={styles.subtitle}>
          {user.name ? `Signed in as ${user.name}` : `Signed in as ${user.email}`}
        </p>
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f6f8", fontFamily: "system-ui, sans-serif" },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e5e7eb",
  },
  brand: { fontSize: 22, fontWeight: 700, color: "#111827" },
  logoText: { letterSpacing: "-0.5px" },
  logoAccent: { color: "#2563eb" },
  logoutBtn: {
    padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 8,
    background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer",
  },
  main: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "120px 24px",
  },
  title: { fontSize: 40, fontWeight: 800, color: "#111827", margin: 0 },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 12 },
}

export default Dashboard
