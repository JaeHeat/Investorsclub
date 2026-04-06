interface Slice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: Slice[];
  size?: number;
  thickness?: number;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, R: number, r: number, startDeg: number, endDeg: number) {
  // Clamp to avoid full-circle degenerate arcs
  const sweep = Math.min(endDeg - startDeg, 359.999);
  const end = startDeg + sweep;
  const p1 = polarToXY(cx, cy, R, startDeg);
  const p2 = polarToXY(cx, cy, R, end);
  const p3 = polarToXY(cx, cy, r, end);
  const p4 = polarToXY(cx, cy, r, startDeg);
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r} ${r} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({ slices, size = 180, thickness = 44 }: DonutChartProps) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const R = cx - 4;
  const r = R - thickness;

  let cursor = 0;
  const paths = slices.map((sl) => {
    const deg = (sl.value / total) * 360;
    const path = slicePath(cx, cy, R, r, cursor, cursor + deg);
    cursor += deg;
    return { ...sl, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} opacity={0.92} />
        ))}
        {/* gap ring */}
        <circle cx={cx} cy={cy} r={r} fill="hsl(0 0% 6%)" />
      </svg>

      {/* Legend */}
      <div className="space-y-2.5">
        {slices.map((sl) => {
          const pct = ((sl.value / total) * 100).toFixed(1);
          return (
            <div key={sl.label} className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: sl.color }}
              />
              <div>
                <p className="text-sm font-medium text-white leading-tight">{sl.label}</p>
                <p className="text-xs text-[hsl(0_0%_40%)]">{pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
