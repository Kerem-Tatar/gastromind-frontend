"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, UtensilsCrossed, Sparkles } from "lucide-react";
import { useRestaurantInfo } from "./layout";

// Not: bu sayfa subdomain'e proxy.ts tarafından `/sites/[slug]`'den rewrite ediliyor —
// tarayıcının adres çubuğunda görünen gerçek URL zaten kısa (`/`, `/menu`, ...),
// o yüzden linkler `/sites/${slug}/...` değil, kısa path kullanmalı.
const options = [
    {
        href: `/recommend`,
        icon: Sparkles,
        title: "Bana Öneri Ver",
        description: "Birkaç soruyla sana uygun yemeği bulalım.",
    },
    {
        href: `/menu`,
        icon: UtensilsCrossed,
        title: "Menüye Bak",
        description: "Ne var ne yok, göz at.",
    },
    {
        href: `/feedback`,
        icon: MessageSquare,
        title: "Geri Bildirim Bırak",
        description: "Deneyimini doğrudan anlat, sohbet şeklinde.",
    },
];

export default function RestaurantEntry() {
    const { restaurant } = useRestaurantInfo();
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSettled(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    const initial = restaurant?.name?.charAt(0)?.toUpperCase() || "G";

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-8">
            <div className={`w-full max-w-md flex items-center mb-10 ${settled ? "justify-start" : "justify-center"}`}>
                <motion.div layout transition={{ duration: 0.6, ease: "easeInOut" }} className="flex items-center gap-3 shrink-0">
                    <motion.div
                        layout
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className={`rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0 ${settled ? "w-11 h-11" : "w-20 h-20"}`}
                    >
                        {restaurant?.logo_url ? (
                            <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className={`font-semibold text-[var(--color-brand)] ${settled ? "text-lg" : "text-3xl"}`}>{initial}</span>
                        )}
                    </motion.div>
                    {!settled && restaurant && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-semibold text-[var(--color-text)]"
                        >
                            {restaurant.name}
                        </motion.span>
                    )}
                </motion.div>

                {settled && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="ml-3 min-w-0"
                    >
                        <h1 className="text-xl font-semibold text-[var(--color-text)] truncate">Hoş geldiniz</h1>
                        <p className="text-[var(--color-text-muted)] text-sm truncate">Ne yapmak istersiniz?</p>
                    </motion.div>
                )}
            </div>

            <div className="w-full max-w-md space-y-3">
                {options.map((opt, index) => (
                    <motion.div
                        key={opt.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.08 }}
                    >
                        <Link
                            href={opt.href}
                            className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-brand)] transition-colors"
                        >
                            <div className="shrink-0 w-11 h-11 rounded-full bg-[var(--color-brand)]/15 text-[var(--color-brand)] flex items-center justify-center">
                                <opt.icon size={20} />
                            </div>
                            <div>
                                <div className="text-[var(--color-text)] font-medium">{opt.title}</div>
                                <div className="text-sm text-[var(--color-text-muted)]">{opt.description}</div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <span className="fixed bottom-2 right-3 text-[10px] text-[var(--color-text-muted)] select-none pointer-events-none">
                Powered by GastroMind
            </span>
        </main>
    );
}
