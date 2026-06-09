import { CYCLE_PHASES } from "@/lib/cyclePhase";

// The signature visual: the 4-year cycle as a ring of phases with a glowing
// "you are here" marker. Reused on the dashboard hero and the thesis page.
export function CycleClock({ phaseId, size = 200, showLabel = true }: { phaseId: number; size?: number; showLabel?: boolean }) {
  const cx = 100;
  const cy = 100;
  const R = 90;
  const r = 66;
  const gap = 3; // degrees between segments
  const n = CYCLE_PHASES.length;
  const seg = 360 / n;

  const polar = (radius: number, deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [cx + radius * Math.sin(a), cy - radius * Math.cos(a)];
  };
  const segPath = (a0: number, a1: number): string => {
    const [ox0, oy0] = polar(R, a0);
    const [ox1, oy1] = polar(R, a1);
    const [ix1, iy1] = polar(r, a1);
    const [ix0, iy0] = polar(r, a0);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${ox0} ${oy0} A ${R} ${R} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix0} ${iy0} Z`;
  };

  const current = CYCLE_PHASES.find((p) => p.id === phaseId) ?? CYCLE_PHASES[0];
  const currentIdx = CYCLE_PHASES.findIndex((p) => p.id === phaseId);
  const markerAngle = currentIdx * seg + seg / 2;
  const [mx, my] = polar((R + r) / 2, markerAngle);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-label={`Cycle phase: ${current.label}`}>
      {CYCLE_PHASES.map((p, i) => {
        const a0 = i * seg + gap / 2;
        const a1 = (i + 1) * seg - gap / 2;
        const isCurrent = p.id === phaseId;
        return (
          <path
            key={p.id}
            d={segPath(a0, a1)}
            fill={p.color}
            fillOpacity={isCurrent ? 0.95 : 0.16}
            stroke={isCurrent ? p.color : "transparent"}
            strokeWidth={isCurrent ? 1 : 0}
          />
        );
      })}

      {/* You-are-here marker */}
      <circle cx={mx} cy={my} r={9} fill={current.color} opacity={0.25}>
        <animate attributeName="r" values="7;12;7" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={mx} cy={my} r={5} fill={current.color} stroke="#0a0a0a" strokeWidth={2} />

      {/* Center label */}
      {showLabel && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">{current.short}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(0 0% 45%)" fontSize="8.5" letterSpacing="1.5">4-YEAR CYCLE</text>
        </>
      )}
    </svg>
  );
}
