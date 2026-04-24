import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

type Props = {
  title: string;
  backHref?: string;
  right?: ReactNode;
};

export function MHeader({ title, backHref, right }: Props) {
  return (
    <header className="flex items-center justify-between px-[18px] py-[14px] bg-white border-b border-line shrink-0">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            className="w-9 h-9 rounded-[10px] bg-panel-sub border-[1.5px] border-line grid place-items-center text-k-blue-depth"
            aria-label="뒤로"
          >
            <Icon name="chevron-left" className="w-5 h-5" />
          </Link>
        )}
        <h1 className="font-extrabold text-base text-ink">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
