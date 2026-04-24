"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OtpInput } from "./_components/OtpInput";
import { KButton } from "@/components/KButton";
import { MHeader } from "@/components/MHeader";

export default function InvitePage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const router = useRouter();
  const complete = code.every((c) => c !== "");

  function handleSubmit() {
    if (complete) router.push("/me");
  }

  return (
    <main className="min-h-dvh flex flex-col bg-white">
      <MHeader title="도장 초대코드" backHref="/login" />

      <div className="flex-1 px-6 py-8 flex flex-col">
        <div className="mx-auto mt-4 mb-4 w-16 h-16 rounded-2xl border-2 border-k-blue-outline grid place-items-center text-white bg-[linear-gradient(180deg,var(--color-k-blue-hi),var(--color-k-blue-mid))] shadow-[inset_0_2px_0_rgba(255,255,255,.5),inset_0_-5px_0_var(--color-k-blue-depth)]">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-[1.7]">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 7 H15 M9 11 H15 M9 15 H13" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-center text-lg font-extrabold text-ink mb-1">
          초대코드 입력
        </h2>
        <p className="text-center text-xs text-ink-sub mb-7">
          도장에서 받은 6자리 코드를 입력해주세요
        </p>

        <OtpInput value={code} onChange={setCode} />

        <p className="text-center text-[11px] text-ink-mut mt-4">
          코드를 못 받으셨나요? 선생님께 문의해주세요
        </p>

        <div className="mt-auto pt-6">
          <KButton block size="lg" onClick={handleSubmit} className={!complete ? "opacity-50" : ""}>
            확인
          </KButton>
        </div>
      </div>
    </main>
  );
}
