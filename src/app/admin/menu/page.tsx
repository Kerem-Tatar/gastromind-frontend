"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { API_URL } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface MenuItemRow {
    _id: string;
    name: string;
    description?: string;
    ingredients?: string;
    nutrition_info?: string;
    price?: number;
    image?: string;
}

export default function OwnerMenuContent() {
    const router = useRouter();
    const [menu, setMenu] = useState<MenuItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);
    const [drafts, setDrafts] = useState<Record<string, { description: string; ingredients: string; nutrition_info: string }>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` });

    const load = async () => {
        const token = localStorage.getItem("admin_token");
        if (!token) { router.push("/admin/login"); return; }

        setLoading(true);
        const res = await fetch(`${API_URL}/api/admin/menu`, { headers: authHeaders() });

        if (res.status === 401) {
            localStorage.removeItem("admin_token");
            router.push("/admin/login");
            return;
        }
        if (res.status === 403) {
            setForbidden(true);
            setLoading(false);
            return;
        }

        const data: MenuItemRow[] = await res.json();
        setMenu(data);
        const nextDrafts: typeof drafts = {};
        data.forEach((item) => {
            nextDrafts[item._id] = {
                description: item.description || "",
                ingredients: item.ingredients || "",
                nutrition_info: item.nutrition_info || "",
            };
        });
        setDrafts(nextDrafts);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (itemId: string) => {
        setSavingId(itemId);
        await fetch(`${API_URL}/api/admin/menu/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(drafts[itemId]),
        });
        setSavingId(null);
    };

    if (loading) return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6">Yükleniyor...</div>;

    if (forbidden) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-lg mx-auto flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                    <Lock size={20} className="text-[var(--color-text-muted)]" />
                </div>
                <h1 className="text-lg font-semibold">Bu özellik senin için açık değil</h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                    Menü içeriğini düzenleme yetkisi platform yöneticisi tarafından açılmadı. İhtiyacın varsa onunla iletişime geç.
                </p>
                <Link href="/admin" className="text-[var(--color-brand)] text-sm">← Panele dön</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-2xl mx-auto">
            <Link href="/admin" className="text-[var(--color-text-muted)] text-sm flex items-center gap-1 w-fit mb-4">
                <ArrowLeft size={14} /> Panele dön
            </Link>
            <h1 className="text-xl font-semibold mb-1">Menü İçeriğini Düzenle</h1>
            <p className="text-[var(--color-text-muted)] text-sm mb-8">
                Açıklama, içerik ve besin değerlerini buradan güncelleyebilirsin. İsim, fiyat, kategori ve fotoğraf değişikliği için platform yöneticisiyle iletişime geç.
            </p>

            {menu.length === 0 ? (
                <div className="text-[var(--color-text-muted)]">Henüz ürün yok.</div>
            ) : (
                <div className="space-y-4">
                    {menu.map((item) => (
                        <Card key={item._id} className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[var(--color-border)] shrink-0" />
                                )}
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    {item.price !== undefined && <div className="text-sm text-[var(--color-text-muted)]">{item.price} TL</div>}
                                </div>
                            </div>

                            <label className="text-sm text-[var(--color-text-muted)] block mb-1">Açıklama</label>
                            <textarea
                                value={drafts[item._id]?.description || ""}
                                onChange={(e) => setDrafts({ ...drafts, [item._id]: { ...drafts[item._id], description: e.target.value } })}
                                rows={2}
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm mb-3"
                            />

                            <label className="text-sm text-[var(--color-text-muted)] block mb-1">İçerik</label>
                            <textarea
                                value={drafts[item._id]?.ingredients || ""}
                                onChange={(e) => setDrafts({ ...drafts, [item._id]: { ...drafts[item._id], ingredients: e.target.value } })}
                                rows={2}
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm mb-3"
                            />

                            <label className="text-sm text-[var(--color-text-muted)] block mb-1">Besin Değerleri</label>
                            <textarea
                                value={drafts[item._id]?.nutrition_info || ""}
                                onChange={(e) => setDrafts({ ...drafts, [item._id]: { ...drafts[item._id], nutrition_info: e.target.value } })}
                                rows={2}
                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm mb-3"
                            />

                            <Button variant="primary" disabled={savingId === item._id} onClick={() => handleSave(item._id)}>
                                {savingId === item._id ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
