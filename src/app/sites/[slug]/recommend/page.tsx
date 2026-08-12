"use client";

import { useParams } from "next/navigation";
import CategoryPicker from "@/components/CategoryPicker";
import RecommendationGame from "@/components/RecommendationGame";
import { useRecommendState } from "../layout";

export default function RecommendPage() {
    const { slug } = useParams<{ slug: string }>();
    const { category, setCategory } = useRecommendState();

    if (!category) {
        return <CategoryPicker onSelect={setCategory} />;
    }

    return <RecommendationGame restaurantSlug={slug} />;
}
