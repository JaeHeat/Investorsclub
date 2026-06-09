import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { FanPoint } from "@/lib/forecast";
import { formatUSD } from "@/lib/utils";

function FanTooltip({ active, payload }: { active?: boolean; payload?: { payload: { m: number; range: [number, number]; mid: number } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-[hsl(0_0%_50%)] mb-1">{p.m === 0 ? "Today" : `+${p.m} months`}</p>
      <p className="text-white font-semibold">Expected {formatUSD(p.mid)}</p>
      <p className="text-[hsl(0_0%_55%)] mt-0.5">Range {formatUSD(p.range[0])} – {formatUSD(p.range[1])}</p>
    </div>
  );
}

// Monte Carlo projection cone: the P10–P90 band fanning out from today's
// balance toward the next cycle peak, with the median path and the goal line.
export function ForecastFan({
  fan, goalValue, horizonMonths, color = "#F7931A", height = 240,
}: {
  fan: FanPoint[];
  goalValue: number;
  horizonMonths: number;
  color?: string;
  height?: number;
}) {
  const data = fan.map((p) => ({ m: p.m, range: [p.low, p.high] as [number, number], mid: p.mid }));
  const all = fan.flatMap((p) => [p.low, p.high]);
  const min = Math.min(...all);
  const max = Math.max(...all, goalValue || 0);
  const ticks = [0, 6, 12, 18, 24, horizonMonths].filter((t, i, a) => a.indexOf(t) === i && t <= horizonMonths);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="m"
          type="number"
          domain={[0, horizonMonths]}
          ticks={ticks}
          tickFormatter={(m) => (m === 0 ? "now" : `${m}mo`)}
          tick={{ fontSize: 10, fill: "hsl(0 0% 38%)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide domain={[min * 0.9, max * 1.06]} />
        <Tooltip content={<FanTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} />
        {goalValue > 0 && (
          <ReferenceLine
            y={goalValue}
            stroke="rgba(255,255,255,0.45)"
            strokeDasharray="4 4"
            label={{ value: `Goal ${formatUSD(goalValue)}`, position: "insideTopRight", fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
          />
        )}
        <Area dataKey="range" stroke="none" fill="url(#fan-grad)" isAnimationActive animationDuration={500} />
        <Line dataKey="mid" stroke={color} strokeWidth={2.25} dot={false} isAnimationActive animationDuration={500} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
