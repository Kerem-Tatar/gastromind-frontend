"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface RestaurantRow {
    _id: string;
    name: string;
    slug: string;
    type: string;
    tables_count: number;
    ownerUsername: string | null;
}

export default function SuperAdminDashboard() {
    const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    // Yeni restoran formu
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [ownerUsername, setOwnerUsername] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [creating, setCreating] = useState(false);

    const authHeaders = () => {
        const token = localStorage.getItem("admin_token");
        return { Authorization: `Bearer ${token}` };
    };

    const fetchRestaurants = () => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/superadmin/login");
            return;
        }
        setLoading(true);
        fetch(`${API_URL}/api/superadmin/restaurants`, { headers: authHeaders() })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("admin_token");
                    router.push("/superadmin/login");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setRestaurants(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setCreating(true);
        try {
            const res = await fetch(`${API_URL}/api/superadmin/restaurants`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ name, slug, ownerUsername, ownerPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setName(""); setSlug(""); setOwnerUsername(""); setOwnerPassword("");
                fetchRestaurants();
            } else {
                setError(data.error || "Oluşturulamadı");
            }
        } catch {
            setError("Sunucuya bağlanılamadı.");
        }
        setCreating(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">🛠️ Superadmin Paneli</h1>
                <button
                    onClick={() => { localStorage.removeItem("admin_token"); router.push("/superadmin/login"); }}
                    className="bg-zinc-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold border border-zinc-700"
                >
                    Çıkış Yap
                </button>
            </div>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Yeni Restoran Ekle</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
                    <input placeholder="Restoran Adı" value={name} onChange={(e) => setName(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <input placeholder="slug (örn: kral-burger)" value={slug} onChange={(e) => setSlug(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <input placeholder="Sahip Kullanıcı Adı" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <input placeholder="Sahip Şifre" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    {error && <div className="col-span-2 text-red-500 text-sm">{error}</div>}
                    <button type="submit" disabled={creating}
                        className="col-span-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                        {creating ? "Oluşturuluyor..." : "Restoran + Sahip Hesabı Oluştur"}
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">Restoranlar</h2>
                {loading ? (
                    <div className="text-gray-500">Yükleniyor...</div>
                ) : restaurants.length === 0 ? (
                    <div className="text-gray-500">Henüz restoran yok.</div>
                ) : (
                    <div className="space-y-2">
                        {restaurants.map((r) => (
                            <Link
                                key={r._id}
                                href={`/superadmin/restaurants/${r._id}`}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-orange-500 transition-colors"
                            >
                                <div>
                                    <div className="font-bold">{r.name}</div>
                                    <div className="text-sm text-gray-500">/{r.slug} · {r.type}</div>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {r.ownerUsername ? `👤 ${r.ownerUsername}` : "⚠️ sahip yok"}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
