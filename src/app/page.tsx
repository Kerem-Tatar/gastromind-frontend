"use client";

import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RecommendationGame from "@/components/RecommendationGame";
import MenuSelector from "@/components/MenuSelector";
import FeedbackFlow from "@/components/FeedbackFlow";
import { AnimatePresence } from "framer-motion";

// Sayfa Durumları: 'welcome' | 'game' | 'menu_select' | 'chat'
type ViewState = 'welcome' | 'game' | 'menu_select' | 'chat';

export default function Home() {
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
        <RecommendationGame category={selectedCategory} />
      )}

      {/* 3. YEMEK SEÇİMİ (Direkt Değerlendirme İçin) */}
      {view === 'menu_select' && (
        <MenuSelector onSelect={(dishName) => {
          setSelectedDish(dishName);
          setView('chat');
        }} />
      )}

      {/* 4. SOHBET MODU (Feedback) */}
      {view === 'chat' && (
        <AnimatePresence>
          <FeedbackFlow
            restaurantSlug="kral-burger"
            dishName={selectedDish}
            onClose={() => setView('welcome')}
          />
        </AnimatePresence>
      )}

    </main>
  );
}