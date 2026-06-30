import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStocks } from '../services/api'
import './Dashboard.css'

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  grid: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="9" y="1" width="5" height="5" rx="1"/><rect x="1" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  bill: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="1" width="11" height="13" rx="1.5"/><path d="M5 5h5M5 7.5h5M5 10h3" strokeLinecap="round"/></svg>,
  box: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7.5 1L13 4v7L7.5 14 2 11V4L7.5 1z"/><path d="M7.5 1v13M2 4l5.5 3 5.5-3" strokeLinecap="round"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="5.5" cy="4.5" r="2.5"/><path d="M1 13c0-3 2-4 4.5-4s4.5 1 4.5 4"/><circle cx="11" cy="4.5" r="2" opacity=".5"/><path d="M14 13c0-2.5-1.5-3.5-3-3.5" opacity=".5"/></svg>,
  truck: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="3" width="9" height="7" rx="1"/><path d="M10 5.5h2.5L14 8v2.5h-4V5.5z"/><circle cx="3.5" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1.5 11l3.5-4 3 3 4-5.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="4.5" r="1.5"/><path d="M1.5 13.5h12" strokeLinecap="round"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7.5" cy="7.5" r="2"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.7 2.7l1.4 1.4M10.9 10.9l1.4 1.4M2.7 12.3l1.4-1.4M10.9 4.1l1.4-1.4"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 2v9M2 6.5h9" strokeLinecap="round"/></svg>,
  alert: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6.5 1L12 11H1L6.5 1z" strokeLinejoin="round"/><path d="M6.5 5v2.5M6.5 9.5v.5" strokeLinecap="round"/></svg>,
  drop: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7.5 1.5C7.5 1.5 3 6 3 9.5a4.5 4.5 0 009 0C12 6 7.5 1.5 7.5 1.5z"/></svg>,
  printer: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="1" width="9" height="4.5" rx=".5"/><path d="M3 5.5H1.5v7H3M12 5.5h1.5v7H12"/><rect x="3" y="8.5" width="9" height="5.5" rx=".5"/><path d="M5 11h5M5 13h3" strokeLinecap="round"/></svg>,
  person: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7.5" cy="4.5" r="2.5"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9.5 10l3.5-3.5L9.5 3M13 6.5H6"/><path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5" strokeLinecap="round"/></svg>,
  menu: <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 5h13M2 8.5h13M2 12h13" strokeLinecap="round"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="5.5" cy="5.5" r="4"/><path d="M9 9l3 3" strokeLinecap="round"/></svg>,
  cash: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="3.5" width="13" height="8" rx="1.5"/><circle cx="7.5" cy="7.5" r="2"/><path d="M3.5 5.5h.01M11.5 9.5h.01" strokeLinecap="round"/></svg>,
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { id: 'BILL-2082-0014', customer: 'Ram Bahadur Thapa', items: 'Petrol — 30L', amount: 4500, vat: 520, status: 'paid', time: '11:42 AM' },
  { id: 'BILL-2082-0013', customer: 'Sita Devi Sharma', items: 'Diesel — 50L, Engine Oil 2L', amount: 7650, vat: 884, status: 'paid', time: '11:28 AM' },
  { id: 'BILL-2082-0012', customer: 'Bijay Transport Pvt.', items: 'Diesel — 200L', amount: 28400, vat: 3283, status: 'credit', time: '10:55 AM' },
  { id: 'BILL-2082-0011', customer: 'Krishna Prasad Acharya', items: 'Petrol — 15L', amount: 2250, vat: 260, status: 'paid', time: '10:32 AM' },
  { id: 'BILL-2082-0010', customer: 'Hari Om Petroleum', items: 'Kerosene — 40L', amount: 3200, vat: 370, status: 'paid', time: '09:48 AM' },
  { id: 'BILL-2082-0009', customer: 'Sunita Karki', items: 'Petrol — 10L', amount: 1500, vat: 173, status: 'paid', time: '09:21 AM' },
  { id: 'BILL-2082-0008', customer: 'Nepal Transport Co.', items: 'Diesel — 100L, Petrol — 20L', amount: 17200, vat: 1988, status: 'credit', time: '08:55 AM' },
  { id: 'BILL-2082-0007', customer: 'Ganesh Hardware Store', items: 'Kerosene — 20L', amount: 1800, vat: 208, status: 'paid', time: '08:30 AM' },
]

