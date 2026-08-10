"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// 👇 YENİ: BarChart ve Legend eklendi
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { API_URL } from "@/lib/api";

// --- TİP TANIMLAMALARI ---
interface DetailedScore {
    category: string;
    item: string;
    score: number;
}

interface TopDish {
    name: string;
    score: number;
    count: number;
}

interface CategoryStat {
    name: string;
    score: number;
}

interface Feedback {
    _id: string;
    dish_name: string;
    sentiment_score: number;
    detailed_scores?: DetailedScore[];
    summary_tags?: string[];
    created_at: string;
    customer_photo?: string;
    conversation_history?: { role: string; content: string }[];
}

interface Stats {
    period: string;
    totalFeedback: number;
    averageScore: number;
    aiAnalysis: string;
    isCached: boolean;
    topDishes?: TopDish[];        // <--- YENİ
    categoryStats?: CategoryStat[]; // <--- YENİ
    feedbacksPreview?: Feedback[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("daily");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const router = useRouter();

    const fetchStats = (period: string) => {
        setLoading(true);
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        fetch(`${API_URL}/api/admin/dashboard-stats?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem("admin_token");
                    router.push("/admin/login");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Veri hatası:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStats(selectedPeriod);
    }, [selectedPeriod]);

    // SİMÜLASYON (SEEDER)
    const handleSeedData = async () => {
        if (!confirm("⚠️ DİKKAT: 50 adet detaylı test verisi eklenecek.")) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_URL}/api/seed-fake-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            alert(data.message);
            fetchStats(selectedPeriod);
        } catch (error) {
            alert("Hata oluştu.");
            setLoading(false);
        }
    };

    // GRAFİK VERİSİ (Zaman Serisi)
    const chartData = stats?.feedbacksPreview
        ? [...stats.feedbacksPreview].reverse().map(f => ({
            time: new Date(f.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            score: f.sentiment_score
        }))
        : [];

    const periods = [
        { id: "daily", label: "Bugün" },
        { id: "weekly", label: "Bu Hafta" },
        { id: "monthly", label: "Bu Ay" },
        { id: "yearly", label: "Bu Yıl" },
        { id: "all", label: "Tüm Zamanlar" },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-8 relative font-sans">

            {/* LIGHTBOX */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                        GastroMind Yönetim
                    </h1>
                    <p className="text-gray-500 text-sm">Zaman Damgası ile Güçlendirilmiş Analiz</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSeedData} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">🧪 Veri Bas</button>
                    <button onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin/login"); }} className="bg-zinc-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold border border-zinc-700">Çıkış Yap</button>
                </div>
            </div>

            {/* DÖNEM SEÇİCİ */}
            <div className="flex flex-wrap gap-2 mb-8 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 w-fit">
                {periods.map((p) => (
                    <button key={p.id} onClick={() => setSelectedPeriod(p.id)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedPeriod === p.id ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" : "text-gray-400 hover:bg-zinc-800"}`}>
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64"><p className="text-gray-400 animate-pulse">Analiz ediliyor...</p></div>
            ) : (
                <>
                    {/* 1. SATIR: TEMEL KARTLAR */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                            <h3 className="text-gray-400 text-xs uppercase font-bold">Toplam İşlem</h3>
                            <p className="text-4xl font-black text-white mt-2">{stats?.totalFeedback || 0}</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                            <h3 className="text-gray-400 text-xs uppercase font-bold">Ortalama Puan</h3>
                            <p className={`text-4xl font-black mt-2 ${(stats?.averageScore || 0) >= 4 ? 'text-green-500' : 'text-orange-500'}`}>{(stats?.averageScore || 0).toFixed(1)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-2xl border border-orange-500/30 md:col-span-2">
                            <h3 className="text-orange-400 font-bold uppercase text-xs mb-2">🤖 AI Danışman</h3>
                            <p className="text-sm text-gray-300 italic line-clamp-3 hover:line-clamp-none transition-all">"{stats?.aiAnalysis}"</p>
                        </div>
                    </div>

                    {/* 2. SATIR: GRAFİKLER (YENİ EKLENEN KISIM) 📊 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                        {/* SOL: KATEGORİ PERFORMANSI */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-80">
                            <h3 className="text-gray-400 mb-4 text-sm uppercase font-bold flex items-center gap-2">📊 Kategori Karnesi</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.categoryStats} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" domain={[0, 5]} hide />
                                    <YAxis dataKey="name" type="category" stroke="#fff" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {stats?.categoryStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#22c55e' : entry.score >= 2.5 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* SAĞ: EN ÇOK KONUŞULANLAR (TOP DISHES) */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-80">
                            <h3 className="text-gray-400 mb-4 text-sm uppercase font-bold flex items-center gap-2">🏆 En Çok Konuşulanlar</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.topDishes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} interval={0} />
                                    <YAxis domain={[0, 5]} stroke="#666" />
                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                                    <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. SATIR: ZAMAN ÇİZELGESİ (ESKİ GRAFİK) */}
                    <div className="mb-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 h-72">
                        <h3 className="text-gray-400 mb-4 text-sm uppercase font-bold">📈 Zaman İçinde Değişim</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="time" stroke="#666" />
                                <YAxis domain={[0, 5]} stroke="#666" />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                                <Area type="monotone" dataKey="score" stroke="#f97316" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* LİSTE */}
                    <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">📝 Detaylı Geri Bildirimler</h2>
                    <div className="grid gap-4 pb-20">
                        {stats?.feedbacksPreview?.map((fb) => (
                            <div key={fb._id} className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-4 hover:border-zinc-600 transition-colors">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{fb.dish_name}</h3>
                                            <span className="text-xs text-gray-500">{new Date(fb.created_at).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${fb.sentiment_score >= 4 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {fb.sentiment_score}/5
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm bg-black/40 p-3 rounded-lg border border-white/5 mb-3">
                                        "{(fb.conversation_history || []).find(m => m.role === 'user')?.content || "Yorum yok"}"
                                    </p>
                                    {/* DETAY PUANLARI */}
                                    {fb.detailed_scores && fb.detailed_scores.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {fb.detailed_scores.map((ds, idx) => (
                                                <div key={idx} className={`px-2 py-1 rounded text-xs border flex items-center gap-2 ${ds.score >= 4 ? 'bg-green-950/30 border-green-800 text-green-300' : ds.score <= 2 ? 'bg-red-950/30 border-red-800 text-red-300' : 'bg-yellow-950/30 border-yellow-800 text-yellow-300'}`}>
                                                    <span className="opacity-70 font-semibold">{ds.item}:</span>
                                                    <span className="font-bold text-base">{ds.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {fb.customer_photo && (
                                    <div className="shrink-0">
                                        <img src={fb.customer_photo} className="w-24 h-24 object-cover rounded-xl cursor-zoom-in border border-zinc-700" onClick={() => setSelectedImage(fb.customer_photo!)} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}