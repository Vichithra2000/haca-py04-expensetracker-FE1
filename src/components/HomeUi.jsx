import { useState, useMemo, useEffect } from "react";
import API from "../api/axios";


const CATEGORIES = [
    { value: "FOOD", label: "Food", icon: "🍜", color: "bg-orange-100 text-orange-600" },
    { value: "TRAVEL", label: "Transport", icon: "🚗", color: "bg-blue-100 text-blue-600" },
    { value: "SHOPPING", label: "Shopping", icon: "🛍️", color: "bg-pink-100 text-pink-600" },
    { value: "HEALTH", label: "Health", icon: "💊", color: "bg-green-100 text-green-600" },
    { value: "BILLS", label: "Bills", icon: "📄", color: "bg-yellow-100 text-yellow-700" },
    { value: "OTHER", label: "Other", icon: "✦", color: "bg-purple-100 text-purple-600" },
];


function getCategoryMeta(value) {
    return CATEGORIES.find((c) => c.value === value) || CATEGORIES[5];
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatRelativeDate(date) {
    const today = new Date();
    const d = new Date(date);
    const diff = Math.floor((today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ExpenseTracker({ onLogout }) {
     useEffect(() => {
         listExpenses();
        // userDetailetch()
     }, [])


    const expenseListApi = () => API.get("api/expense/list/")
    const expenseAddApi = (data) =>API.post("api/expense/create/",data)
    const expenseDeleteApi = (data) => API.post("api/expense/delete/", data)
    const userDetailApi = () => API.get("api/user-details/")
    const aiOverviewApi = () => API.get("api/expense/ai-overview/")

    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [form, setForm] = useState({ note: "", amount: "", category: "FOOD" });
    const [formError, setFormError] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [user, setUser] = useState(null);
    const [aiOverView, setAiOverView] = useState("Loading AI Overview.....");

    const today = new Date();
    const todayStr = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const monthTotal = useMemo(() =>
        expenses
            ?.filter((e) => {
                const d = new Date(e.created_date);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((sum, e) => sum + e.amount, 0),
        [expenses]
    );

    const recent = useMemo(() =>
        expenses ? [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)) : [],
        [expenses]
    );

    const listExpenses = async () => {
        const res = await expenseListApi()
        console.log(res.data);
        setExpenses(res.data)
    }

    const userDetailetch = async () => {
        const res = await userDetailApi()
        setUser(res?.data)
    }
     //const expenseListApi = () =>API.post("api/expense/list/")
     //const expenseAddApi = (data) =>API.post("api/expense/create/",data)
   

    const handleAdd = async () => {
        if (!form.note.trim()) { setFormError("Please enter a note."); return; }
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) { setFormError("Enter a valid amount."); return; }
        const res = await expenseAddApi({
            'amount': form.amount,
            'note': form.note,
            'category': form.category,
        })
           listExpenses()
           setForm({ note: "", amount: "", category: "FOOD" });
           setFormError("");
           setShowModal(false);
    };

    const handleDelete = async (id) => {
        await expenseDeleteApi({ id: id })
        setDeleteId(null);
        listExpenses()
    };

    const logout = () => {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        onLogout()
    }

    const showAiOverview = async () => {
        setShowAIModal(true)
        const res = await aiOverviewApi()
        setAiOverView(res.data)
    }

    return (
        <div className="min-h-screen bg-[#f5f0eb] font-sans" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <button
                className="bg-[#c9a96e] hover:bg-[#b8935a] active:scale-95 transition-all duration-200 text-white font-semibold rounded-xl float-end p-2 m-2"
                style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                type="button"
                onClick={logout}>Logout</button>
            {/* Background texture */}
            <div className="fixed inset-0 pointer-events-none opacity-30"
                style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #e8d5c4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #d4c5b8 0%, transparent 50%)" }} />

            <div className="relative max-w-md mx-auto px-4 pt-10 pb-24">

                <p className="text-center text-xs tracking-widest uppercase text-stone-400 mb-6 font-mono"
                    style={{ fontFamily: "monospace", letterSpacing: "0.2em" }}>
                    Hello {user?.name}!
                </p>
                {/* Date */}
                <p className="text-center text-xs tracking-widest uppercase text-stone-400 mb-6 font-mono"
                    style={{ fontFamily: "monospace", letterSpacing: "0.2em" }}>
                    {todayStr}
                </p>

                {/* Total Card */}
                <div className="relative bg-[#1c1917] rounded-3xl px-8 py-10 text-center mb-8 shadow-2xl overflow-hidden">
                    {/* Decorative rings */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full border border-stone-700 opacity-40" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border border-stone-700 opacity-30" />

                    <p className="text-stone-400 text-xs tracking-widest uppercase mb-3" style={{ letterSpacing: "0.18em" }}>
                        Total Expenses
                    </p>
                    <p className="text-xs text-stone-500 mb-2 font-mono">
                        {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </p>
                    <h1 className="text-5xl font-bold text-white mb-1" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}>
                        {formatCurrency(monthTotal)}
                    </h1>
                    <div className="mt-4 h-px bg-gradient-to-r from-transparent via-stone-600 to-transparent" />
                    <p className="text-stone-500 text-xs mt-3 font-mono">{expenses?.length} transactions total</p>
                </div>

                {/* Add Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center justify-center gap-3 bg-[#c9a96e] hover:bg-[#b8935a] active:scale-95 transition-all duration-200 text-white font-semibold rounded-2xl py-4 text-base shadow-lg mb-8"
                    style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                >
                    <span className="text-xl leading-none">+</span>
                    <span className="uppercase text-sm tracking-widest">Add Expense</span>
                </button>

                {/* Recent Expenses */}
                <div>
                    <h2 className="text-stone-500 text-xs tracking-widest uppercase mb-4 font-mono" style={{ letterSpacing: "0.18em" }}>
                        Recent Expenses
                    </h2>

                    {recent.length === 0 && (
                        <div className="text-center py-16 text-stone-400 text-sm">
                            <p className="text-3xl mb-3">🪴</p>
                            <p>No expenses yet. Add your first one!</p>
                        </div>
                    )}
                    
                    <ul className="space-y-3">
                        {recent.map((exp,index) => {
                            const cat = getCategoryMeta(exp.category);
                            return (
                                <li key={index}
                                    className="bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                    
                                    {/* Icon */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat.color}`}>
                                        {cat.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-stone-800 truncate text-sm" style={{ fontFamily: "'Georgia', serif" }}>
                                            {exp.note}
                                        </p>
                                        <p className="text-xs text-stone-400 font-mono mt-0.5">
                                            {cat.label} · {formatRelativeDate(exp.created_date)}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="font-bold text-stone-800 text-sm font-mono">
                                            {formatCurrency(exp.amount)}
                                        </span>
                                        <button
                                            onClick={() => setDeleteId(exp.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-400 text-lg leading-none w-6 h-6 flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </div>
            </div>

            <button
                className="bg-[#c9a96e] hover:bg-[#b8935a] active:scale-95 transition-all duration-200 text-white font-semibold rounded-xl float-end p-4 m-4 fixed right-0 bottom-0"
                style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                type="button"
                onClick={showAiOverview}
            >AI Overview</button>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowModal(false); setFormError(""); }} />
                    <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>New Expense</h3>
                            <button onClick={() => { setShowModal(false); setFormError(""); }}
                                className="text-stone-400 hover:text-stone-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors">
                                ×
                            </button>
                        </div>

                        {/* Note */}
                        <div className="mb-4">
                            <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">Note</label>
                            <input
                                type="text"
                                placeholder="What did you spend on?"
                                value={form.note}
                                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300"
                            />
                        </div>

                        {/* Amount */}
                        <div className="mb-4">
                            <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={form.amount}
                                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300 font-mono"
                            />
                        </div>

                        {/* Category */}
                        <div className="mb-5">
                            <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-2">Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-mono transition-all duration-150 ${form.category === cat.value
                                            ? "border-[#c9a96e] bg-[#fdf6ec] text-[#b8935a]"
                                            : "border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200"
                                            }`}
                                    >
                                        <span className="text-base">{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formError && <p className="text-red-500 text-xs font-mono mb-3">⚠ {formError}</p>}

                        <button
                            onClick={handleAdd}
                            className="w-full bg-[#1c1917] hover:bg-stone-800 active:scale-95 transition-all text-white font-semibold rounded-2xl py-3.5 text-sm font-mono uppercase tracking-widest"
                        >
                            Save Expense
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-xs w-full shadow-2xl z-10 text-center">
                        <p className="text-2xl mb-2">🗑️</p>
                        <h4 className="font-bold text-stone-800 mb-1" style={{ fontFamily: "'Georgia', serif" }}>Delete Expense?</h4>
                        <p className="text-stone-400 text-xs font-mono mb-5">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)}
                                className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-2.5 text-sm font-mono hover:bg-stone-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteId)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-mono transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAIModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowModal(false); setFormError(""); }} />
                    <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Georgia', serif" }}>AI Overview</h3>
                            <button onClick={() => { setShowAIModal(false) }}
                                className="text-stone-400 hover:text-stone-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors">
                                ×
                            </button>
                        </div>

                        {/* Note */}
                        <div className="mb-4">
                            <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">Summary</label>
                            <Markdown>{aiOverView}</Markdown>
                        </div>


                        <button
                            onClick={() => { setShowAIModal(false) }}
                            className="w-full bg-[#1c1917] hover:bg-stone-800 active:scale-95 transition-all text-white font-semibold rounded-2xl py-3.5 text-sm font-mono uppercase tracking-widest"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}