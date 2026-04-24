import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function KCard({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-white border-[1.5px] border-line rounded-[14px] p-3.5 ${className}`}
    >
      {children}
    </div>
  );
}
