"use client";

import { useRef } from "react";

type Props = {
  value: string[];
  onChange: (v: string[]) => void;
};

export function OtpInput({ value, onChange }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleInput(i: number, v: string) {
    const ch = v.slice(-1).replace(/\D/g, "");
    const next = [...value];
    next[i] = ch;
    onChange(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={
            "aspect-square w-full rounded-xl text-center font-num text-2xl font-bold outline-none " +
            "border-[1.5px] " +
            (value[i]
              ? "text-k-blue-depth border-k-blue bg-k-blue-soft"
              : "text-ink border-line-2 bg-white")
          }
        />
      ))}
    </div>
  );
}
