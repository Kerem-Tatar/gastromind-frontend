"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MenuSelector from "@/components/MenuSelector";

export default function MenuPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    return (
        <main className="min-h-dvh bg-[var(--color-bg)] relative">
            <button
                onClick={() => router.push(`/`)}
                className="absolute top-4 left-4 z-10 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] w-10 h-10 rounded-full flex items-center justify-center"
            >
                <ArrowLeft size={18} />
            </button>
            <MenuSelector
                restaurantSlug={slug}
                onReview={(dishName) => router.push(`/feedback?dish=${encodeURIComponent(dishName)}`)}
            />
        </main>
    );
}
