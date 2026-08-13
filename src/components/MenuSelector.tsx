"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useRestaurantInfo } from "@/app/sites/[slug]/layout";
import { getCategoryIcon } from "@/lib/categoryIcons";
import DishDetail from "@/components/DishDetail";

interface Dish {
    _id: string;
    name: string;
    description?: string;
    ingredients?: string;
    nutrition_info?: string;
    image?: string;
    price: number;
    category: string;
    tags: string[];
}

type SortOption = "default" | "price_asc" | "price_desc" | "name_asc";

const SORT_LABELS: Record<SortOption, string> = {
    default: "Varsayılan",
    price_asc: "Fiyat: Düşükten Yükseğe",
    price_desc: "Fiyat: Yüksekten Düşüğe",
    name_asc: "İsim: A-Z",
};

const OTHER_CATEGORY_ID = "__diger";

function sortDishes(dishes: Dish[], sortBy: SortOption): Dish[] {
    if (sortBy === "default") return dishes;
    const sorted = [...dishes];
    if (sortBy === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "name_asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return sorted;
}

export default function MenuSelector({ onReview, restaurantSlug }: { onReview: (dishName: string) => void; restaurantSlug: string }) {
    const { restaurant } = useRestaurantInfo();
    const [menu, setMenu] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("default");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/api/menu/${restaurantSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setMenu(data);
                setLoading(false);
            });
    }, [restaurantSlug]);

    const allTags = useMemo(() => {
        const set = new Set<string>();
        menu.forEach((d) => d.tags?.forEach((t) => set.add(t)));
        return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
    }, [menu]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const activeFilterCount = selectedTags.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

    const clearFilters = () => {
        setSelectedTags([]);
        setMinPrice("");
        setMaxPrice("");
        setSortBy("default");
    };

    // Category order comes straight from the restaurant's own list (superadmin-curated,
    // already sorted by `order` on the backend) — filtering/sorting never reshuffles it,
    // it only changes which dishes show up inside each category and in what order.
    const groups = useMemo(() => {
        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;

        const passesFilter = (d: Dish) => {
            if (selectedTags.length > 0 && !d.tags?.some((t) => selectedTags.includes(t))) return false;
            if (min !== null && d.price < min) return false;
            if (max !== null && d.price > max) return false;
            return true;
        };

        const categories = restaurant?.categories || [];
        const knownIds = new Set(categories.map((c) => c.id));

        const result = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            dishes: sortDishes(menu.filter((d) => d.category === cat.id && passesFilter(d)), sortBy),
        }));

        const orphaned = sortDishes(menu.filter((d) => !knownIds.has(d.category) && passesFilter(d)), sortBy);
        if (orphaned.length > 0) {
            result.push({ id: OTHER_CATEGORY_ID, name: "Diğer", icon: "UtensilsCrossed", dishes: orphaned });
        }

        return result.filter((g) => g.dishes.length > 0);
    }, [menu, restaurant, sortBy, selectedTags, minPrice, maxPrice]);

    const totalVisible = groups.reduce((sum, g) => sum + g.dishes.length, 0);

    return (
        <div className="w-full max-w-md p-4 h-dvh flex flex-col bg-[var(--color-bg)] mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Menü</h2>
                <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    className="relative flex items-center gap-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] px-3 py-2 rounded-xl text-sm"
                >
                    <SlidersHorizontal size={14} />
                    Filtrele
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-brand)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-4 space-y-3">
                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Sırala</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-2.5 rounded-lg outline-none focus:border-[var(--color-brand)] text-sm text-[var(--color-text)]"
                                >
                                    {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                                        <option key={opt} value={opt}>{SORT_LABELS[opt]}</option>
                                    ))}
                                </select>
                            </div>

                            {allTags.length > 0 && (
                                <div>
                                    <label className="text-xs text-[var(--color-text-muted)] block mb-1">Etiketler</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allTags.map((tag) => {
                                            const active = selectedTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleTag(tag)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${active
                                                        ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                                                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Fiyat Aralığı (TL)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-2.5 rounded-lg outline-none focus:border-[var(--color-brand)] text-sm text-[var(--color-text)]"
                                    />
                                    <span className="text-[var(--color-text-muted)] text-sm">–</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-2.5 rounded-lg outline-none focus:border-[var(--color-brand)] text-sm text-[var(--color-text)]"
                                    />
                                </div>
                            </div>

                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-[var(--color-brand)] flex items-center gap-1">
                                    <X size={12} /> Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="text-[var(--color-text-muted)] text-center animate-pulse">Menü Yükleniyor...</div>
            ) : menu.length === 0 ? (
                <div className="text-[var(--color-text-muted)] text-center">Menü henüz eklenmemiş.</div>
            ) : totalVisible === 0 ? (
                <div className="text-[var(--color-text-muted)] text-center">Bu filtrelere uyan ürün yok.</div>
            ) : (
                <div className="flex-1 overflow-y-auto pb-20 space-y-6">
                    {groups.map((group) => {
                        const Icon = getCategoryIcon(group.icon);
                        return (
                            <div key={group.id}>
                                <div className="flex items-center gap-2 mb-3 text-[var(--color-text)]">
                                    <Icon size={16} className="text-[var(--color-brand)]" />
                                    <h3 className="font-medium text-sm">{group.name}</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {group.dishes.map((item, index) => (
                                        <motion.button
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index, 6) * 0.04 }}
                                            onClick={() => setSelectedDish(item)}
                                            className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors text-left"
                                        >
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-[var(--color-border)] shrink-0" />
                                            )}
                                            <div>
                                                <h3 className="text-[var(--color-text)] font-medium">{item.name}</h3>
                                                <span className="text-[var(--color-brand)] font-medium">{item.price} TL</span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {selectedDish && (
                    <DishDetail
                        dish={selectedDish}
                        onClose={() => setSelectedDish(null)}
                        onReview={onReview}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
