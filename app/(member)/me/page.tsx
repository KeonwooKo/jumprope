import { MHeader } from "@/components/MHeader";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { ProfileCard } from "./_components/ProfileCard";
import { MyCharacter } from "./_components/MyCharacter";
import { WeeklyBarChart } from "./_components/WeeklyBarChart";
import { RecentLogList } from "./_components/RecentLogList";
import { MiniRank } from "./_components/MiniRank";
import { currentMember } from "@/lib/mock/members";
import {
  weeklyBars,
  getAttendanceDates,
  getSessionsByMember,
} from "@/lib/mock/sessions";
import { rankings } from "@/lib/mock/rankings";

export default function MyPage() {
  const attendance = getAttendanceDates(currentMember.id);
  const mySessions = getSessionsByMember(currentMember.id);

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <MHeader title="마이페이지" />

      <div className="flex-1 overflow-auto p-4 space-y-5">
        <ProfileCard member={currentMember} />

        <MyCharacter />

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            이번 주 기록
          </h2>
          <WeeklyBarChart data={weeklyBars} />
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            최근 기록
          </h2>
          <RecentLogList sessions={mySessions} />
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-ink-sub uppercase tracking-wider mb-2">
            출석 달력
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
            랭킹
          </h2>
          <MiniRank entries={rankings} meId={currentMember.id} />
        </section>
      </div>
    </div>
  );
}
