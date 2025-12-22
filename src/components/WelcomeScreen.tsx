"use client";

import { motion } from "framer-motion";

// Kategorilerimiz
const categories = [
    { id: "ana_yemek", name: "Ana Yemekler", emoji: "🍔", color: "from-orange-500 to-red-600" },
    { id: "atistirmalik", name: "Atıştırmalık", emoji: "🍟", color: "from-yellow-400 to-orange-500" },
    { id: "icecek", name: "İçecekler", emoji: "🍹", color: "from-blue-400 to-blue-600" },
    { id: "tatli", name: "Tatlılar", emoji: "🍰", color: "from-pink-500 to-rose-500" },
    { id: "hepsi", name: "Kararsızım / Hepsi", emoji: "🎲", color: "from-purple-500 to-indigo-600" },
];

// Prop olarak artık 'category' kabul eden bir onStart fonksiyonu alıyoruz
export default function WelcomeScreen({ onStart, onFeedback }: { onStart: (category: string) => void, onFeedback: () => void }) {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-black px-4 py-8 text-center overflow-y-auto">

            {/* Logo & Başlık */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 border-2 border-orange-500 text-5xl shadow-xl shadow-orange-500/20">
                    👑
                </div>
                <h1 className="text-3xl font-bold text-white">Kral Burger</h1>
                <p className="text-gray-400 mt-2">Bugün modun hangisi?</p>
            </motion.div>

            {/* Kategori Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onStart(cat.id)} // Seçilen kategoriyi gönder
                        className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${cat.color} shadow-lg text-left flex flex-col justify-between h-32 ${cat.id === 'hepsi' ? 'col-span-2' : ''}`}
                    >
                        <span className="text-4xl mb-2">{cat.emoji}</span>
                        <span className="text-white font-bold text-lg leading-tight">{cat.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* Alt Buton: Değerlendir */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onFeedback}
                className="text-gray-500 text-sm hover:text-white underline"
            >
                Yemeğimi zaten yedim, değerlendirmek istiyorum.
            </motion.button>

        </div>
    );
}