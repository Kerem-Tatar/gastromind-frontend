"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface Dish {
    _id: string;
    name: string;
    description?: string;
    ingredients?: string;
    nutrition_info?: string;
    price: number;
    image?: string;
}

export default function DishDetail({ dish, onClose, onReview }: { dish: Dish; onClose: () => void; onReview: (dishName: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85dvh] flex flex-col"
            >
                <div className="relative h-56 shrink-0 bg-[var(--color-border)]">
                    {dish.image && <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                        <h2 className="text-lg font-semibold text-[var(--color-text)]">{dish.name}</h2>
                        <span className="text-[var(--color-brand)] font-semibold shrink-0">{dish.price} TL</span>
                    </div>

                    {dish.description && (
                        <p className="text-[var(--color-text-muted)] text-sm mb-4">{dish.description}</p>
                    )}

                    {dish.ingredients && (
                        <div className="mb-4">
                            <h3 className="text-xs uppercase font-medium text-[var(--color-text-muted)] mb-1">İçerik</h3>
                            <p className="text-sm text-[var(--color-text)]">{dish.ingredients}</p>
                        </div>
                    )}

                    {dish.nutrition_info && (
                        <div className="mb-4">
                            <h3 className="text-xs uppercase font-medium text-[var(--color-text-muted)] mb-1">Besin Değerleri</h3>
                            <p className="text-sm text-[var(--color-text)]">{dish.nutrition_info}</p>
                        </div>
                    )}

                    <Button variant="primary" size="lg" className="w-full mt-2" onClick={() => onReview(dish.name)}>
                        Bu Ürünü Değerlendir
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
