"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Dish {
    _id: string;
    name: string;
    image?: string;
    price: number;
}

export default function MenuSelector({ onSelect }: { onSelect: (dishName: string) => void }) {
    const [menu, setMenu] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://gastromind-backend.onrender.com/api/menu/kral-burger")
            .then((res) => res.json())
            .then((data) => {
                setMenu(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="w-full max-w-md p-4 h-dvh flex flex-col bg-black">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Ne Yedin Kral? 😋</h2>

            {loading ? (
                <div className="text-white text-center animate-pulse">Menü Yükleniyor...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
                    {menu.map((item, index) => (
                        <motion.button
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelect(item.name)}
                            className="flex items-center gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-orange-500 transition-colors text-left"
                        >
                            <img
                                src={item.image || "https://via.placeholder.com/100"}
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div>
                                <h3 className="text-white font-bold">{item.name}</h3>
                                <span className="text-orange-500 font-bold">{item.price} TL</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}