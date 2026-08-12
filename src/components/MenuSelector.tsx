"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";
import DishDetail from "@/components/DishDetail";

interface Dish {
    _id: string;
    name: string;
    description?: string;
    ingredients?: string;
    nutrition_info?: string;
    image?: string;
    price: number;
}

export default function MenuSelector({ onReview, restaurantSlug }: { onReview: (dishName: string) => void; restaurantSlug: string }) {
    const [menu, setMenu] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/menu/${restaurantSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setMenu(data);
                setLoading(false);
            });
    }, [restaurantSlug]);

    return (
        <div className="w-full max-w-md p-4 h-dvh flex flex-col bg-[var(--color-bg)] mx-auto">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 text-center">Menü</h2>

            {loading ? (
                <div className="text-[var(--color-text-muted)] text-center animate-pulse">Menü Yükleniyor...</div>
            ) : menu.length === 0 ? (
                <div className="text-[var(--color-text-muted)] text-center">Menü henüz eklenmemiş.</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-20">
                    {menu.map((item, index) => (
                        <motion.button
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
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
