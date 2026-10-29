interface LogoProps { className?: string }

// People around the lower edge of the bubble, in the pastel colors the app gives avatars.
// cx, cy and r are in the logo's own units (the bubble is about 40 wide).
const PEOPLE = [
  { cx: 0, cy: 24, r: 5, colors: "fill-amber-100 stroke-amber-700" },
  { cx: 3.2, cy: 37.5, r: 5.8, colors: "fill-rose-100 stroke-rose-700" },
  { cx: 24, cy: 41.7, r: 5.8, colors: "fill-emerald-100 stroke-emerald-700" },
  { cx: 38.6, cy: 34.4, r: 5, colors: "fill-violet-100 stroke-violet-700" },
];

// Messenger's mark: a boxy speech bubble with three lines of text, tilted slightly, and
// the people having the conversation. The bubble takes the text color, so the size and
// its color come from className (e.g. "size-32 text-gray-500").
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="-6.5 -2 59 52" className={className} aria-hidden="true">
      <g transform="rotate(-6 24 24)">
        <path
          fill="currentColor"
          d="M9 6H39a5 5 0 0 1 5 5V27a5 5 0 0 1-5 5H20C18 35 15 37 10 38.5C11.5 36.5 12.5 34.5 12.5 32H9a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5Z"
        />
        <g stroke="white" strokeWidth="3.2" strokeLinecap="round">
          <path d="M11.5 13.5H29" />
          <path d="M11.5 19.5H36.5" />
          <path d="M11.5 25.5H36.5" />
        </g>
      </g>
      {PEOPLE.map(({ cx, cy, r, colors }) => (
        <g key={`${cx},${cy}`} className={colors}>
          {/* a white ring, so a person stands out where it overlaps the bubble */}
          <circle cx={cx} cy={cy} r={r + 0.8} fill="white" stroke="none" />
          <circle cx={cx} cy={cy} r={r} stroke="none" />
          {/* the person: lucide's UserRound (a 24-unit icon), scaled to fill half the circle */}
          <g transform={`translate(${cx - r / 2} ${cy - r / 2}) scale(${r / 24})`} fill="none" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </g>
        </g>
      ))}
    </svg>
  );
}
