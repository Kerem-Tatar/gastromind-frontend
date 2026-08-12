import { HTMLAttributes } from "react";

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl ${className}`}
            {...props}
        />
    );
}
