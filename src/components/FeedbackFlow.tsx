"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

interface Message {
    role: 'ai' | 'user';
    text: string;
    image?: string; // Mesajlarda görsel desteği
}

interface FeedbackFlowProps {
    restaurantSlug: string;
    dishName: string;
    onClose: () => void;
}

export default function FeedbackFlow({ restaurantSlug, dishName, onClose }: FeedbackFlowProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: `Selam! ${dishName} nasıldı? Dürüst ol, aramızda kalacak. 😉` }
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);

    // --- FOTOĞRAF İÇİN YENİ STATE'LER ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ------------------------------------

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- FOTOĞRAF SEÇME FONKSİYONU ---
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string); // Resmi Base64 formatına çevirip hafızaya al
            };
            reader.readAsDataURL(file);
        }
    };

    // --- MESAJ GÖNDERME ---
    const handleSend = async () => {
        if (!inputText.trim() && !selectedImage) return; // Boşsa gönderme

        // 1. Kullanıcı Mesajını Ekrana Bas
        const userMsg: Message = {
            role: 'user',
            text: inputText,
            image: selectedImage || undefined // Varsa resmi de ekle
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setSelectedImage(null); // Resmi temizle
        setLoading(true);

        // 2. Backend'e Gönder (Fotoğraf Dahil)
        try {
            const res = await fetch(`${API_URL}/api/submit-feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantSlug,
                    dishName,
                    conversation: [...messages, userMsg], // Tüm geçmişi gönder
                    customerPhoto: userMsg.image // <--- YENİ: Fotoğrafı Backend'e gönderiyoruz
                }),
            });

            const data = await res.json();

            // 3. AI Cevabını Ekrana Bas
            if (data.status === "success") {
                setMessages(prev => [...prev, { role: 'ai', text: "Harika! Geri bildirimin için teşekkürler. Notlarımı aldım! 📝" }]);
                setTimeout(() => {
                    onClose(); // 3 saniye sonra kapat
                }, 3000);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Bir hata oluştu ama yazdıklarını kaydettim." }]);
            }

        } catch (error) {
            console.error("Hata:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sunucuya ulaşamadım :(" }]);
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
        >
            {/* ÜST BAR */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                <h2 className="text-white font-bold">{dishName} Hakkında</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {/* MESAJ ALANI */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white'
                            : 'bg-zinc-800 text-gray-200'
                            }`}>
                            {/* Varsa Fotoğrafı Göster */}
                            {msg.image && (
                                <img src={msg.image} alt="Yüklenen" className="w-full rounded-lg mb-2 border border-white/20" />
                            )}
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-gray-500 text-sm animate-pulse">Barış yazıyor...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* ALT BAR (INPUT & KAMERA) */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">

                {/* Fotoğraf Önizleme (Seçildiyse Göster) */}
                {selectedImage && (
                    <div className="mb-2 flex items-center gap-2">
                        <div className="relative w-16 h-16">
                            <img src={selectedImage} className="w-full h-full object-cover rounded-lg border border-orange-500" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >✕</button>
                        </div>
                        <span className="text-xs text-gray-400">Fotoğraf eklendi</span>
                    </div>
                )}

                <div className="flex gap-2">
                    {/* GİZLİ INPUT (Sadece butonla tetiklenir) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*" // Sadece resim dosyaları
                        className="hidden"
                    />

                    {/* KAMERA BUTONU */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-zinc-800 text-gray-400 rounded-xl hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                        📷
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Düşüncelerin..."
                        className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-orange-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />

                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="p-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 disabled:opacity-50"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </motion.div>
    );
}