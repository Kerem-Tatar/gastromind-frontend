"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Send, X } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Message {
    role: 'ai' | 'user';
    text: string;
    image?: string;
}

interface FeedbackFlowProps {
    restaurantSlug: string;
    dishName?: string;
    onClose: () => void;
}

export default function FeedbackFlow({ restaurantSlug, dishName, onClose }: FeedbackFlowProps) {
    const openingMessage = dishName
        ? `Selam! ${dishName} nasıldı? Dürüst ol, aramızda kalacak.`
        : `Selam! Deneyimin hakkında ne düşünüyorsun, seni dinliyorum.`;

    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: openingMessage }
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const userMsg: Message = {
            role: 'user',
            text: inputText,
            image: selectedImage || undefined
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setSelectedImage(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/submit-feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantSlug,
                    dishName,
                    conversation: [...messages, userMsg],
                    customerPhoto: userMsg.image
                }),
            });

            const data = await res.json();

            if (data.status === "success") {
                setMessages(prev => [...prev, { role: 'ai', text: "Teşekkürler, geri bildirimini aldım." }]);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Bir hata oluştu ama yazdıklarını kaydettim." }]);
            }

        } catch (error) {
            console.error("Hata:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Sunucuya ulaşamadım." }]);
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
                <h2 className="text-[var(--color-text)] font-medium">{dishName ? `${dishName} Hakkında` : "Geri Bildirim"}</h2>
                <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-[var(--color-brand)] text-white'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]'
                            }`}>
                            {msg.image && (
                                <img src={msg.image} alt="Yüklenen" className="w-full rounded-lg mb-2 border border-white/20" />
                            )}
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-[var(--color-text-muted)] text-sm animate-pulse">yazıyor...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">

                {selectedImage && (
                    <div className="mb-2 flex items-center gap-2">
                        <div className="relative w-16 h-16">
                            <img src={selectedImage} className="w-full h-full object-cover rounded-lg border border-[var(--color-brand)]" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-[var(--color-danger)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">Fotoğraf eklendi</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl hover:text-[var(--color-text)] transition-colors"
                    >
                        <Camera size={18} />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Düşüncelerin..."
                        className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 text-[var(--color-text)] focus:border-[var(--color-brand)] outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />

                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="p-3 bg-[var(--color-brand)] text-white rounded-xl font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
