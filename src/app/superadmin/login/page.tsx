"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function SuperAdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.status === "success") {
                localStorage.setItem("admin_token", data.token);
                router.push("/superadmin");
            } else {
                setError("Giriş Başarısız: " + data.error);
            }
        } catch (err) {
            setError("Sunucuya bağlanılamadı.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-2">🛠️</div>
                    <h1 className="text-2xl font-bold text-white">Superadmin Girişi</h1>
                    <p className="text-gray-500 text-sm">GastroMind Platform Yönetimi</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}
