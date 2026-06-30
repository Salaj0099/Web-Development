// Reports — pure helpers that turn saved bills + live stock into report figures.
// Everything here is derived from real application data (localStorage bills,
// backend stock levels, saved fuel rates). No placeholder numbers.

export const FUELS = [
  { name: "Petrol", key: "petrol", color: "#c85a00" },
  { name: "Diesel", key: "diesel", color: "#2456b8" },
  { name: "Kerosene", key: "kerosene", color: "#16a34a" },
]

export const PAYMENTS = [
  { name: "Cash", color: "#16a34a" },
  { name: "Credit", color: "#2456b8" },
  { name: "Cheque", color: "#c85a00" },
  { name: "QR Payment", color: "#7c3aed" },
]

const OVERDUE_DAYS = 30

export const localDay = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`
}

export const billDay = (b) => (b.createdAt ? localDay(b.createdAt) : b.date)

const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d }
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0)
const daysSince = (b) => {
  const t = b.createdAt || (b.date ? new Date(b.date + "T00:00:00").getTime() : Date.now())
  return Math.floor((Date.now() - t) / 86400000)
}

// ── Date range presets ──────────────────────────────────────────────────────
export const presetRange = (preset, customFrom, customTo) => {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const today = localDay(now)
  switch (preset) {
    case "today": return { from: today, to: today, label: "Today" }
    case "yesterday": { const y = localDay(addDays(now, -1)); return { from: y, to: y, label: "Yesterday" } }
    case "week": {
      const mon = addDays(now, -((now.getDay() + 6) % 7))
      return { from: localDay(mon), to: today, label: "This week" }
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: localDay(first), to: today, label: "This month" }
    }
    case "custom":
      return { from: customFrom || today, to: customTo || today, label: "Custom range" }
    default: return { from: today, to: today, label: "Today" }
  }
}

export const daysInRange = (from, to) => {
  const out = []
  let d = new Date(from + "T00:00:00")
  const end = new Date(to + "T00:00:00")
  if (isNaN(d) || isNaN(end) || d > end) return [from]
  while (d <= end) { out.push(localDay(d)); d = addDays(d, 1) }
  return out
}

// ── Per-fuel breakdown of a single bill ──────────────────────────────────────
const parseLitres = (itemsStr = "") =>
  itemsStr.split(",").map((seg) => {
    const m = seg.match(/([A-Za-z]+)\s*[—-]\s*([\d.]+)\s*L/i)
    return m ? { fuel: m[1], qty: Number(m[2]) || 0 } : null
  }).filter(Boolean)

export const billLines = (bill, rates = {}) => {
  if (Array.isArray(bill.lines) && bill.lines.length) {
    return bill.lines.map((l) => ({
      fuel: l.fuel,
      key: l.key || (FUELS.find((f) => f.name === l.fuel) || {}).key || null,
      qty: Number(l.qty) || 0,
      amount: Number(l.amount) || 0,
    }))
  }
  // Legacy bills: recover litres from the items string and split the real bill
  // total across fuels weighted by qty × current rate (exact for single-fuel bills).
  const parsed = parseLitres(bill.items)
  const weighted = parsed.map((p) => {
    const meta = FUELS.find((f) => f.name.toLowerCase() === p.fuel.toLowerCase())
    const key = meta ? meta.key : null
    const rate = (key && Number(rates[key])) || 1
    return { fuel: meta ? meta.name : p.fuel, key, qty: p.qty, w: p.qty * rate }
  })
  const totalW = weighted.reduce((s, x) => s + x.w, 0) || 1
  return weighted.map((x) => ({
    fuel: x.fuel, key: x.key, qty: x.qty,
    amount: Number(((Number(bill.amount) || 0) * (x.w / totalW)).toFixed(2)),
  }))
}

const billLitres = (bill, rates) =>
  bill.litres != null ? Number(bill.litres) : billLines(bill, rates).reduce((s, l) => s + l.qty, 0)

// ── Main aggregator ───────────────────────────────────────────────────────────
// stocks: [{ product, name, current, capacity, threshold }]
export const computeReport = (bills = [], stocks = [], rates = {}, range) => {
  const inRange = (b) => { const d = billDay(b); return d >= range.from && d <= range.to }
  const periodBills = bills.filter(inRange)
  const stockFor = (key) =>
    stocks.find((s) => s.product === key || (s.name || "").toLowerCase() === key) || null

  // Sales
  const total = sum(periodBills, (b) => b.amount)
  const count = periodBills.length
  const litres = sum(periodBills, (b) => billLitres(b, rates))
  const byPayment = PAYMENTS.map((p) => {
    const bs = periodBills.filter((b) => (b.payment || "Cash") === p.name)
    return { ...p, amount: sum(bs, (b) => b.amount), count: bs.length }
  })

  // Fuel
  const fuel = FUELS.map((f) => {
    let lit = 0, amt = 0
    periodBills.forEach((b) =>
      billLines(b, rates).forEach((l) => { if (l.key === f.key) { lit += l.qty; amt += l.amount } }))
    const st = stockFor(f.key)
    return {
      name: f.name, key: f.key, color: f.color,
      litres: lit, amount: amt,
      remaining: st ? Number(st.current) : null,
      capacity: st ? Number(st.capacity) : null,
    }
  })

  // Credit
  const creditBills = periodBills.filter((b) => b.status === "credit")
  const overdueBills = creditBills.filter((b) => daysSince(b) > OVERDUE_DAYS)
  const collectedBills = bills.filter(
    (b) => b.collection && b.collection.at &&
      localDay(b.collection.at) >= range.from && localDay(b.collection.at) <= range.to)
  const credit = {
    outstanding: sum(creditBills, (b) => b.amount),
    pending: sum(creditBills, (b) => b.amount),
    pendingCount: creditBills.length,
    collected: sum(collectedBills, (b) => b.amount),
    collectedCount: collectedBills.length,
    cleared: sum(collectedBills.filter((b) => b.collection.cleared), (b) => b.amount),
    overdue: sum(overdueBills, (b) => b.amount),
    overdueCount: overdueBills.length,
  }

  // Cheque
  const chequeBills = periodBills.filter((b) => b.payment === "Cheque")
  const clearedCheques = chequeBills.filter((b) => b.collection && b.collection.cleared)
  const pendingCheques = chequeBills.filter((b) => b.status === "credit")
  const bouncedCheques = chequeBills.filter((b) => b.collection && b.collection.cleared === false)
  const cheque = {
    total: sum(chequeBills, (b) => b.amount), totalCount: chequeBills.length,
    cleared: sum(clearedCheques, (b) => b.amount), clearedCount: clearedCheques.length,
    pending: sum(pendingCheques, (b) => b.amount), pendingCount: pendingCheques.length,
    bounced: sum(bouncedCheques, (b) => b.amount), bouncedCount: bouncedCheques.length,
  }

  // VAT
  const vat = sum(periodBills, (b) => b.vat)

  // Stock (opening / added need a movement log we don't keep — flagged as untracked)
  const stock = FUELS.map((f) => {
    const st = stockFor(f.key)
    const sold = fuel.find((x) => x.key === f.key).litres
    return {
      name: f.name, key: f.key,
      current: st ? Number(st.current) : null,
      capacity: st ? Number(st.capacity) : null,
      threshold: st ? Number(st.threshold) : null,
      sold,
      low: st ? Number(st.current) <= Number(st.threshold) : false,
    }
  })

  // Daily summary — only the cash-flow figures we can derive honestly
  const cashIn = byPayment.find((p) => p.name === "Cash").amount +
    byPayment.find((p) => p.name === "QR Payment").amount
  const daily = {
    income: cashIn,                 // money actually received at the counter (cash + QR)
    collections: credit.collected,  // credit cleared during the period
    creditGiven: sum(creditBills, (b) => b.amount),
    vat,
  }

  // Charts
  const trend = daysInRange(range.from, range.to).map((day) => ({
    day,
    amount: sum(periodBills.filter((b) => billDay(b) === day), (b) => b.amount),
  }))
  const paymentDist = byPayment
    .filter((p) => p.amount > 0)
    .map((p) => ({ ...p, pct: total > 0 ? Math.round((p.amount / total) * 100) : 0 }))
  const creditProgress = (() => {
    const base = credit.collected + credit.outstanding
    return { collected: credit.collected, outstanding: credit.outstanding,
      pct: base > 0 ? Math.round((credit.collected / base) * 100) : 0 }
  })()

  return {
    isEmpty: count === 0,
    sales: { total, count, litres, avg: count ? total / count : 0, byPayment },
    fuel, credit, cheque, vat, stock, daily,
    charts: { trend, fuelCompare: fuel, paymentDist, creditProgress },
  }
}
