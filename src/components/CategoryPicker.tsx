"use client";

import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useRestaurantInfo } from "@/app/sites/[slug]/layout";

// "hepsi" is a permanent app-level catch-all (backend treats this id as "no category
// filter"), not part of the restaurant's own category list — always offered.
const CATCH_ALL = { id: "hepsi", name: "Kararsızım / Hepsi" };

export default function CategoryPicker({ onSelect }: { onSelect: (category: string) => void }) {
    const { restaurant, loading } = useRestaurantInfo();
    const categories = restaurant?.categories || [];

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-8 text-center overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--color-text)]">Bugün modun hangisi?</h1>
                <p className="text-[var(--color-text-muted)] mt-2">Bir kategori seç, sana özel öneriler sunalım.</p>
            </motion.div>

            {loading ? (
                <div className="text-[var(--color-text-muted)] animate-pulse">Kategoriler yükleniyor...</div>
            ) : (
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {categories.map((cat, index) => {
                        const Icon = getCategoryIcon(cat.icon);
                        return (
                            <motion.button
                                key={cat.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.06 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onSelect(cat.id)}
                                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-left flex flex-col justify-between h-28 hover:border-[var(--color-brand)] transition-colors"
                            >
                                <Icon size={28} className="text-[var(--color-brand)] mb-2" />
                                <span className="text-[var(--color-text)] font-medium">{cat.name}</span>
                            </motion.button>
                        );
                    })}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: categories.length * 0.06 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelect(CATCH_ALL.id)}
                        className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-left flex flex-col justify-between h-28 hover:border-[var(--color-brand)] transition-colors ${categories.length % 2 === 0 ? "col-span-2" : ""}`}
                    >
                        <Shuffle size={28} className="text-[var(--color-brand)] mb-2" />
                        <span className="text-[var(--color-text)] font-medium">{CATCH_ALL.name}</span>
                    </motion.button>
                </div>
            )}
        </div>
    );
}
