"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import FeedbackFlow from "./FeedbackFlow";
import { API_URL } from "@/lib/api";

interface QuestionData {
    question: string;
    optionA: { text: string; related_tag: string };
    optionB: { text: string; related_tag: string };
}

interface Dish {
    _id: string;
    name: string;
    description: string;
    price: number;
    tags: string[];
    image?: string;
}

export default function RecommendationGame({ category, restaurantSlug }: { category: string; restaurantSlug: string }) {
    const [loading, setLoading] = useState(true);
    const [questionData, setQuestionData] = useState<QuestionData | null>(null);
    const [recommendations, setRecommendations] = useState<Dish[]>([]);

    // --- GEÇMİŞ YÖNETİMİ ---
    const [excludedIds, setExcludedIds] = useState<string[]>([]);
    const [history, setHistory] = useState<string[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [progress, setProgress] = useState(10);

    // Drag Ayarları
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacityRight = useTransform(x, [50, 150], [0, 1]);
    const opacityLeft = useTransform(x, [-50, -150], [0, 1]);

    const fetchNextStep = async (currentExcludedIds: string[]) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/recommend-dish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantSlug,
                    excludedDishIds: currentExcludedIds,
                    selectedCategory: category
                }),
            });
            const data = await res.json();

            if (data.status === "complete") {
                setRecommendations(data.recommendations);
                setGameOver(true);
                setProgress(100);
            } else {
                setQuestionData(data.question_data);
                (window as any).currentCandidates = data.candidates;
                setProgress((prev) => Math.min(prev + 15, 90));
            }
        } catch (error) {
            console.error("Hata:", error);
        }
        setLoading(false);
        x.set(0);
    };

    useEffect(() => {
        fetchNextStep([]);
    }, []);

    const handleDragEnd = (event: any, info: any) => {
        const swipeThreshold = 100;
        if (info.offset.x > swipeThreshold) {
            handleChoice(questionData!.optionA.related_tag);
        } else if (info.offset.x < -swipeThreshold) {
            handleChoice(questionData!.optionB.related_tag);
        }
    };

    const handleChoice = (tag: string) => {
        setHistory((prev) => [...prev, excludedIds]);
        const candidates: Dish[] = (window as any).currentCandidates || [];
        const newExcluded = candidates
            .filter((dish) => !dish.tags.includes(tag))
            .map((dish) => dish._id);
        const updatedExcludedList = [...excludedIds, ...newExcluded];
        setExcludedIds(updatedExcludedList);
        fetchNextStep(updatedExcludedList);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));
        setExcludedIds(previousState);
        setGameOver(false);
        setProgress((prev) => Math.max(prev - 15, 10));
        fetchNextStep(previousState);
    };

    // --- OYUN BİTTİ EKRANI ---
    if (gameOver) {
        const winner = recommendations[0];
        const imageSrc = winner?.image || "https://via.placeholder.com/400?text=Resim+Yok";

        return (
            <div className="relative w-full h-dvh flex flex-col items-center justify-center p-4 bg-zinc-950">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-orange-500/50 relative z-20 flex flex-col max-h-[85dvh]"
                >
                    <button
                        onClick={handleBack}
                        className="absolute top-4 left-4 z-30 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-black/80 transition-colors"
                    >
                        ↩
                    </button>

                    <div className="relative h-64 shrink-0 w-full">
                        <img src={imageSrc} alt={winner?.name} className="h-full w-full object-cover" />
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-zinc-900 to-transparent h-24"></div>
                    </div>

                    <div className="p-6 text-center flex flex-col justify-between flex-1 overflow-y-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-orange-500 mb-1">🎉 Eşleşme!</h2>
                            <h3 className="text-xl text-white font-bold">{winner?.name}</h3>
                            <p className="text-gray-400 mt-2 text-sm line-clamp-2">{winner?.description}</p>
                            <div className="mt-2 text-2xl font-bold text-green-400">{winner?.price} TL</div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <button onClick={() => setShowFeedback(true)} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg animate-pulse text-sm">
                                💬 Barış ile Değerlendir
                            </button>
                            <button onClick={() => window.location.reload()} className="w-full py-3 bg-zinc-800 text-gray-400 hover:text-white rounded-xl font-medium text-sm transition-colors">
                                🔄 Baştan Başla
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFeedback && (
                            <FeedbackFlow
                                restaurantSlug={restaurantSlug}
                                dishName={winner?.name}
                                onClose={() => setShowFeedback(false)}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    }

    // --- OYUN EKRANI (FULL RESPONSIVE) ---
    return (
        <div className="relative w-full h-dvh flex flex-col justify-center items-center overflow-hidden bg-zinc-950 px-4">

            {/* GERİ BUTONU */}
            {history.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className="absolute top-4 left-4 z-50 bg-zinc-800/80 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-zinc-600 shadow-lg"
                >
                    <span className="text-xl pb-1">↩</span>
                </motion.button>
            )}

            {/* İLERLEME ÇUBUKLARI */}
            <motion.div animate={{ width: `${progress}%` }} className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-orange-600 to-transparent z-0" style={{ width: '150%', transformOrigin: 'top left', rotate: '45deg' }} />
            <motion.div animate={{ width: `${progress}%` }} className="fixed top-0 right-0 h-1.5 bg-gradient-to-l from-orange-600 to-transparent z-0" style={{ width: '150%', transformOrigin: 'top right', rotate: '-45deg' }} />

            {loading ? (
                <div className="text-white text-xl animate-pulse z-10">Kartlar Karılıyor...</div>
            ) : (
                // 1. KART KAPLAYICISI: Ekranın %70 yüksekliğini kaplasın, maksimum 360px genişlik
                <div className="relative w-full max-w-[360px] h-[70dvh] max-h-[600px] min-h-[400px]">

                    {/* Arka Gölge Kartlar */}
                    <div className="absolute inset-0 bg-zinc-800 rounded-3xl transform scale-90 translate-y-4 opacity-50 z-0"></div>
                    <div className="absolute inset-0 bg-zinc-800 rounded-3xl transform scale-95 translate-y-2 opacity-75 z-0"></div>

                    {/* HAREKETLİ ANA KART */}
                    <motion.div
                        style={{ x, rotate }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl z-10 cursor-grab active:cursor-grabbing flex flex-col"
                    >
                        {/* 2. İÇERİK DAĞILIMI (FLEX-COL & JUSTIFY-BETWEEN) */}
                        {/* Bu sayede içerik her zaman kartın içine eşit yayılır, sıkışmaz */}
                        <div className="flex-1 flex flex-col items-center justify-between p-6 pb-8">

                            {/* ÜST: Etiketler */}
                            <div className="w-full flex justify-between relative h-10">
                                <motion.div style={{ opacity: opacityRight }} className="absolute left-0 border-2 border-green-500 text-green-500 font-bold text-sm sm:text-base px-3 py-1 rounded-lg transform -rotate-12">
                                    {questionData?.optionA.text.toUpperCase()}
                                </motion.div>

                                <motion.div style={{ opacity: opacityLeft }} className="absolute right-0 border-2 border-red-500 text-red-500 font-bold text-sm sm:text-base px-3 py-1 rounded-lg transform rotate-12">
                                    {questionData?.optionB.text.toUpperCase()}
                                </motion.div>
                            </div>

                            {/* ORTA: Emoji ve Soru */}
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                {/* Emoji: Ekran boyutuna göre ölçeklenen font */}
                                <div className="text-[15vh] leading-none select-none drop-shadow-2xl">
                                    🤔
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight select-none drop-shadow-md px-2">
                                    {questionData?.question}
                                </h2>
                            </div>

                            {/* ALT: Yönlendirme Okları */}
                            <div className="w-full flex justify-between text-xs text-gray-500 font-bold select-none pt-4 border-t border-white/5">
                                <span className="flex items-center gap-1">⬅️ {questionData?.optionB.text}</span>
                                <span className="flex items-center gap-1">{questionData?.optionA.text} ➡️</span>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}