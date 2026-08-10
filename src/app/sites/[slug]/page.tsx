"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import WelcomeScreen from "@/components/WelcomeScreen";
import RecommendationGame from "@/components/RecommendationGame";
import MenuSelector from "@/components/MenuSelector";
import FeedbackFlow from "@/components/FeedbackFlow";
import { AnimatePresence } from "framer-motion";

// Sayfa Durumları: 'welcome' | 'game' | 'menu_select' | 'chat'
type ViewState = 'welcome' | 'game' | 'menu_select' | 'chat';

export default function RestaurantSite() {
  const { slug } = useParams<{ slug: string }>();
  const [view, setView] = useState<ViewState>('welcome');
  const [selectedDish, setSelectedDish] = useState<string>("");

  // YENİ STATE: Kategori (Hafızada tutacağımız yer)
  const [selectedCategory, setSelectedCategory] = useState<string>("hepsi");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 overflow-hidden">

      {/* 1. KARŞILAMA EKRANI (Kategori Seçimli) */}
      {view === 'welcome' && (
        <WelcomeScreen
          onStart={(category) => { // WelcomeScreen artık bize kategori veriyor
            setSelectedCategory(category); // Biz de onu hafızaya atıyoruz
            setView('game'); // Ve oyunu başlatıyoruz
          }}
          onFeedback={() => setView('menu_select')}
        />
      )}

      {/* 2. OYUN MODU (Kategoriyi İçeri Gönderiyoruz) */}
      {view === 'game' && (
        <RecommendationGame category={selectedCategory} restaurantSlug={slug} />
      )}

      {/* 3. YEMEK SEÇİMİ (Direkt Değerlendirme İçin) */}
      {view === 'menu_select' && (
        <MenuSelector
          restaurantSlug={slug}
          onSelect={(dishName) => {
            setSelectedDish(dishName);
            setView('chat');
          }}
        />
      )}

      {/* 4. SOHBET MODU (Feedback) */}
      {view === 'chat' && (
        <AnimatePresence>
          <FeedbackFlow
            restaurantSlug={slug}
            dishName={selectedDish}
            onClose={() => setView('welcome')}
          />
        </AnimatePresence>
      )}

      <span className="fixed bottom-2 right-3 text-[10px] text-gray-600 select-none pointer-events-none z-40">
        Powered by GastroMind
      </span>

    </main>
  );
}
