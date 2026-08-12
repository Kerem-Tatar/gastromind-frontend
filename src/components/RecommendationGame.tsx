"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Undo2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useRecommendState } from "@/app/sites/[slug]/layout";
import Button from "@/components/ui/Button";

interface Dish {
    _id: string;
    name: string;
    description: string;
    price: number;
    tags: string[];
    image?: string;
}

export default function RecommendationGame({ restaurantSlug }: { restaurantSlug: string }) {
    const router = useRouter();
    const {
        category,
        excludedIds, setExcludedIds,
        history, setHistory,
        questionData, setQuestionData,
        candidates, setCandidates,
        recommendations, setRecommendations,
        gameOver, setGameOver,
        progress, setProgress,
    } = useRecommendState();

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacityRight = useTransform(x, [50, 150], [0, 1]);
    const opacityLeft = useTransform(x, [-50, -150], [0, 1]);

    const fetchNextStep = async (currentExcludedIds: string[]) => {
        try {
            const res = await fetch(`${API_URL}/api/recommend-dish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantSlug,
                    excludedDishIds: currentExcludedIds,
                    selectedCategory: category,
                }),
            });
            const data = await res.json();

            if (data.status === "complete") {
                setRecommendations(data.recommendations);
                setGameOver(true);
                setProgress(100);
            } else {
                setQuestionData(data.question_data);
                setCandidates(data.candidates);
                setProgress(Math.min(progress + 15, 90));
            }
        } catch (error) {
            console.error("Hata:", error);
        }
        x.set(0);
    };

    // Sadece hiç soru gelmemişse (ilk giriş) baştan başla — context sayesinde
    // menüye gidip geri dönünce burası tekrar çalışmaz, kaldığı yerden devam eder.
    useEffect(() => {
        if (!questionData && !gameOver) {
            fetchNextStep(excludedIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDragEnd = (event: unknown, info: { offset: { x: number } }) => {
        const swipeThreshold = 100;
        if (info.offset.x > swipeThreshold) {
            handleChoice(questionData!.optionA.related_tag);
        } else if (info.offset.x < -swipeThreshold) {
            handleChoice(questionData!.optionB.related_tag);
        }
    };

    const handleChoice = (tag: string) => {
        setHistory([...history, excludedIds]);
        const newExcluded = candidates.filter((dish) => !dish.tags.includes(tag)).map((dish) => dish._id);
        const updatedExcludedList = [...excludedIds, ...newExcluded];
        setExcludedIds(updatedExcludedList);
        fetchNextStep(updatedExcludedList);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setExcludedIds(previousState);
        setGameOver(false);
        setProgress(Math.max(progress - 15, 10));
        fetchNextStep(previousState);
    };

    const goToFeedback = (dishName?: string) => {
        const params = dishName ? `?dish=${encodeURIComponent(dishName)}` : "";
        router.push(`/feedback${params}`);
    };

    if (gameOver) {
        const winner = recommendations[0];

        return (
            <div className="relative w-full h-dvh flex flex-col items-center justify-center p-4 bg-[var(--color-bg)]">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)] relative flex flex-col max-h-[85dvh]"
                >
                    <button
                        onClick={handleBack}
                        className="absolute top-4 left-4 z-10 bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10"
                    >
                        <Undo2 size={18} />
                    </button>

                    <div className="relative h-64 shrink-0 w-full bg-[var(--color-border)]">
                        {winner?.image && (
                            <img src={winner.image} alt={winner?.name} className="h-full w-full object-cover" />
                        )}
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--color-surface)] to-transparent h-24" />
                    </div>

                    <div className="p-6 text-center flex flex-col justify-between flex-1 overflow-y-auto">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-brand)] mb-1">Eşleşme bulundu</h2>
                            <h3 className="text-xl text-[var(--color-text)] font-semibold">{winner?.name}</h3>
                            <p className="text-[var(--color-text-muted)] mt-2 text-sm line-clamp-2">{winner?.description}</p>
                            <div className="mt-2 text-xl font-semibold text-[var(--color-text)]">{winner?.price} TL</div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <Button variant="primary" size="lg" className="w-full" onClick={() => goToFeedback(winner?.name)}>
                                Değerlendir
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => window.location.reload()}>
                                Baştan Başla
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-dvh flex flex-col justify-center items-center overflow-hidden bg-[var(--color-bg)] px-4">
            {history.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleBack}
                    className="absolute top-4 left-4 z-50 bg-[var(--color-surface)] text-[var(--color-text)] w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)]"
                >
                    <Undo2 size={18} />
                </motion.button>
            )}

            <motion.div animate={{ width: `${progress}%` }} className="fixed top-0 left-0 h-1 bg-[var(--color-brand)] z-0" />

            {!questionData ? (
                <div className="text-[var(--color-text-muted)] text-lg animate-pulse z-10">Hazırlanıyor...</div>
            ) : (
                <div className="relative w-full max-w-[360px] h-[70dvh] max-h-[600px] min-h-[400px]">
                    <div className="absolute inset-0 bg-[var(--color-surface)] rounded-2xl transform scale-90 translate-y-4 opacity-40 z-0" />
                    <div className="absolute inset-0 bg-[var(--color-surface)] rounded-2xl transform scale-95 translate-y-2 opacity-70 z-0" />

                    <motion.div
                        style={{ x, rotate }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl z-10 cursor-grab active:cursor-grabbing flex flex-col"
                    >
                        <div className="flex-1 flex flex-col items-center justify-between p-6 pb-8">
                            <div className="w-full flex justify-between relative h-10">
                                <motion.div style={{ opacity: opacityRight }} className="absolute left-0 border border-green-600 text-green-500 font-medium text-sm px-3 py-1 rounded-lg">
                                    {questionData?.optionA.text.toUpperCase()}
                                </motion.div>
                                <motion.div style={{ opacity: opacityLeft }} className="absolute right-0 border border-red-600 text-red-500 font-medium text-sm px-3 py-1 rounded-lg">
                                    {questionData?.optionB.text.toUpperCase()}
                                </motion.div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                <h2 className="text-xl font-semibold text-[var(--color-text)] leading-tight select-none px-2">
                                    {questionData?.question}
                                </h2>
                            </div>

                            <div className="w-full flex justify-between text-xs text-[var(--color-text-muted)] font-medium select-none pt-4 border-t border-[var(--color-border)]">
                                <span>← {questionData?.optionB.text}</span>
                                <span>{questionData?.optionA.text} →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
