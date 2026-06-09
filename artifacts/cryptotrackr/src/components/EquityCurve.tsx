import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis } from "recharts";
import { formatUSD } from "@/lib/utils";
import type { EquityPoint } from "@/lib/priceHistory";

function CurveTooltip({ active, payload }: { active?: boolean; payload?: { payload: EquityPoint }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-[hsl(0_0%_50%)] mb-0.5">
        {new Date(p.t).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <p className="text-white font-semibold text-sm">{formatUSD(p.value)}</p>
    </div>
  );
}

// Delta-style gradient area equity curve — minimal chrome, smooth line, value
// tooltip on hover. Colour reflects whether the period is up or down.
export function EquityCurve({ data, color, height = 210 }: { data: EquityPoint[]; color: string; height?: number }) {
  const gid = `eq-grad-${color.replace("#", "")}`;
  const vals = data.map((d) => d.value);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1;
  const pad = (max - min) * 0.1 || max * 0.05 || 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="60%" stopColor={color} stopOpacity={0.06} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[min - pad, max + pad]} />
        <Tooltip content={<CurveTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.25}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#0a0a0a", strokeWidth: 2 }}
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
