import { KChip } from "@/components/KChip";
import { Icon } from "@/components/Icon";
import { LevelBar } from "./LevelBar";
import type { Member } from "@/lib/mock/members";

type Props = {
  member: Member;
};

export function ProfileCard({ member }: Props) {
  return (
    <section className="bg-[linear-gradient(180deg,var(--color-k-blue-soft),#fff)] border-[1.5px] border-k-blue-soft-2 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-k-blue grid place-items-center text-k-blue-depth font-extrabold text-2xl shadow-[inset_0_-4px_0_var(--color-k-blue-soft-2)]">
          {member.name.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold text-ink">{member.name}</div>
          <div className="flex gap-1.5 mt-1.5">
            <KChip>
              <Icon name="flame" className="w-3 h-3" /> {member.streak}일 연속
            </KChip>
            <KChip variant="gold">
              <Icon name="trophy" className="w-3 h-3" /> {member.totalJumps.toLocaleString()}
            </KChip>
          </div>
        </div>
      </div>
      <LevelBar level={member.level} xp={member.xp} />
    </section>
  );
}
