import { notFound } from "next/navigation";
import { MHeader } from "@/components/MHeader";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { KChip } from "@/components/KChip";
import { Icon } from "@/components/Icon";
import { JumpLogList } from "./_components/JumpLogList";
import { getMember } from "@/lib/mock/members";
import { getSessionsByMember, getAttendanceDates } from "@/lib/mock/sessions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetail({ params }: Props) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const sessions = getSessionsByMember(member.id);
  const attendance = getAttendanceDates(member.id);

  return (
    <>
      <MHeader title={member.name} backHref="/admin" />

      <div className="flex-1 overflow-auto p-4 space-y-5">
        <section className="bg-[linear-gradient(180deg,var(--color-k-blue-soft),#fff)] border-[1.5px] border-k-blue-soft-2 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-k-blue grid place-items-center text-k-blue-depth font-extrabold text-xl shadow-[inset_0_-3px_0_var(--color-k-blue-soft-2)]">
              {member.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-ink-sub font-semibold">Lv.{member.level}</div>
              <div className="text-base font-extrabold text-ink">{member.name}</div>
              <div className="flex gap-1.5 mt-1.5">
                <KChip><Icon name="flame" className="w-3 h-3" /> {member.streak}일</KChip>
                <KChip variant="gold"><Icon name="trophy" className="w-3 h-3" /> {member.totalJumps.toLocaleString()}회</KChip>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            출석
          </h2>
          <AttendanceCalendar
            year={2026}
            month={4}
            checkedDates={attendance}
            today="2026-04-24"
          />
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            기록 로그
          </h2>
          <JumpLogList sessions={sessions} />
        </section>
      </div>
    </>
  );
}
