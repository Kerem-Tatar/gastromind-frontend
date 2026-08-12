"use client";
import { InputHTMLAttributes } from "react";

export default function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] p-3 rounded-xl outline-none transition-colors focus:border-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] ${className}`}
            {...props}
        />
    );
}
