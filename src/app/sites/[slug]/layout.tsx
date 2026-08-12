"use client";
import { createContext, useContext, useState, useEffect, ReactNode, CSSProperties } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";

interface Dish {
    _id: string;
    name: string;
    description: string;
    price: number;
    tags: string[];
    image?: string;
}

interface QuestionData {
    question: string;
    optionA: { text: string; related_tag: string };
    optionB: { text: string; related_tag: string };
}

interface RecommendState {
    category: string | null;
    setCategory: (c: string | null) => void;
    excludedIds: string[];
    setExcludedIds: (ids: string[]) => void;
    history: string[][];
    setHistory: (h: string[][]) => void;
    questionData: QuestionData | null;
    setQuestionData: (q: QuestionData | null) => void;
    candidates: Dish[];
    setCandidates: (d: Dish[]) => void;
    recommendations: Dish[];
    setRecommendations: (d: Dish[]) => void;
    gameOver: boolean;
    setGameOver: (b: boolean) => void;
    progress: number;
    setProgress: (n: number) => void;
    reset: () => void;
}

// Öneri oyununun state'i burada, layout seviyesinde tutuluyor — Next.js App Router'da
// aynı layout altındaki route'lar arasında geçişte (recommend <-> menu) bu layout yeniden
// mount olmaz, yani kullanıcı menüye bakıp geri döndüğünde oyun kaldığı yerden devam eder.
const RecommendContext = createContext<RecommendState | null>(null);

export function useRecommendState() {
    const ctx = useContext(RecommendContext);
    if (!ctx) throw new Error("useRecommendState, sites/[slug] layout'u içinde kullanılmalı");
    return ctx;
}

export interface RestaurantCategory {
    id: string;
    name: string;
    icon: string;
}

export interface RestaurantInfo {
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font: string;
    categories: RestaurantCategory[];
}

const RestaurantInfoContext = createContext<{ restaurant: RestaurantInfo | null; loading: boolean }>({
    restaurant: null,
    loading: true,
});

export function useRestaurantInfo() {
    return useContext(RestaurantInfoContext);
}

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { slug } = useParams<{ slug: string }>();

    const [category, setCategory] = useState<string | null>(null);
    const [excludedIds, setExcludedIds] = useState<string[]>([]);
    const [history, setHistory] = useState<string[][]>([]);
    const [questionData, setQuestionData] = useState<QuestionData | null>(null);
    const [candidates, setCandidates] = useState<Dish[]>([]);
    const [recommendations, setRecommendations] = useState<Dish[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [progress, setProgress] = useState(10);

    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
    const [restaurantLoading, setRestaurantLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/restaurant/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setRestaurant(data);
                setRestaurantLoading(false);
            })
            .catch(() => setRestaurantLoading(false));
    }, [slug]);

    const reset = () => {
        setCategory(null);
        setExcludedIds([]);
        setHistory([]);
        setQuestionData(null);
        setCandidates([]);
        setRecommendations([]);
        setGameOver(false);
        setProgress(10);
    };

    // Restoranın kendi renkleri CSS değişkenlerini override ediyor — dün kurduğumuz
    // token mimarisi tam bunun için: hiçbir bileşenin kodu değişmeden tema değişiyor.
    const themeStyle: CSSProperties = restaurant
        ? ({
            "--color-brand": restaurant.primary_color,
            "--color-brand-hover": restaurant.secondary_color,
        } as CSSProperties)
        : {};

    return (
        <div style={themeStyle}>
            <RestaurantInfoContext.Provider value={{ restaurant, loading: restaurantLoading }}>
                <RecommendContext.Provider
                    value={{
                        category, setCategory,
                        excludedIds, setExcludedIds,
                        history, setHistory,
                        questionData, setQuestionData,
                        candidates, setCandidates,
                        recommendations, setRecommendations,
                        gameOver, setGameOver,
                        progress, setProgress,
                        reset,
                    }}
                >
                    {children}
                </RecommendContext.Provider>
            </RestaurantInfoContext.Provider>
        </div>
    );
}
