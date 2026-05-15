import { useState } from "react";
import  axios  from "axios";

export default function Login( {onLogin} ) {
    const [tab, setTab] = useState("login"); // "login" | "signup"
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        console.log(tab === "signup");

        if (tab === "signup" && !form.name.trim()) e.name = "Name is required.";
        if (tab === "signup" && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))) e.email = "Enter a valid email.";
        if (!form.password || form.password.length < 4) e.password = "Password must be at least 4 characters.";
        if (!form.username.trim()) e.username = "Username is required.";
        console.log(e);

        return e;
    };

    const login = (data) => axios.post("http://127.0.0.1:8000/api/token/", data)
    
    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        console.log(form.username)
        console.log(form.password)
        
        
            try {
                const res = await login({ username: form.username, password: form.password })
                console.log(res.data);
                localStorage.setItem("access", res.data.access)
                localStorage.setItem("refresh", res.data.refresh)
                onLogin()
            }
              
             catch (error) 
               {
                if(error?.response?.status == 401){
                 setErrors({"login":error.response.data.detail})
                }else{
                 setErrors({"login":"Server not reachable"})
               }
               }
    
    }
   
    const handleChange = (field) => (ev) => {
        setForm((f) => ({ ...f, [field]: ev.target.value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4 py-10"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none opacity-30"
                style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #e8d5c4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #d4c5b8 0%, transparent 50%)" }} />

            <div className="relative w-full max-w-sm">

                {/* Date */}
                <p className="text-center text-xs tracking-widest uppercase text-stone-400 mb-8 font-mono"
                    style={{ letterSpacing: "0.2em" }}>
                    {today}
                </p>

                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1c1917] mb-4 shadow-lg">
                        <span className="text-2xl">✦</span>
                    </div>
                    <h1 className="text-2xl font-bold text-stone-800" style={{ letterSpacing: "-0.02em" }}>
                        Expense Tracker
                    </h1>
                    <p className="text-stone-400 text-xs font-mono mt-1 tracking-wide">
                        {tab === "login" ? "Welcome back. Sign in to continue." : "Create your account to get started."}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    {/* Tab switcher */}
                    <div className="flex border-b border-stone-100">
                        {["login", "signup"].map((t) => (
                            <button key={t} onClick={() => { setTab(t); setErrors({}); setForm({ name: "", username: "", email: "", password: "" }); }}
                                className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-colors duration-200 ${tab === t
                                    ? "text-stone-800 border-b-2 border-[#c9a96e] bg-[#fdf6ec]"
                                    : "text-stone-400 hover:text-stone-600"
                                    }`}>
                                {t === "login" ? "Sign In" : "Sign Up"}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 space-y-4">

                        {/* Name (signup only) */}
                        {tab === "signup" && (
                            <>
                                <div>
                                    <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={handleChange("name")}
                                        className={`w-full border rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300 transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-stone-200"
                                            }`}
                                    />
                                    {errors.name && <p className="text-red-400 text-xs font-mono mt-1">⚠ {errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange("email")}
                                        className={`w-full border rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300 transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200"
                                            }`}
                                    />
                                    {errors.email && <p className="text-red-400 text-xs font-mono mt-1">⚠ {errors.email}</p>}
                                </div>
                            </>
                        )}



                        {/* Username */}
                        <div>
                            <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="example"
                                value={form.username}
                                onChange={handleChange("username")}
                                className={`w-full border rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300 transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-stone-200"
                                    }`}
                            />
                            {errors.username && <p className="text-red-400 text-xs font-mono mt-1">⚠ {errors.username}</p>}
                        </div>

                        {/* Password */}
                        

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-mono text-stone-500 uppercase tracking-widest">
                                    Password
                                </label>
                                {tab === "login" && (
                                    <button className="text-xs font-mono text-[#c9a96e] hover:text-[#b8935a] transition-colors">
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent placeholder:text-stone-300 transition-all ${errors.password ? "border-red-300 bg-red-50" : "border-stone-200"
                                        }`}
                                />
                                <button
                                    onClick={() => setShowPass((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm font-mono transition-colors"
                                >
                                    {showPass ? "hide" : "show"}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs font-mono mt-1">⚠ {errors.password}</p>}
                        </div>

                        {errors.login && <p className="text-red-400 text-xs font-mono mt-1">⚠ {errors.login}</p>}
                    
                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-[#1c1917] hover:bg-stone-800 active:scale-95 disabled:opacity-70 disabled:scale-100 transition-all duration-200 text-white font-semibold rounded-2xl py-3.5 text-sm font-mono uppercase tracking-widest mt-2 flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{tab === "login" ? "Signing in…" : "Creating…"}</span>
                                </>
                            ) : (
                                tab === "login" ? "Sign In" : "Create Account"
                            )}
                        </button>

                    </div>
                </div>

                {/* Footer switch */}
                <p className="text-center text-xs font-mono text-stone-400 mt-6">
                    {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); setErrors({}); setForm({ name: "", username: "", email: "", password: "" }); }}
                        className="text-[#c9a96e] hover:text-[#b8935a] transition-colors underline underline-offset-2">
                        {tab === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>

                <p className="text-center text-xs font-mono text-stone-300 mt-4">
                    © {new Date().getFullYear()} Expense Tracker
                </p>
            </div>
        </div>
    );
    }
