"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import FeedbackFlow from "@/components/FeedbackFlow";

function FeedbackContent() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dish = searchParams.get("dish") || undefined;

    return (
        <AnimatePresence>
            <FeedbackFlow
                restaurantSlug={slug}
                dishName={dish}
                onClose={() => router.push(`/`)}
            />
        </AnimatePresence>
    );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={null}>
            <FeedbackContent />
        </Suspense>
    );
}
