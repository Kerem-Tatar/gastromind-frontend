"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { FlaskConical, Bot, BarChart3, Trophy, TrendingUp, ClipboardList, UtensilsCrossed, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
    topDishes?: TopDish[];
    categoryStats?: CategoryStat[];
    feedbacksPreview?: Feedback[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("daily");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [aiExpanded, setAiExpanded] = useState(false);
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

    const handleSeedData = async () => {
        if (!confirm("50 adet detaylı test verisi eklenecek. Devam edilsin mi?")) return;
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
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-8 relative">

            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--color-text)]">GastroMind Yönetim</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Zaman damgası ile güçlendirilmiş analiz</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/menu">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <UtensilsCrossed size={16} /> Menü İçeriği
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={handleSeedData} className="flex items-center gap-2">
                        <FlaskConical size={16} /> Test Verisi Ekle
                    </Button>
                    <Button variant="secondary" onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin/login"); }}>
                        Çıkış Yap
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)] w-fit">
                {periods.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPeriod(p.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === p.id ? "bg-[var(--color-brand)] text-white" : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"}`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 size={28} className="text-[var(--color-brand)] animate-spin" />
                    <p className="text-[var(--color-text-muted)]">Analiz ediliyor...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="p-6">
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase font-medium">Toplam İşlem</h3>
                            <p className="text-3xl font-semibold text-[var(--color-text)] mt-2">{stats?.totalFeedback || 0}</p>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase font-medium">Ortalama Puan</h3>
                            <p className={`text-3xl font-semibold mt-2 ${(stats?.averageScore || 0) >= 4 ? 'text-green-500' : 'text-[var(--color-brand)]'}`}>{(stats?.averageScore || 0).toFixed(1)}</p>
                        </Card>
                        <Card className="p-6 md:col-span-2">
                            <h3 className="text-[var(--color-brand)] font-medium uppercase text-xs mb-2 flex items-center gap-2">
                                <Bot size={14} /> AI Danışman
                            </h3>
                            <p className={`text-sm text-[var(--color-text-muted)] italic ${aiExpanded ? "" : "line-clamp-3"}`}>&quot;{stats?.aiAnalysis}&quot;</p>
                            {(stats?.aiAnalysis?.length || 0) > 160 && (
                                <button
                                    onClick={() => setAiExpanded((v) => !v)}
                                    className="text-xs text-[var(--color-brand)] mt-2 flex items-center gap-1"
                                >
                                    {aiExpanded ? <>Daralt <ChevronUp size={12} /></> : <>Devamını Oku <ChevronDown size={12} /></>}
                                </button>
                            )}
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="p-6 h-80">
                            <h3 className="text-[var(--color-text-muted)] mb-4 text-sm uppercase font-medium flex items-center gap-2">
                                <BarChart3 size={14} /> Kategori Karnesi
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.categoryStats} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                    <XAxis type="number" domain={[0, 5]} hide />
                                    <YAxis dataKey="name" type="category" stroke="#a1a1aa" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                        itemStyle={{ color: '#fafafa' }}
                                    />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {stats?.categoryStats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#22c55e' : entry.score >= 2.5 ? '#f59e0b' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card className="p-6 h-80">
                            <h3 className="text-[var(--color-text-muted)] mb-4 text-sm uppercase font-medium flex items-center gap-2">
                                <Trophy size={14} /> En Çok Konuşulanlar
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.topDishes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} interval={0} />
                                    <YAxis domain={[0, 5]} stroke="#71717a" />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                        itemStyle={{ color: '#fafafa' }}
                                    />
                                    <Bar dataKey="score" name="İlgili yorum sayısı" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <Card className="mb-8 p-6 h-72">
                        <h3 className="text-[var(--color-text-muted)] mb-4 text-sm uppercase font-medium flex items-center gap-2">
                            <TrendingUp size={14} /> Zaman İçinde Değişim
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="time" stroke="#71717a" />
                                <YAxis domain={[0, 5]} stroke="#71717a" />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
                                <Area type="monotone" dataKey="score" stroke="#ea580c" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    <h2 className="text-lg font-semibold mb-4 border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                        <ClipboardList size={18} /> Detaylı Geri Bildirimler
                    </h2>
                    <div className="grid gap-4 pb-20">
                        {stats?.feedbacksPreview?.map((fb) => (
                            <Card key={fb._id} className="p-5 flex flex-col md:flex-row gap-4 hover:border-[var(--color-text-muted)] transition-colors">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-[var(--color-text)] text-lg">{fb.dish_name}</h3>
                                            <span className="text-xs text-[var(--color-text-muted)]">{new Date(fb.created_at).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${fb.sentiment_score >= 4 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {fb.sentiment_score}/5
                                        </span>
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-sm bg-black/40 p-3 rounded-lg border border-white/5 mb-3">
                                        &quot;{(fb.conversation_history || []).find(m => m.role === 'user')?.content || "Yorum yok"}&quot;
                                    </p>
                                    {fb.detailed_scores && fb.detailed_scores.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {fb.detailed_scores.map((ds, idx) => (
                                                <div key={idx} className={`px-2 py-1 rounded text-xs border flex items-center gap-2 ${ds.score >= 4 ? 'bg-green-950/30 border-green-800 text-green-300' : ds.score <= 2 ? 'bg-red-950/30 border-red-800 text-red-300' : 'bg-yellow-950/30 border-yellow-800 text-yellow-300'}`}>
                                                    <span className="opacity-70 font-medium">{ds.item}:</span>
                                                    <span className="font-semibold text-base">{ds.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {fb.customer_photo && (
                                    <div className="shrink-0">
                                        <img src={fb.customer_photo} className="w-24 h-24 object-cover rounded-xl cursor-zoom-in border border-[var(--color-border)]" onClick={() => setSelectedImage(fb.customer_photo!)} />
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
