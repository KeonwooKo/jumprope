import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "filled" | "outline" | "round";

type CommonProps = {
  children?: ReactNode;
  size?: Size;
  variant?: Variant;
  block?: boolean;
  className?: string;
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 pt-2 pb-[11px] text-xs rounded-[9px]",
  md: "px-5 pt-3 pb-4 text-sm rounded-xl",
  lg: "px-[22px] pt-[15px] pb-5 text-base rounded-[14px]",
};

const filledClasses =
  "text-white font-extrabold [text-shadow:0_1px_0_rgba(10,65,90,.35)] " +
  "border-[1.5px] border-k-blue-outline " +
  "bg-[linear-gradient(180deg,var(--color-k-blue-hi)_0%,var(--color-k-blue)_55%,var(--color-k-blue-mid)_82%)] " +
  "shadow-[inset_0_1.5px_0_rgba(255,255,255,.55),inset_0_-5px_0_var(--color-k-blue-depth),inset_0_-6.5px_0_rgba(10,65,90,.45),0_2px_0_rgba(15,93,127,.25)]";

const outlineClasses =
  "text-k-blue-depth font-extrabold " +
  "border-[1.5px] border-k-blue-outline bg-[#f2f7fb] " +
  "shadow-[inset_0_1.5px_0_#fff,inset_0_-3px_0_#cfdae6,inset_0_-4.5px_0_#a9bdce]";

const roundClasses =
  "w-11 h-11 p-0 rounded-full grid place-items-center text-white font-extrabold " +
  "border-[1.5px] border-k-blue-outline " +
  "bg-[linear-gradient(180deg,var(--color-k-blue-hi)_0%,var(--color-k-blue)_55%,var(--color-k-blue-mid)_100%)] " +
  "shadow-[inset_0_2px_0_rgba(255,255,255,.5),inset_0_-5px_0_var(--color-k-blue-depth),inset_0_-6px_0_rgba(10,65,90,.35),0_2px_0_rgba(15,93,127,.2)]";

function baseClasses({
  size = "md",
  variant = "filled",
  block,
  className = "",
}: CommonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 cursor-pointer active:translate-y-px transition-transform";
  const variantClass =
    variant === "outline"
      ? outlineClasses
      : variant === "round"
      ? roundClasses
      : filledClasses;
  const sizeClass = variant === "round" ? "" : sizeClasses[size];
  const widthClass = block ? "flex w-full" : "";
  return [base, variantClass, sizeClass, widthClass, className].filter(Boolean).join(" ");
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = CommonProps & {
  href: string;
  onClick?: never;
  type?: never;
};

export function KButton(props: ButtonProps | LinkProps) {
  const { children, className, size, variant, block, ...rest } = props;
  const cls = baseClasses({ size, variant, block, className });

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
