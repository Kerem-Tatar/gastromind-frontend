"use client";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
    primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
    secondary: "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-brand)]",
    ghost: "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
    danger: "text-[var(--color-danger)] hover:text-red-400",
};

const SIZE_CLASSES: Record<Size, string> = {
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-base rounded-xl",
};

export default function Button({ variant = "primary", size = "md", className = "", disabled, ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            className={`font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
            {...props}
        />
    );
}
