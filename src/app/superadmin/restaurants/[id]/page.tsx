"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface CategoryRow {
    id: string;
    name: string;
    emoji: string;
}

interface RestaurantDetail {
    _id: string;
    name: string;
    slug: string;
    type: string;
    ownerUsername: string | null;
    categories: CategoryRow[];
}

interface MenuItemRow {
    _id: string;
    name: string;
    description?: string;
    price?: number;
    category: string;
    tags?: string[];
    image?: string;
}

export default function RestaurantManage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
    const [menu, setMenu] = useState<MenuItemRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [ownerUsername, setOwnerUsername] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [ownerMsg, setOwnerMsg] = useState("");

    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [categoryEmoji, setCategoryEmoji] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [itemCategory, setItemCategory] = useState("");
    const [itemTags, setItemTags] = useState("");
    const [itemImage, setItemImage] = useState<File | null>(null);
    const [itemError, setItemError] = useState("");
    const [photoUploadingId, setPhotoUploadingId] = useState<string | null>(null);

    const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` });

    const loadAll = async () => {
        const token = localStorage.getItem("admin_token");
        if (!token) { router.push("/superadmin/login"); return; }

        setLoading(true);
        const [rRes, mRes] = await Promise.all([
            fetch(`${API_URL}/api/superadmin/restaurants/${id}`, { headers: authHeaders() }),
            fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu`, { headers: authHeaders() }),
        ]);

        if (rRes.status === 401 || rRes.status === 403) {
            localStorage.removeItem("admin_token");
            router.push("/superadmin/login");
            return;
        }

        const rData = await rRes.json();
        const mData = await mRes.json();
        setRestaurant(rData);
        setOwnerUsername(rData.ownerUsername || "");
        setMenu(mData);
        setLoading(false);
    };

    useEffect(() => { loadAll(); }, [id]);

    const handleOwnerUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setOwnerMsg("");
        const body: { username?: string; password?: string } = {};
        if (ownerUsername && ownerUsername !== restaurant?.ownerUsername) body.username = ownerUsername;
        if (ownerPassword) body.password = ownerPassword;

        if (!body.username && !body.password) {
            setOwnerMsg("Değiştirecek bir şey yok.");
            return;
        }

        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/owner`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
            setOwnerMsg("Güncellendi.");
            setOwnerPassword("");
            loadAll();
        } else {
            setOwnerMsg(data.error || "Güncellenemedi");
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryError("");
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ id: categoryId, name: categoryName, emoji: categoryEmoji || undefined }),
        });
        const data = await res.json();
        if (res.ok) {
            setCategoryId(""); setCategoryName(""); setCategoryEmoji("");
            loadAll();
        } else {
            setCategoryError(data.error || "Eklenemedi");
        }
    };

    const handleDeleteCategory = async (catId: string) => {
        if (!confirm("Bu kategoriyi silmek istediğine emin misin?")) return;
        await fetch(`${API_URL}/api/superadmin/restaurants/${id}/categories/${catId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        loadAll();
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setItemError("");

        const formData = new FormData();
        formData.append("name", itemName);
        formData.append("description", itemDescription);
        if (itemPrice) formData.append("price", itemPrice);
        formData.append("category", itemCategory);
        formData.append("tags", itemTags);
        if (itemImage) formData.append("image", itemImage);

        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu`, {
            method: "POST",
            headers: authHeaders(), // Content-Type'ı tarayıcı boundary ile kendi ayarlasın
            body: formData,
        });
        const data = await res.json();
        if (res.ok) {
            setItemName(""); setItemDescription(""); setItemPrice(""); setItemCategory(""); setItemTags(""); setItemImage(null);
            loadAll();
        } else {
            setItemError(data.error || "Eklenemedi");
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
        await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu/${itemId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        loadAll();
    };

    const handleReplacePhoto = async (itemId: string, file: File) => {
        setPhotoUploadingId(itemId);
        const formData = new FormData();
        formData.append("image", file);
        await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu/${itemId}/photo`, {
            method: "PATCH",
            headers: authHeaders(),
            body: formData,
        });
        await loadAll();
        setPhotoUploadingId(null);
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-6">Yükleniyor...</div>;
    if (!restaurant) return <div className="min-h-screen bg-black text-white p-6">Restoran bulunamadı.</div>;

    const categories = restaurant.categories || [];

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
            <Link href="/superadmin" className="text-gray-500 text-sm">← Restoranlar</Link>
            <h1 className="text-2xl font-bold mt-2 mb-1">{restaurant.name}</h1>
            <div className="text-gray-500 mb-8">/{restaurant.slug}</div>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Sahip Bilgileri</h2>
                <form onSubmit={handleOwnerUpdate} className="grid grid-cols-2 gap-3">
                    <input placeholder="Kullanıcı Adı" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    <input placeholder="Yeni Şifre (boş bırakılabilir)" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    {ownerMsg && <div className="col-span-2 text-sm text-gray-400">{ownerMsg}</div>}
                    <button type="submit" className="col-span-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-xl">
                        Güncelle
                    </button>
                </form>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Kategoriler</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Bu restorana özel menü kategorileri. Ürün eklerken bu listeden seçeceksin.
                    (Müşteri tarafındaki ekranlar henüz bu listeyi kullanmıyor — o kısım ayrı bir işte gelecek.)
                </p>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm">
                                <span>{c.emoji} {c.name}</span>
                                <span className="text-gray-600">({c.id})</span>
                                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 font-bold">✕</button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleAddCategory} className="grid grid-cols-3 gap-3">
                    <input placeholder="id (örn: ana_yemek)" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <input placeholder="Görünen Ad (örn: Ana Yemekler)" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <input placeholder="Emoji" value={categoryEmoji} onChange={(e) => setCategoryEmoji(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    {categoryError && <div className="col-span-3 text-red-500 text-sm">{categoryError}</div>}
                    <button type="submit" className="col-span-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-xl">
                        Kategori Ekle
                    </button>
                </form>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">Yeni Ürün Ekle</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-3">
                    <input placeholder="Ürün Adı" value={itemName} onChange={(e) => setItemName(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required />
                    <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" required>
                        <option value="" disabled>Kategori seç</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                        ))}
                    </select>
                    <input placeholder="Fiyat" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    <input placeholder="Etiketler (virgülle)" value={itemTags} onChange={(e) => setItemTags(e.target.value)}
                        className="bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    <input placeholder="Açıklama" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}
                        className="col-span-2 bg-black border border-zinc-700 p-3 rounded-xl outline-none focus:border-orange-500" />
                    <div className="col-span-2">
                        <label className="text-sm text-gray-500 block mb-1">Fotoğraf (opsiyonel)</label>
                        <input type="file" accept="image/*" onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white" />
                    </div>
                    {categories.length === 0 && (
                        <div className="col-span-2 text-sm text-gray-500">Önce yukarıdan en az bir kategori ekle.</div>
                    )}
                    {itemError && <div className="col-span-2 text-red-500 text-sm">{itemError}</div>}
                    <button type="submit" disabled={categories.length === 0}
                        className="col-span-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                        Ürün Ekle
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">Menü ({menu.length})</h2>
                {menu.length === 0 ? (
                    <div className="text-gray-500">Henüz ürün yok.</div>
                ) : (
                    <div className="space-y-2">
                        {menu.map((item) => {
                            const cat = categories.find(c => c.id === item.category);
                            return (
                                <div key={item._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-lg bg-zinc-800 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="font-bold truncate">{item.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {cat ? `${cat.emoji} ${cat.name}` : item.category}{item.price ? ` · ${item.price} TL` : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <label className="text-xs text-gray-400 cursor-pointer hover:text-white">
                                            {photoUploadingId === item._id ? "Yükleniyor..." : "Fotoğraf Değiştir"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={photoUploadingId === item._id}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleReplacePhoto(item._id, file);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </label>
                                        <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 text-sm font-bold">
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
