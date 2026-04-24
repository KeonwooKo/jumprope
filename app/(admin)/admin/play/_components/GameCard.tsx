import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Game } from "@/lib/mock/games";

type Props = {
  game: Game;
};

export function GameCard({ game }: Props) {
  return (
    <Link
      href={game.route}
      className={
        "relative block w-full aspect-[3/2] rounded-2xl overflow-hidden text-left text-white bg-gradient-to-br " +
        game.accent
      }
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_80%,#fff_0,transparent_40%)]" />

      <div className="relative h-full p-5 flex flex-col">
        <div className="mt-auto">
          <h3 className="text-2xl font-extrabold [text-shadow:0_2px_8px_rgba(0,0,0,.35)]">
            {game.title}
          </h3>
          <p className="text-xs mt-1 opacity-95 [text-shadow:0_1px_4px_rgba(0,0,0,.3)]">
            {game.desc}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-bold opacity-90">
            시작하기
            <Icon name="chevron-right" className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
