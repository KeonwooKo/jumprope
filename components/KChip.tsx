import type { ReactNode } from "react";

type Variant = "default" | "gold" | "soft";

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  default: "bg-k-blue-soft text-k-blue-depth border border-k-blue-soft-2",
  gold:    "bg-[#fff6d0] text-[#8a6200] border border-[#ffe38a]",
  soft:    "bg-panel-sub text-ink-sub border border-line",
};

export function KChip({ children, variant = "default", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-[9px] py-[3px] rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
