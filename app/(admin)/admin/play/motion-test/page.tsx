import Link from "next/link";
import { MHeader } from "@/components/MHeader";
import { Icon } from "@/components/Icon";
import { motionDefinitions } from "@/lib/mock/motion-types";

export default function MotionTestHub() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <MHeader title="동작 인식 테스트" backHref="/admin/play" />

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* 설명 */}
        <div className="bg-k-blue-soft border-[1.5px] border-k-blue-soft-2 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-k-blue grid place-items-center text-white flex-shrink-0">
              <Icon name="target" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm text-ink mb-1">POC 검증 모드</div>
              <div className="text-xs text-ink-sub leading-relaxed">
                각 동작의 인식률을 개별적으로 테스트합니다. 타겟 동작을 선택하면 해당 동작만 집중 감지하고 상세한 피드백을 제공합니다.
              </div>
            </div>
          </div>
        </div>

        {/* 개별 동작 테스트 */}
        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-3">
            개별 동작 테스트
          </h2>
          <div className="space-y-2.5">
            {motionDefinitions.map((motion) => (
              <Link
                key={motion.id}
                href={`/admin/play/motion-test/${motion.id}`}
                className="block bg-white border-[1.5px] border-line rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${motion.color} grid place-items-center text-2xl flex-shrink-0`}>
                    {motion.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm text-ink">{motion.name}</div>
                    <div className="text-xs text-ink-sub mt-0.5">{motion.description}</div>
                  </div>
                  <Icon name="chevron-right" className="w-5 h-5 text-ink-mut flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 통합 테스트 */}
        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-3">
            통합 테스트
          </h2>
          <Link
            href="/admin/play/motion-test/all"
            className="block bg-[linear-gradient(135deg,var(--color-k-blue-hi),var(--color-k-blue-depth))] border-2 border-k-blue-outline rounded-xl p-4 text-white shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-5px_0_rgba(10,65,90,.35)] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center text-2xl flex-shrink-0">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm">전체 동작 자동 인식</div>
                <div className="text-xs opacity-90 mt-0.5">모든 동작을 자유롭게 시도하고 자동 분류 확인</div>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 flex-shrink-0" />
            </div>
          </Link>
        </section>

        {/* 안내 */}
        <div className="text-center text-xs text-ink-mut pb-4">
          개별 테스트에서 각 동작의 인식률을 확인한 후<br />
          통합 테스트로 전체 분류 정확도를 검증하세요
        </div>
      </div>
    </div>
  );
}
