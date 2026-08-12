"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { X, Trash2, Pencil } from "lucide-react";
import { API_URL } from "@/lib/api";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/lib/categoryIcons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface CategoryRow {
    id: string;
    name: string;
    icon: string;
}

interface Branding {
    primary_color: string;
    secondary_color: string;
    font: string;
    logo_url: string | null;
}

interface RestaurantDetail {
    _id: string;
    name: string;
    slug: string;
    type: string;
    ownerUsername: string | null;
    categories: CategoryRow[];
    branding: Branding;
    owner_can_edit_menu_content: boolean;
}

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Nunito', 'Work Sans', 'Lato', 'Manrope'];

interface MenuItemRow {
    _id: string;
    name: string;
    description?: string;
    ingredients?: string;
    nutrition_info?: string;
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
    const [initialLoading, setInitialLoading] = useState(true);

    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showToast = (type: "success" | "error", text: string) => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        setToast({ type, text });
        toastTimeout.current = setTimeout(() => setToast(null), 3000);
    };

    const [ownerUsername, setOwnerUsername] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [ownerMsg, setOwnerMsg] = useState("");

    const [brandPrimary, setBrandPrimary] = useState("#ea580c");
    const [brandSecondary, setBrandSecondary] = useState("#dc2626");
    const [brandFont, setBrandFont] = useState("Inter");
    const [brandLogo, setBrandLogo] = useState<File | null>(null);
    const [brandMsg, setBrandMsg] = useState("");

    const [permissionMsg, setPermissionMsg] = useState("");

    const [allTags, setAllTags] = useState<string[]>([]);
    const [comparableTags, setComparableTags] = useState<string[]>([]);
    const [tagsMsg, setTagsMsg] = useState("");

    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [categoryIcon, setCategoryIcon] = useState(CATEGORY_ICON_OPTIONS[0]);
    const [categoryError, setCategoryError] = useState("");

    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemIngredients, setItemIngredients] = useState("");
    const [itemNutrition, setItemNutrition] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [itemCategory, setItemCategory] = useState("");
    const [itemTags, setItemTags] = useState("");
    const [itemImage, setItemImage] = useState<File | null>(null);
    const [itemError, setItemError] = useState("");
    const [photoUploadingId, setPhotoUploadingId] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFields, setEditFields] = useState<Partial<MenuItemRow>>({});
    const [editTagsInput, setEditTagsInput] = useState("");
    const [editMsg, setEditMsg] = useState("");

    const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("admin_token")}` });

    const loadAll = async () => {
        const token = localStorage.getItem("admin_token");
        if (!token) { router.push("/superadmin/login"); return; }

        const [rRes, mRes, tRes] = await Promise.all([
            fetch(`${API_URL}/api/superadmin/restaurants/${id}`, { headers: authHeaders() }),
            fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu`, { headers: authHeaders() }),
            fetch(`${API_URL}/api/superadmin/restaurants/${id}/comparable-tags`, { headers: authHeaders() }),
        ]);

        if (rRes.status === 401 || rRes.status === 403) {
            localStorage.removeItem("admin_token");
            router.push("/superadmin/login");
            return;
        }

        const rData = await rRes.json();
        const mData = await mRes.json();
        const tData = await tRes.json();
        setRestaurant(rData);
        setOwnerUsername(rData.ownerUsername || "");
        if (rData.branding) {
            setBrandPrimary(rData.branding.primary_color);
            setBrandSecondary(rData.branding.secondary_color);
            setBrandFont(rData.branding.font);
        }
        setMenu(mData);
        setAllTags(tData.allTags || []);
        setComparableTags(tData.comparableTags || []);
        setInitialLoading(false);
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

    const handleBrandingUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setBrandMsg("");

        const formData = new FormData();
        formData.append("primary_color", brandPrimary);
        formData.append("secondary_color", brandSecondary);
        formData.append("font", brandFont);
        if (brandLogo) formData.append("logo", brandLogo);

        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/branding`, {
            method: "PATCH",
            headers: authHeaders(),
            body: formData,
        });
        if (res.ok) {
            setBrandMsg("Güncellendi.");
            setBrandLogo(null);
            loadAll();
        } else {
            setBrandMsg("Güncellenemedi");
        }
    };

    const handleTogglePermission = async (checked: boolean) => {
        setPermissionMsg("");
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/permissions`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ owner_can_edit_menu_content: checked }),
        });
        if (res.ok) {
            setPermissionMsg("Güncellendi.");
            loadAll();
        } else {
            setPermissionMsg("Güncellenemedi");
        }
    };

    const handleToggleComparableTag = async (tag: string) => {
        const next = comparableTags.includes(tag)
            ? comparableTags.filter((t) => t !== tag)
            : [...comparableTags, tag];
        setComparableTags(next);
        setTagsMsg("");

        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/comparable-tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ tags: next }),
        });
        if (res.ok) {
            setTagsMsg("Güncellendi.");
        } else {
            setTagsMsg("Güncellenemedi");
            setComparableTags(comparableTags); // geri al
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryError("");
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ id: categoryId, name: categoryName, icon: categoryIcon }),
        });
        const data = await res.json();
        if (res.ok) {
            setCategoryId(""); setCategoryName(""); setCategoryIcon(CATEGORY_ICON_OPTIONS[0]);
            showToast("success", "Kategori eklendi.");
            loadAll();
        } else {
            setCategoryError(data.error || "Eklenemedi");
            showToast("error", data.error || "Kategori eklenemedi.");
        }
    };

    const handleDeleteCategory = async (catId: string) => {
        if (!confirm("Bu kategoriyi silmek istediğine emin misin?")) return;
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/categories/${catId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (res.ok) {
            showToast("success", "Kategori silindi.");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast("error", data.error || "Kategori silinemedi.");
        }
        loadAll();
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setItemError("");

        const formData = new FormData();
        formData.append("name", itemName);
        formData.append("description", itemDescription);
        formData.append("ingredients", itemIngredients);
        formData.append("nutrition_info", itemNutrition);
        if (itemPrice) formData.append("price", itemPrice);
        formData.append("category", itemCategory);
        formData.append("tags", itemTags);
        if (itemImage) formData.append("image", itemImage);

        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu`, {
            method: "POST",
            headers: authHeaders(),
            body: formData,
        });
        const data = await res.json();
        if (res.ok) {
            setItemName(""); setItemDescription(""); setItemIngredients(""); setItemNutrition("");
            setItemPrice(""); setItemCategory(""); setItemTags(""); setItemImage(null);
            showToast("success", "Ürün eklendi.");
            loadAll();
        } else {
            setItemError(data.error || "Eklenemedi");
            showToast("error", data.error || "Ürün eklenemedi.");
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu/${itemId}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (res.ok) {
            showToast("success", "Ürün silindi.");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast("error", data.error || "Ürün silinemedi.");
        }
        loadAll();
    };

    const handleReplacePhoto = async (itemId: string, file: File) => {
        setPhotoUploadingId(itemId);
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu/${itemId}/photo`, {
            method: "PATCH",
            headers: authHeaders(),
            body: formData,
        });
        if (res.ok) {
            showToast("success", "Fotoğraf güncellendi.");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast("error", data.error || "Fotoğraf güncellenemedi.");
        }
        await loadAll();
        setPhotoUploadingId(null);
    };

    const startEdit = (item: MenuItemRow) => {
        setEditingId(item._id);
        setEditFields({
            name: item.name,
            description: item.description || "",
            ingredients: item.ingredients || "",
            nutrition_info: item.nutrition_info || "",
            price: item.price,
            category: item.category,
        });
        setEditTagsInput((item.tags || []).join(", "));
        setEditMsg("");
    };

    const handleSaveEdit = async (itemId: string) => {
        setEditMsg("");
        const res = await fetch(`${API_URL}/api/superadmin/restaurants/${id}/menu/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ ...editFields, tags: editTagsInput }),
        });
        if (res.ok) {
            setEditingId(null);
            showToast("success", "Ürün güncellendi.");
            loadAll();
        } else {
            setEditMsg("Güncellenemedi");
            showToast("error", "Ürün güncellenemedi.");
        }
    };

    if (initialLoading) return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6">Yükleniyor...</div>;
    if (!restaurant) return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6">Restoran bulunamadı.</div>;

    const categories = restaurant.categories || [];

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 max-w-3xl mx-auto">
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-[var(--color-danger)]"
                        }`}
                >
                    {toast.text}
                </div>
            )}
            <Link href="/superadmin" className="text-[var(--color-text-muted)] text-sm">← Restoranlar</Link>
            <h1 className="text-xl font-semibold mt-2 mb-1">{restaurant.name}</h1>
            <div className="text-[var(--color-text-muted)] mb-8">/{restaurant.slug}</div>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-4">Sahip Bilgileri</h2>
                <form onSubmit={handleOwnerUpdate} className="grid grid-cols-2 gap-3">
                    <Input placeholder="Kullanıcı Adı" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} />
                    <Input placeholder="Yeni Şifre (boş bırakılabilir)" type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} />
                    {ownerMsg && <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{ownerMsg}</div>}
                    <Button type="submit" variant="primary" size="lg" className="col-span-2">
                        Güncelle
                    </Button>
                </form>
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-1">Sahip Yetkileri</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Açarsan, restoran sahibi kendi menüsündeki ürünlerin açıklama/içerik/besin değerlerini
                    kendisi düzenleyebilir (isim, fiyat, kategori, fotoğraf hâlâ sadece burada değiştirilir).
                </p>
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={restaurant.owner_can_edit_menu_content}
                        onChange={(e) => handleTogglePermission(e.target.checked)}
                        className="w-5 h-5 accent-[var(--color-brand)]"
                    />
                    <span className="text-sm">Restoran sahibi menü içeriğini düzenleyebilsin</span>
                </label>
                {permissionMsg && <div className="text-sm text-[var(--color-text-muted)] mt-2">{permissionMsg}</div>}
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-4">Marka & Görünüm</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Bu restorana özel renkler, font ve logo. Müşteri tarafındaki ekranlar bu renkleri/logoyu artık kullanıyor.
                </p>
                <form onSubmit={handleBrandingUpdate} className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">Ana Renk</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)}
                                className="w-12 h-10 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg cursor-pointer" />
                            <span className="text-sm text-[var(--color-text-muted)]">{brandPrimary}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">İkincil Renk</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)}
                                className="w-12 h-10 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg cursor-pointer" />
                            <span className="text-sm text-[var(--color-text-muted)]">{brandSecondary}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">Font</label>
                        <select value={brandFont} onChange={(e) => setBrandFont(e.target.value)}
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)]">
                            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">Logo</label>
                        {restaurant.branding?.logo_url && (
                            <img src={restaurant.branding.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover mb-2" />
                        )}
                        <input type="file" accept="image/*" onChange={(e) => setBrandLogo(e.target.files?.[0] || null)}
                            className="w-full text-sm text-[var(--color-text-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-border)] file:text-[var(--color-text)]" />
                    </div>
                    {brandMsg && <div className="col-span-2 text-sm text-[var(--color-text-muted)]">{brandMsg}</div>}
                    <Button type="submit" variant="primary" size="lg" className="col-span-2">
                        Kaydet
                    </Button>
                </form>
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-4">Kategoriler</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Bu restorana özel menü kategorileri. Müşteri tarafındaki "Bana Öneri Ver" akışı bu listeyi kullanıyor.
                </p>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((c) => {
                            const Icon = getCategoryIcon(c.icon);
                            return (
                                <div key={c.id} className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm">
                                    <Icon size={16} />
                                    <span>{c.name}</span>
                                    <span className="text-[var(--color-text-muted)]">({c.id})</span>
                                    <button onClick={() => handleDeleteCategory(c.id)} className="text-[var(--color-danger)]">
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <form onSubmit={handleAddCategory} className="grid grid-cols-3 gap-3 items-end">
                    <Input placeholder="id (örn: ana_yemek)" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
                    <Input placeholder="Görünen Ad (örn: Ana Yemekler)" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                    <div className="flex items-center gap-2">
                        <select value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)}
                            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)]">
                            {CATEGORY_ICON_OPTIONS.map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                        {(() => { const Icon = getCategoryIcon(categoryIcon); return <Icon size={20} className="shrink-0" />; })()}
                    </div>
                    {categoryError && <div className="col-span-3 text-[var(--color-danger)] text-sm">{categoryError}</div>}
                    <Button type="submit" variant="primary" size="lg" className="col-span-3">
                        Kategori Ekle
                    </Button>
                </form>
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-1">Karşılaştırma Etiketleri</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    "Bana Öneri Ver" oyununda müşteriye hangi etiketler karşılaştırılabilir? (örn. "sıcak" vs "soğuk" mantıklı,
                    "italyan" vs "deniz_ürünü" değil.) İşaretlemezsen sistem tüm etiketleri kullanır — mantıksız
                    karşılaştırma riskini kaldırmak için en az birkaçını seçmen önerilir.
                </p>
                {allTags.length === 0 ? (
                    <div className="text-sm text-[var(--color-text-muted)]">Menüde henüz etiketli ürün yok.</div>
                ) : (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {allTags.map((tag) => {
                            const active = comparableTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleToggleComparableTag(tag)}
                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${active
                                        ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                                        }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                )}
                {tagsMsg && <div className="text-sm text-[var(--color-text-muted)]">{tagsMsg}</div>}
            </Card>

            <Card className="p-6 mb-8">
                <h2 className="text-base font-semibold mb-4">Yeni Ürün Ekle</h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-3">
                    <Input placeholder="Ürün Adı" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                    <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)]" required>
                        <option value="" disabled>Kategori seç</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <Input placeholder="Fiyat" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                    <Input placeholder="Etiketler (virgülle)" value={itemTags} onChange={(e) => setItemTags(e.target.value)} />
                    <Input placeholder="Açıklama" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="col-span-2" />
                    <div className="col-span-2">
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">İçerik</label>
                        <textarea value={itemIngredients} onChange={(e) => setItemIngredients(e.target.value)} rows={2}
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">Besin Değerleri</label>
                        <textarea value={itemNutrition} onChange={(e) => setItemNutrition(e.target.value)} rows={2}
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-[var(--color-text-muted)] block mb-1">Fotoğraf (opsiyonel)</label>
                        <input type="file" accept="image/*" onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                            className="w-full text-sm text-[var(--color-text-muted)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-border)] file:text-[var(--color-text)]" />
                    </div>
                    {categories.length === 0 && (
                        <div className="col-span-2 text-sm text-[var(--color-text-muted)]">Önce yukarıdan en az bir kategori ekle.</div>
                    )}
                    {itemError && <div className="col-span-2 text-[var(--color-danger)] text-sm">{itemError}</div>}
                    <Button type="submit" variant="primary" size="lg" disabled={categories.length === 0} className="col-span-2">
                        Ürün Ekle
                    </Button>
                </form>
            </Card>

            <section>
                <h2 className="text-base font-semibold mb-4">Menü ({menu.length})</h2>
                {menu.length === 0 ? (
                    <div className="text-[var(--color-text-muted)]">Henüz ürün yok.</div>
                ) : (
                    <div className="space-y-2">
                        {menu.map((item) => {
                            const cat = categories.find(c => c.id === item.category);
                            const CatIcon = getCategoryIcon(cat?.icon);
                            const isEditing = editingId === item._id;
                            return (
                                <Card key={item._id} className="p-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Input placeholder="Ürün Adı" value={editFields.name || ""} onChange={(e) => setEditFields({ ...editFields, name: e.target.value })} className="w-full" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input placeholder="Fiyat" type="number" value={editFields.price ?? ""} onChange={(e) => setEditFields({ ...editFields, price: Number(e.target.value) })} />
                                                <select value={editFields.category || ""} onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
                                                    className="bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)]">
                                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <Input placeholder="Etiketler (virgülle)" value={editTagsInput} onChange={(e) => setEditTagsInput(e.target.value)} className="w-full" />
                                            <textarea placeholder="Açıklama" value={editFields.description || ""} onChange={(e) => setEditFields({ ...editFields, description: e.target.value })} rows={2}
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm" />
                                            <textarea placeholder="İçerik" value={editFields.ingredients || ""} onChange={(e) => setEditFields({ ...editFields, ingredients: e.target.value })} rows={2}
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm" />
                                            <textarea placeholder="Besin Değerleri" value={editFields.nutrition_info || ""} onChange={(e) => setEditFields({ ...editFields, nutrition_info: e.target.value })} rows={2}
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-xl outline-none focus:border-[var(--color-brand)] text-sm" />
                                            {editMsg && <div className="text-[var(--color-danger)] text-sm">{editMsg}</div>}
                                            <div className="flex gap-2">
                                                <Button variant="primary" onClick={() => handleSaveEdit(item._id)}>Kaydet</Button>
                                                <Button variant="secondary" onClick={() => setEditingId(null)}>Vazgeç</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-lg bg-[var(--color-border)] shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{item.name}</div>
                                                    <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                                                        <CatIcon size={12} /> {cat?.name || item.category}{item.price ? ` · ${item.price} TL` : ""}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <button onClick={() => startEdit(item)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                                    <Pencil size={16} />
                                                </button>
                                                <label className="text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)]">
                                                    {photoUploadingId === item._id ? "Yükleniyor..." : "Fotoğraf"}
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
                                                <button onClick={() => handleDeleteItem(item._id)} className="text-[var(--color-danger)]">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
