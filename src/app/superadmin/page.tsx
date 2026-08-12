"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, AlertTriangle } from "lucide-react";
import { API_URL } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

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
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold">Superadmin Paneli</h1>
                <Button
                    variant="secondary"
                    onClick={() => { localStorage.removeItem("admin_token"); router.push("/superadmin/login"); }}
                >
                    Çıkış Yap
                </Button>
            </div>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-4">Yeni Restoran Ekle</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
                    <Input placeholder="Restoran Adı" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input placeholder="slug (örn: kral-burger)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                    <Input placeholder="Sahip Kullanıcı Adı" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} required />
                    <Input placeholder="Sahip Şifre" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required />
                    {error && <div className="col-span-2 text-[var(--color-danger)] text-sm">{error}</div>}
                    <Button type="submit" variant="primary" size="lg" disabled={creating} className="col-span-2">
                        {creating ? "Oluşturuluyor..." : "Restoran + Sahip Hesabı Oluştur"}
                    </Button>
                </form>
            </Card>

            <section>
                <h2 className="text-base font-semibold mb-4">Restoranlar</h2>
                {loading ? (
                    <div className="text-[var(--color-text-muted)]">Yükleniyor...</div>
                ) : restaurants.length === 0 ? (
                    <div className="text-[var(--color-text-muted)]">Henüz restoran yok.</div>
                ) : (
                    <div className="space-y-2">
                        {restaurants.map((r) => (
                            <Link
                                key={r._id}
                                href={`/superadmin/restaurants/${r._id}`}
                                className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex justify-between items-center hover:border-[var(--color-brand)] transition-colors"
                            >
                                <div>
                                    <div className="font-medium">{r.name}</div>
                                    <div className="text-sm text-[var(--color-text-muted)]">/{r.slug} · {r.type}</div>
                                </div>
                                <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-1.5">
                                    {r.ownerUsername ? (
                                        <><User size={14} /> {r.ownerUsername}</>
                                    ) : (
                                        <><AlertTriangle size={14} className="text-yellow-500" /> sahip yok</>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