const STOCKS = [
  { name: 'Petrol', tank: 'Tank 01', current: 16400, capacity: 20000, unit: 'L', threshold: 4000 },
  { name: 'Diesel', tank: 'Tank 02', current: 3600, capacity: 20000, unit: 'L', threshold: 4000 },
  { name: 'Kerosene', tank: 'Tank 03', current: 8100, capacity: 15000, unit: 'L', threshold: 3000 },
]

const ACTIVITY = [
  { type: 'bill', label: 'Bill issued', text: 'BILL-2082-0014 · Ram Bahadur Thapa', sub: 'Rs. 4,500 — Paid', time: '11:42 AM' },
  { type: 'delivery', label: 'Delivery received', text: 'Diesel 500L — Nepal Oil Corp.', sub: 'Rs. 54,000', time: '09:15 AM' },
  { type: 'credit', label: 'Credit payment', text: 'Nepal Transport Co. — partial', sub: 'Rs. 15,000 received', time: 'Yesterday' },
  { type: 'alert', label: 'Stock alert', text: 'Diesel Tank 02 below threshold', sub: '180L remaining', time: 'Yesterday' },
  { type: 'customer', label: 'Customer added', text: 'Bijay Transport Pvt. Ltd.', sub: 'PAN: 305847291', time: '2 days ago' },
]

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', group: 'main' },
  { id: 'sales', label: 'Sales & Billing', icon: 'bill', group: 'main' },
  { id: 'stock', label: 'Stock', icon: 'box', group: 'main' },
  { id: 'customers', label: 'Customers', icon: 'users', group: 'records' },
  { id: 'suppliers', label: 'Suppliers', icon: 'truck', group: 'records', to: '/suppliers' },
  { id: 'reports', label: 'Reports', icon: 'chart', group: 'records', to: '/reports' },
  { id: 'settings', label: 'Settings', icon: 'settings', group: 'account', to: '/settings' },
]

const TYPE_COLOR = {
  bill: '#c85a00', delivery: '#16a34a', credit: '#2563eb',
  alert: '#dc2626', customer: '#7c3aed',
}

const fmt = (n) => 'Rs. ' + n.toLocaleString('en-IN')

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ w = '100%', h = 14 }) => (
  <div className="skel" style={{ width: w, height: h }} />
)

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subType, loading }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    {loading ? (
      <><Skel h={24} w="65%" /><div style={{ marginTop: 4 }}><Skel h={11} w="50%" /></div></>
    ) : (
      <>
        <div className="stat-value">{value}</div>
        <div className={`stat-sub ${subType || ''}`}>{sub}</div>
      </>
    )}
  </div>
)

