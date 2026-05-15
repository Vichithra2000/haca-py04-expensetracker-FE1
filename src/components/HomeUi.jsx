import { useState, useMemo } from "react";

const CATEGORIES = [
  { id: "food",          label: "Food & Dining",   emoji: "🍽️", bg: "#FFF0E6", color: "#D95F00" },
  { id: "transport",     label: "Transport",        emoji: "🚗", bg: "#E6F0FF", color: "#1A56DB" },
  { id: "shopping",      label: "Shopping",         emoji: "🛍️", bg: "#FDE8F0", color: "#C0175D" },
  { id: "health",        label: "Health",           emoji: "💊", bg: "#E6FAF0", color: "#0A7A45" },
  { id: "entertainment", label: "Entertainment",    emoji: "🎬", bg: "#F0EAFF", color: "#6B21A8" },
  { id: "utilities",     label: "Utilities",        emoji: "⚡", bg: "#FEFCE8", color: "#92400E" },
  { id: "other",         label: "Other",            emoji: "📦", bg: "#F3F4F6", color: "#4B5563" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function getCat(id)  { return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[6]; }
function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function humanDate(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const SEED = [
  { id: 1, title: "Grocery Store",    amount: 82.5,  category: "food",          date: daysAgo(1) },
  { id: 2, title: "Metro Card",       amount: 45.0,  category: "transport",     date: daysAgo(2) },
  { id: 3, title: "Netflix",          amount: 15.99, category: "entertainment", date: daysAgo(3) },
  { id: 4, title: "Electricity Bill", amount: 120.0, category: "utilities",     date: daysAgo(4) },
  { id: 5, title: "Pharmacy",         amount: 34.5,  category: "health",        date: daysAgo(5) },
];

let uid = 300;

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(SEED);
  const [modal, setModal]       = useState(false);
  const [editTarget, setEdit]   = useState(null);
  const [form, setForm]         = useState(blank());
  const [errs, setErrs]         = useState({});
  const [confirmId, setConfirm] = useState(null);
  const [toast, setToast]       = useState(null);
  const [hoveredId, setHovered] = useState(null);

  const now = new Date();
  const todayLabel = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const monthTotal = useMemo(() => {
    const m = now.getMonth(), y = now.getFullYear();
    return expenses
      .filter((e) => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const sorted = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)), [expenses]);

  function blank() { return { title: "", amount: "", category: "food", date: todayStr() }; }

  function fire(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }
  function openAdd()  { setEdit(null); setForm(blank()); setErrs({}); setModal(true); }
  function openEdit(exp) {
    setEdit(exp);
    setForm({ title: exp.title, amount: String(exp.amount), category: exp.category, date: exp.date });
    setErrs({}); setModal(true);
  }
  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) e.amount = "Enter a valid amount";
    return e;
  }
  function save() {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    if (editTarget) {
      setExpenses((p) => p.map((x) => x.id === editTarget.id ? { ...x, ...form, amount: +form.amount } : x));
      fire("Expense updated ✓");
    } else {
      setExpenses((p) => [{ id: uid++, ...form, amount: +form.amount }, ...p]);
      fire("Expense added ✓");
    }
    setModal(false);
  }
  function remove(id) {
    setExpenses((p) => p.filter((e) => e.id !== id));
    setConfirm(null);
    fire("Expense deleted.", "err");
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: "#F1F5F9",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
    },
    container: {
      maxWidth: 460,
      margin: "0 auto",
      padding: "40px 16px 100px",
    },
    dateLabel: {
      textAlign: "center",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#94A3B8",
      marginBottom: 28,
    },
    heroCard: {
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      borderRadius: 28,
      padding: "36px 24px 40px",
      marginBottom: 24,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(15,23,42,0.35)",
    },
    heroSub: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "#64748B",
      marginBottom: 10,
    },
    heroAmount: {
      fontSize: 52,
      fontWeight: 800,
      color: "#FFFFFF",
      letterSpacing: "-2px",
      lineHeight: 1,
      marginBottom: 8,
    },
    heroCount: { fontSize: 12, color: "#475569", marginBottom: 28 },
    addBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#FFFFFF",
      color: "#0F172A",
      fontWeight: 700,
      fontSize: 14,
      padding: "14px 32px",
      borderRadius: 18,
      border: "none",
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      transition: "transform 0.15s",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      padding: "0 2px",
    },
    sectionTitle: {
      fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
      textTransform: "uppercase", color: "#94A3B8",
    },
    sectionCount: { fontSize: 12, color: "#94A3B8" },
    emptyBox: {
      textAlign: "center", padding: "60px 0", color: "#94A3B8", fontSize: 14,
    },
    expenseCard: {
      background: "#FFFFFF",
      borderRadius: 20,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
      border: "1px solid #E2E8F0",
      transition: "box-shadow 0.2s",
    },
    catIcon: (cat) => ({
      width: 44, height: 44, borderRadius: 14,
      background: cat.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0,
    }),
    expTitle: {
      fontWeight: 600, fontSize: 14, color: "#1E293B",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      marginBottom: 4,
    },
    catPill: (cat) => ({
      display: "inline-block",
      fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 20,
      background: cat.bg, color: cat.color,
      marginRight: 6,
    }),
    dateText: { fontSize: 11, color: "#94A3B8" },
    amount: {
      fontWeight: 800, fontSize: 15, color: "#0F172A",
      flexShrink: 0, marginRight: 4,
    },
    iconBtn: (danger) => ({
      width: 32, height: 32, borderRadius: 10,
      background: danger ? "#FEF2F2" : "#F8FAFC",
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "background 0.15s",
    }),
    overlay: {
      position: "fixed", inset: 0, zIndex: 40,
      background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: 16,
    },
    overlayCenter: {
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    },
    modalCard: {
      background: "#FFFFFF", width: "100%", maxWidth: 440,
      borderRadius: 28, padding: 24,
      boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
    },
    modalHeader: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 20,
    },
    modalTitle: { fontSize: 16, fontWeight: 700, color: "#0F172A" },
    closeBtn: {
      width: 32, height: 32, borderRadius: "50%",
      background: "#F1F5F9", border: "none", cursor: "pointer",
      fontSize: 20, color: "#64748B", display: "flex",
      alignItems: "center", justifyContent: "center",
    },
    fieldLabel: {
      display: "block", fontSize: 11, fontWeight: 700,
      color: "#94A3B8", letterSpacing: "0.14em",
      textTransform: "uppercase", marginBottom: 6,
    },
    input: (hasErr) => ({
      width: "100%", padding: "12px 14px", fontSize: 14,
      fontFamily: "inherit",
      background: "#F8FAFC",
      border: `1px solid ${hasErr ? "#EF4444" : "#E2E8F0"}`,
      borderRadius: 12, outline: "none",
      color: "#1E293B", boxSizing: "border-box",
    }),
    errMsg: { fontSize: 11, color: "#EF4444", marginTop: 4 },
    catGrid: {
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 4,
    },
    catBtn: (active, cat) => ({
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4, padding: "10px 4px",
      borderRadius: 14,
      border: `1.5px solid ${active ? "#0F172A" : "#E2E8F0"}`,
      background: active ? "#0F172A" : "#F8FAFC",
      color: active ? "#FFFFFF" : "#475569",
      fontSize: 10, fontWeight: 700, cursor: "pointer",
      transition: "all 0.15s",
      transform: active ? "scale(1.05)" : "scale(1)",
    }),
    modalFooter: { display: "flex", gap: 10, marginTop: 20 },
    cancelBtn: {
      flex: 1, padding: "13px 0", borderRadius: 14,
      fontSize: 14, fontWeight: 600, color: "#475569",
      background: "#F1F5F9", border: "none", cursor: "pointer",
    },
    saveBtn: {
      flex: 1, padding: "13px 0", borderRadius: 14,
      fontSize: 14, fontWeight: 700, color: "#FFFFFF",
      background: "#0F172A", border: "none", cursor: "pointer",
    },
    toast: (type) => ({
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 60, padding: "10px 22px", borderRadius: 20,
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      background: type === "err" ? "#EF4444" : "#10B981",
      color: "#FFFFFF", whiteSpace: "nowrap",
    }),
  };

  return (
    <div style={S.page}>

      {/* Toast */}
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.container}>

        {/* ① Today's Date */}
        <p style={S.dateLabel}>{todayLabel}</p>

        {/* ② Hero Card */}
        <div style={S.heroCard}>
          <p style={S.heroSub}>Total Expenses This Month</p>
          <div style={S.heroAmount}>{formatINR(monthTotal)}</div>
          <p style={S.heroCount}>{expenses.length} transaction{expenses.length !== 1 ? "s" : ""} recorded</p>

          {/* ③ Add Expense Button */}
          <button
            style={S.addBtn}
            onClick={openAdd}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M7 1v12M1 7h12" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add Expense
          </button>
        </div>

        {/* ④ Section Header */}
        <div style={S.sectionHeader}>
          <span style={S.sectionTitle}>Recent Expenses</span>
          <span style={S.sectionCount}>{sorted.length} entries</span>
        </div>

        {/* ④ Expense List */}
        {sorted.length === 0 ? (
          <div style={S.emptyBox}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
            No expenses yet.<br />
            <span style={{ color: "#475569", fontWeight: 600 }}>Tap Add Expense to begin!</span>
          </div>
        ) : (
          sorted.map((exp) => {
            const cat = getCat(exp.category);
            const hovered = hoveredId === exp.id;
            return (
              <div
                key={exp.id}
                style={{ ...S.expenseCard, boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.08)" : "none" }}
                onMouseEnter={() => setHovered(exp.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={S.catIcon(cat)}>{cat.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.expTitle}>{exp.title}</div>
                  <div>
                    <span style={S.catPill(cat)}>{cat.label}</span>
                    <span style={S.dateText}>{humanDate(exp.date)}</span>
                  </div>
                </div>
                <span style={S.amount}>{formatINR(exp.amount)}</span>
                <button style={S.iconBtn(false)} onClick={() => openEdit(exp)} title="Edit">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M9.5 2L12 4.5 4.5 12H2v-2.5L9.5 2z" stroke="#64748B" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </button>
                <button style={S.iconBtn(true)} onClick={() => setConfirm(exp.id)} title="Delete">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l1 8h6l1-8H3z"
                      stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div style={S.modalCard}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>{editTarget ? "Edit Expense" : "New Expense"}</h3>
              <button style={S.closeBtn} onClick={() => setModal(false)}>×</button>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={S.fieldLabel}>Title</label>
              <input
                style={S.input(errs.title)}
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Grocery run"
              />
              {errs.title && <p style={S.errMsg}>{errs.title}</p>}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <label style={S.fieldLabel}>Amount (₹)</label>
              <input
                style={S.input(errs.amount)}
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errs.amount && <p style={S.errMsg}>{errs.amount}</p>}
            </div>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <label style={S.fieldLabel}>Category</label>
              <div style={S.catGrid}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    style={S.catBtn(form.category === c.id, c)}
                    onClick={() => setForm({ ...form, category: c.id })}
                  >
                    <span style={{ fontSize: 18 }}>{c.emoji}</span>
                    {c.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: 4 }}>
              <label style={S.fieldLabel}>Date</label>
              <input
                style={S.input(false)}
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
              <button style={S.saveBtn} onClick={save}>
                {editTarget ? "Save Changes" : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmId !== null && (
        <div style={S.overlayCenter} onClick={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div style={{ ...S.modalCard, maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🗑️</div>
            <h3 style={{ ...S.modalTitle, marginBottom: 6 }}>Delete Expense?</h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>This cannot be undone.</p>
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => setConfirm(null)}>Cancel</button>
              <button
                style={{ ...S.saveBtn, background: "#EF4444" }}
                onClick={() => remove(confirmId)}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}