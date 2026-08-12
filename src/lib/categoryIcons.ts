import {
    Beef, Drumstick, Fish, Salad, Soup, Sandwich, Croissant,
    Coffee, CupSoda, Wine, IceCreamBowl, Cookie, UtensilsCrossed,
    type LucideIcon,
} from "lucide-react";

// Curated set of category icons — superadmin picks from this list when creating a
// category, customer app renders the matching icon. Keeps every restaurant's
// categories looking consistent instead of relying on free-text emoji.
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    Beef, Drumstick, Fish, Salad, Soup, Sandwich, Croissant,
    Coffee, CupSoda, Wine, IceCreamBowl, Cookie, UtensilsCrossed,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP);

export function getCategoryIcon(name?: string): LucideIcon {
    return (name && CATEGORY_ICON_MAP[name]) || UtensilsCrossed;
}