// ─── Weekly Chart ─────────────────────────────────────────────────────────────
const WeeklyChart = ({ data, delta, loading }) => {
  const max = Math.max(...data.map(d => d.amount), 1)
  const total = data.reduce((s, d) => s + d.amount, 0)
  return (
    <div className="panel">
      <div className="panel-hdr">
        <span className="panel-title">Weekly sales</span>
        <span className="panel-meta">Ashadh 2082</span>
      </div>
      <div className="panel-body">
        {loading ? (
          <div className="chart-skel">
            {[55, 82, 68, 65, 4, 4, 4].map((h, i) => (
              <div key={i} className="chart-skel-col">
                <Skel h={h} w="100%" />
                <Skel h={10} w="80%" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bar-chart">
            {data.map((d) => {
              const pct = Math.round((d.amount / max) * 100)
              return (
                <div key={d.day} className="bar-col">
                  <div className="bar-wrap">
                    <div
                      className={`bar ${d.amount === 0 ? 'bar-nil' : ''}`}
                      style={{ height: `${d.amount === 0 ? 4 : pct}%` }}
                      title={d.amount > 0 ? fmt(d.amount) : 'No data yet'}
                    />
                  </div>
                  <div className="bar-day">{d.day}</div>
                  {d.amount > 0 && (
                    <div className="bar-val">
                      {d.amount >= 1000 ? `${(d.amount / 1000).toFixed(0)}K` : d.amount}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <div className="chart-foot">
          <span className="muted">Week total: <strong style={{ color: '#0b1a2e' }}>{fmt(total)}</strong></span>
          {delta != null && (
            <span className={delta >= 0 ? 'green' : 'red'}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last week
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Stock Levels ─────────────────────────────────────────────────────────────
const StockLevels = ({ stocks, loading }) => (
  <div className="panel">
    <div className="panel-hdr">
      <span className="panel-title">Stock Remaining</span>
    </div>
    <div className="panel-body stock-list">
      {loading
        ? [1,2,3].map(i => (
            <div key={i} className="stock-item">
              <div className="stock-row"><Skel h={13} w="50%" /><Skel h={13} w="22%" /></div>
              <div style={{ marginTop: 8 }}><Skel h={6} /></div>
              <div style={{ marginTop: 8 }}><Skel h={11} w="42%" /></div>
            </div>
          ))
        : stocks.map((s) => {
            const pct = Math.round((s.current / s.capacity) * 100)
            const isLow = s.current <= s.threshold
            const color = isLow ? '#dc2626' : pct >= 60 ? '#16a34a' : '#d97706'
            return (
              <div key={s.name} className="stock-item">
                <div className="stock-row">
                  <span className="stock-name">{s.name} <span className="stock-tank">· {s.tank}</span></span>
                  <span className="stock-pct" style={{ color }}>{pct}%</span>
                </div>
                <div className="stock-track">
                  <div className="stock-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="stock-bot">
                  <span className="stock-qty">{s.current.toLocaleString('en-IN')}L / {s.capacity.toLocaleString('en-IN')}L</span>
                  {isLow && <span className="reorder-tag">⚠ Reorder</span>}
                </div>
              </div>
            )
          })}
    </div>
  </div>
)

// ─── Commodities ──────────────────────────────────────────────────────────────
const COMMODITIES = [
  { name: 'Crude Oil', price: '69.23', change: -3.89 },
  { name: 'Natural Gas', price: '3.28', change: -0.49 },
  { name: 'Gasoline', price: '2.83', change: -2.71 },
  { name: 'Heating Oil', price: '3.10', change: -3.45 },
  { name: 'Gold', price: '4,096.30', change: 1.19 },
  { name: 'Silver', price: '59.67', change: 1.47 },
  { name: 'Copper', price: '6.21', change: 1.12 },
]

const Commodities = () => (
  <div className="panel cmdty">
    <div className="cmdty-head">Commodities</div>
    <div className="cmdty-list">
      {COMMODITIES.map(c => (
        <div key={c.name} className="cmdty-row">
          <span className="cmdty-name">{c.name}</span>
          <span className="cmdty-price">{c.price}</span>
          <span className={`cmdty-chg ${c.change >= 0 ? 'up' : 'dn'}`}>
            {c.change >= 0 ? '+' : ''}{c.change.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
    <div className="cmdty-foot">
      <span>2026.06.26</span>
      <span className="cmdty-foot-note">USD</span>
    </div>
  </div>
)

// ─── Transaction Table ────────────────────────────────────────────────────────
const TransactionTable = ({ transactions, loading, limit = 10, onViewAll }) => {
  const [search, setSearch] = useState('')
  const filtered = transactions.filter(t =>
    [t.customer, t.id, t.items].some(v => v.toLowerCase().includes(search.toLowerCase()))
  )
  const total = transactions.reduce((s, t) => s + t.amount, 0)
  const visible = filtered.slice(0, limit)
  return (
    <div className="panel">
      <div className="panel-hdr">
        <span className="panel-title">Today's transactions</span>
        <div className="tbl-controls">
          <div className="search-wrap">
            {Ic.search}
            <input
              className="search-inp"
              placeholder="Search bills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="tbl-wrap">
        {loading ? (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <Skel key={i} h={30} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{Ic.bill}</div>
            <div className="empty-title">{search ? 'No matching bills' : 'No transactions yet'}</div>
            <div className="empty-sub">{search ? 'Try a different search' : 'Bills will appear here once you start recording sales'}</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 130 }}>Bill no.</th>
                <th style={{ width: 160 }}>Customer</th>
                <th>Items</th>
                <th style={{ width: 105, textAlign: 'right' }}>Amount</th>
                <th style={{ width: 90, textAlign: 'right' }}>VAT</th>
                <th style={{ width: 75 }}>Status</th>
                <th style={{ width: 70 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.id}>
                  <td><span className="bill-id">{t.id}</span></td>
                  <td><span className="cust-name">{t.customer}</span></td>
                  <td className="items-td">{t.items}</td>
                  <td style={{ textAlign: 'right' }}><strong>{fmt(t.amount)}</strong></td>
                  <td style={{ textAlign: 'right' }} className="muted">{fmt(t.vat)}</td>
                  <td><span className={`badge ${t.status}`}>{t.status === 'paid' ? 'Paid' : 'Credit'}</span></td>
                  <td className="muted">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && (
        <div className="panel-foot">
          <span className="green sm">Total collected: <strong>{fmt(total)}</strong></span>
          {onViewAll && filtered.length > limit && (
            <span className="panel-link" onClick={onViewAll}>View all</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
const ActivityFeed = ({ activity, loading, limit = 10, onViewAll }) => {
  const visible = activity.slice(0, limit)
  return (
    <div className="panel">
      <div className="panel-hdr">
        <span className="panel-title">Recent activity</span>
      </div>
      <div className="panel-body">
        {loading
          ? [1,2,3].map(i => (
              <div key={i} className="act-item">
                <Skel w={8} h={8} />
                <div style={{ flex: 1 }}>
                  <Skel h={11} w="70%" />
                  <div style={{ marginTop: 3 }}><Skel h={10} w="50%" /></div>
                </div>
              </div>
            ))
          : visible.map((a, i) => (
              <div key={i} className="act-item">
                <div className="act-dot" style={{ background: TYPE_COLOR[a.type] }} />
                <div className="act-body">
                  <div className="act-label" style={{ color: TYPE_COLOR[a.type] }}>{a.label}</div>
                  <div className="act-text">{a.text}</div>
                  <div className="act-sub">{a.sub}</div>
                </div>
                <div className="act-time">{a.time}</div>
              </div>
            ))}
      </div>
      {!loading && onViewAll && activity.length > limit && (
        <div className="panel-foot" style={{ justifyContent: 'flex-end' }}>
          <span className="panel-link" onClick={onViewAll}>View all</span>
        </div>
      )}
    </div>
  )
}

// ─── Counter panel (primary actions) ───────────────────────────────────────────
const ctrIcon = (paths) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
)

const COUNTER = [
  {
    id: 'sale', label: 'New Sale', hint: 'Bill — cash or credit', primary: true, to: '/billing/new',
    icon: ctrIcon(<><path d="M6 3h12v18l-3-1.6-3 1.6-3-1.6L6 21V3z" /><path d="M9 8h6M9 12h5" /></>),
  },
  {
    id: 'stock', label: 'Update Stock', hint: 'Add or adjust levels', to: '/stock',
    icon: ctrIcon(<><path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>),
  },
  {
    id: 'credit', label: 'Collect Credit', hint: 'Clear customer dues', to: '/credit',
    icon: ctrIcon(<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></>),
  },
  {
    id: 'report', label: 'Day Report', hint: 'Sales & outstanding dues', to: '/report',
    icon: ctrIcon(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 13v4M12 9v8M16 14v3" /></>),
  },
  {
    id: 'rate', label: 'Rate', hint: 'Per-litre prices', to: '/rate',
    icon: ctrIcon(<><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 11.4V4a1 1 0 0 1 1-1h7.4a2 2 0 0 1 1.4.6l7.8 7.8a2 2 0 0 1 0 2.6z" /><circle cx="7.5" cy="7.5" r="1.3" /></>),
  },
]

const CounterPanel = ({ navigate }) => (
  <section className="counter">
    <div className="counter-head">
      <h2 className="counter-title">At the counter</h2>
      <p className="counter-sub">Start a task — most are done in under a minute.</p>
    </div>
    <div className="counter-grid">
      {COUNTER.map(a => (
        <button
          key={a.id}
          className={`counter-tile${a.primary ? ' primary' : ''}`}
          onClick={() => (a.print ? window.print() : navigate(a.to))}
        >
          <span className="counter-ic">{a.icon}</span>
          <span className="counter-label">{a.label}</span>
          <span className="counter-hint">{a.hint}</span>
        </button>
      ))}
    </div>
  </section>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const initials = (s = '') =>
  s.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U'

const Sidebar = ({ active, setActive, open, onClose, onLogout, user, navigate }) => {
  const groups = ['main', 'records', 'account']
  const labels = { main: 'Main', records: 'Records', account: 'Account' }
  return (
    <>
      {open && <div className="sb-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sb-logo">
          <div className="sb-logo-mark">{Ic.drop}</div>
          <div className="sb-logo-text">Oil<span>Desk</span></div>
        </div>
        <div className="sb-store">
          <div className="sb-store-name">{user?.store_name || 'Your Store'}</div>
          <div className="sb-store-loc">{user?.vat_number ? `VAT: ${user.vat_number}` : 'Oil Store'}</div>
        </div>
        <nav className="sb-nav">
          {groups.map(g => (
            <div key={g}>
              <div className="nav-group-label">{labels[g]}</div>
              {NAV.filter(n => n.group === g).map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${active === n.id ? 'active' : ''}`}
                  onClick={() => { setActive(n.id); onClose(); if (n.to) navigate(n.to) }}
                >
                  {Ic[n.icon]}{n.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
const TopBar = ({ onMenu, user, onLogout, navigate }) => {
  const [open, setOpen] = useState(false)
  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="menu-btn" onClick={onMenu} aria-label="Open menu">{Ic.menu}</button>
        <div>
          <div className="tb-page">Dashboard</div>
          <div className="tb-date">Thursday, 19 Ashadh 2082 · June 3, 2026</div>
        </div>
      </div>
      <div className="tb-right">
        <div className="tb-user" onClick={() => setOpen(o => !o)}>
          <div className="tb-user-av">{initials(user?.name || user?.email)}</div>
          <span className="tb-user-name">{user?.name || user?.email}</span>
          <svg className="tb-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          {open && (
            <div className="tb-menu" onClick={(e) => e.stopPropagation()}>
              <button className="tb-menu-item" onClick={() => { setOpen(false); navigate('/settings') }}>Settings</button>
              <button className="tb-menu-item" onClick={() => { setOpen(false); onLogout() }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Logout confirmation modal ─────────────────────────────────────────────────
const LogoutModal = ({ open, onCancel, onConfirm }) => {
  const [closing, setClosing] = useState(false)
  const cancelRef = useRef(null)

  const close = (cb) => {
    setClosing(true)
    setTimeout(() => { setClosing(false); cb() }, 160)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close(onCancel) }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => cancelRef.current?.focus(), 40)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  return (
    <div
      className={`lo-overlay${closing ? ' closing' : ''}`}
      onClick={() => close(onCancel)}
      role="presentation"
    >
      <div
        className={`lo-dialog${closing ? ' closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lo-title"
        aria-describedby="lo-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17l5-5-5-5" /><path d="M20 12H9" /><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
          </svg>
        </div>
        <h2 id="lo-title" className="lo-title">Ready to sign out?</h2>
        <p id="lo-desc" className="lo-desc">
          You'll be returned to the OilDesk login screen. Before you continue, make sure any open bill has been saved.
        </p>
        <div className="lo-actions">
          <button ref={cancelRef} className="lo-btn lo-cancel" onClick={() => close(onCancel)}>
            Cancel
          </button>
          <button className="lo-btn lo-confirm" onClick={() => close(onConfirm)}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAllTxn, setShowAllTxn] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [user, setUser] = useState(null)
  const [stocks, setStocks] = useState(STOCKS)
  const [transactions, setTransactions] = useState(TRANSACTIONS)
  const [activity, setActivity] = useState(ACTIVITY)
  const [bills, setBills] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { navigate('/signin', { replace: true }); return }
    try {
      const parsed = JSON.parse(stored)
      if (!parsed.token) { navigate('/signin', { replace: true }); return }
      setUser(parsed)
    } catch (_) {
      navigate('/signin', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const refresh = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('bills') || '[]')
        setBills(saved)
        setTransactions(saved.length ? [...saved, ...TRANSACTIONS] : TRANSACTIONS)
        const acts = JSON.parse(localStorage.getItem('activity') || '[]')
        setActivity(acts.length ? [...acts, ...ACTIVITY] : ACTIVITY)
        const ld = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }
        const tk = ld(new Date())
        const todays = saved.filter((b) => (b.createdAt ? ld(b.createdAt) : b.date) === tk)
        console.log('[OilDesk] dashboard loaded → bills:', saved.length, '| today:', todays.length, '| todayKey:', tk, saved)
      } catch (e) { console.warn('[OilDesk] dashboard load error', e) }
    }
    refresh()
    // Re-read when returning to the tab or when another tab updates the data.
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    getStocks()
      .then((res) => {
        const rows = res.data && res.data.stock
        if (Array.isArray(rows) && rows.length) {
          setStocks(rows.map((s) => ({
            name: s.name,
            tank: s.tank,
            current: Number(s.current_litres),
            capacity: Number(s.capacity_litres),
            threshold: Number(s.threshold_litres),
            unit: 'L',
          })))
        }
      })
      .catch(() => {}) // keep fallback defaults if the API isn't reachable
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/signin', { replace: true })
  }

  if (!user) return null

  // ── Live summary, computed from saved bills (never hardcoded) ───────────────
  const localDay = (d) => {
    const x = new Date(d)
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  }
  const todayKey = localDay(new Date())
  // Filter by the bill's creation date (createdAt); fall back to the invoice date for older bills.
  const billDay = (b) => (b.createdAt ? localDay(b.createdAt) : b.date)
  const sum = (arr, k) => arr.reduce((s, b) => s + (Number(b[k]) || 0), 0)
  const todaysBills = bills.filter((b) => billDay(b) === todayKey)
  const creditBills = bills.filter((b) => b.status === 'credit')
  const creditCustomers = new Set(creditBills.map((b) => b.customer)).size
  const rs = (n) => 'Rs. ' + Math.round(n).toLocaleString('en-IN')

  const stats = [
    { label: "Today's sales", value: rs(sum(todaysBills, 'amount')), sub: `${todaysBills.length} bill${todaysBills.length === 1 ? '' : 's'} today` },
    { label: 'Bills issued', value: String(todaysBills.length), sub: 'Today' },
    { label: 'VAT collected', value: rs(sum(todaysBills, 'vat')), sub: '13% on sales' },
    { label: 'Credit outstanding', value: rs(sum(creditBills, 'amount')), sub: `${creditCustomers} customer${creditCustomers === 1 ? '' : 's'} unpaid`, subType: sum(creditBills, 'amount') > 0 ? 'dn' : undefined },
  ]

  // ── Weekly sales, computed from saved bills (Mon–Sun of the current week) ────
  const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const salesOn = (date) => sum(bills.filter((b) => billDay(b) === localDay(date)), 'amount')
  const monday = new Date()
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)) // back to Monday
  const weekly = LABELS.map((day, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    return { day, amount: salesOn(d) }
  })
  // Real week-over-week change (same elapsed days last week vs this week).
  const elapsed = ((new Date().getDay() + 6) % 7) + 1 // days into this week so far
  const weekTotal = weekly.slice(0, elapsed).reduce((s, d) => s + d.amount, 0)
  let prevTotal = 0
  for (let i = 0; i < elapsed; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() - 7 + i)
    prevTotal += salesOn(d)
  }
  const weekDelta = prevTotal > 0 ? Math.round(((weekTotal - prevTotal) / prevTotal) * 100) : null

  return (
    <div className="db-layout">
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
        navigate={navigate}
      />
      <div className="db-main">
        <TopBar onMenu={() => setSidebarOpen(true)} user={user} onLogout={() => setShowLogout(true)} navigate={navigate} />
        <main className="db-content">
          <CounterPanel navigate={navigate} />
          <div className="stats-row">
            {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
          </div>
          <div className="dash-cols">
            <div className="dash-col">
              <TransactionTable transactions={transactions} loading={loading} limit={3} onViewAll={() => setShowAllTxn(true)} />
              <ActivityFeed activity={activity} loading={loading} limit={3} onViewAll={() => setShowAllActivity(true)} />
            </div>
            <div className="dash-col">
              <WeeklyChart data={weekly} delta={weekDelta} loading={loading} />
              <div className="side-by-side">
                <StockLevels stocks={stocks} loading={loading} />
                <Commodities />
              </div>
            </div>
          </div>
        </main>
      </div>
      <LogoutModal
        open={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />

      {showAllTxn && (
        <div className="dash-modal-overlay" onClick={() => setShowAllTxn(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dash-modal-close" onClick={() => setShowAllTxn(false)} aria-label="Close">×</button>
            <TransactionTable transactions={transactions} loading={false} limit={10} />
          </div>
        </div>
      )}

      {showAllActivity && (
        <div className="dash-modal-overlay" onClick={() => setShowAllActivity(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dash-modal-close" onClick={() => setShowAllActivity(false)} aria-label="Close">×</button>
            <ActivityFeed activity={activity} loading={false} limit={10} />
          </div>
        </div>
      )}
    </div>
  )
}
