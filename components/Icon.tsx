type Props = {
  name: string;
  className?: string;
};

export function Icon({ name, className = "w-5 h-5" }: Props) {
  return (
    <svg
      className={`${className} stroke-current fill-none stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round] shrink-0`}
      aria-hidden
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
