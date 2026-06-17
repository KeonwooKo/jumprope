"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KButton } from "@/components/KButton";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

type Tab = "dojo" | "member";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("member");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "dojo") router.push("/admin");
    else router.push("/invite");
  }

  return (
    <main className="min-h-dvh flex flex-col px-6 pt-10 pb-6 bg-white">
      <div className="mx-auto mt-3.5 mb-4 w-[92px] h-[92px] rounded-[26px] border-2 border-k-blue-outline grid place-items-center text-white font-num text-3xl bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_2px_0_rgba(255,255,255,.5),inset_0_-7px_0_var(--color-k-blue-depth),0_6px_0_rgba(15,93,127,.2)] [text-shadow:0_2px_0_rgba(0,0,0,.25)]">
        JR
      </div>

      <h1 className="text-center text-2xl font-extrabold text-ink mb-1">줄넘기 체크</h1>
      <p className="text-center text-xs text-ink-sub mb-7">매일 기록하고 레벨업!</p>

      <div className="bg-panel-sub border-[1.5px] border-line p-1 rounded-xl grid grid-cols-2 mb-5">
        {(["dojo", "member"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-2.5 rounded-[9px] text-center font-bold text-[13px] cursor-pointer",
                active
                  ? "text-white border-[1.5px] border-k-blue-outline bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_1px_0_rgba(255,255,255,.45),inset_0_-3px_0_var(--color-k-blue-depth)] [text-shadow:0_1px_0_rgba(0,0,0,.2)]"
                  : "text-ink-sub"
              )}
            >
              {t === "dojo" ? "도장 어드민" : "회원"}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="bg-white border-[1.5px] border-line-2 rounded-xl px-4 py-3.5 flex items-center gap-2.5 mb-2.5">
          <Icon name="id" className="w-5 h-5 text-k-blue" />
          <input
            type="text"
            placeholder={tab === "dojo" ? "도장 관리자 아이디" : "아이디"}
            className="flex-1 bg-transparent outline-none text-[13px] font-medium placeholder:text-ink-mut"
          />
        </label>
        <label className="bg-white border-[1.5px] border-line-2 rounded-xl px-4 py-3.5 flex items-center gap-2.5 mb-5">
          <Icon name="lock" className="w-5 h-5 text-k-blue" />
          <input
            type="password"
            placeholder="비밀번호"
            className="flex-1 bg-transparent outline-none text-[13px] font-medium placeholder:text-ink-mut"
          />
        </label>
        <KButton block size="lg" type="submit">
          로그인
        </KButton>
      </form>

      <div className="mt-auto pt-3.5 text-center text-[11px] text-ink-mut">
        처음이신가요? · 회원가입 · 비밀번호 찾기
      </div>
    </main>
  );
}
