// Bitcoin seasonality — historical average monthly returns and positive-month
// win rates (illustrative, drawn from 2013–2024 monthly performance). Used to
// frame *when* in the year accumulation and distribution tend to pay off.
// These are long-run averages, not predictions, and could be moved to the
// admin-editable config later.

export interface MonthStat {
  month: number; // 1–12
  name: string;
  short: string;
  avgReturnPct: number; // historical average monthly return
  winRate: number; // share of years that month was positive (0–1)
}

export const MONTH_STATS: MonthStat[] = [
  { month: 1, name: "January", short: "Jan", avgReturnPct: 5, winRate: 0.55 },
  { month: 2, name: "February", short: "Feb", avgReturnPct: 14, winRate: 0.7 },
  { month: 3, name: "March", short: "Mar", avgReturnPct: -1, winRate: 0.5 },
  { month: 4, name: "April", short: "Apr", avgReturnPct: 13, winRate: 0.73 },
  { month: 5, name: "May", short: "May", avgReturnPct: 6, winRate: 0.55 },
  { month: 6, name: "June", short: "Jun", avgReturnPct: -2, winRate: 0.42 },
  { month: 7, name: "July", short: "Jul", avgReturnPct: 9, winRate: 0.6 },
  { month: 8, name: "August", short: "Aug", avgReturnPct: -2, winRate: 0.45 },
  { month: 9, name: "September", short: "Sep", avgReturnPct: -4, winRate: 0.33 },
  { month: 10, name: "October", short: "Oct", avgReturnPct: 20, winRate: 0.75 },
  { month: 11, name: "November", short: "Nov", avgReturnPct: 35, winRate: 0.73 },
  { month: 12, name: "December", short: "Dec", avgReturnPct: 4, winRate: 0.5 },
];

export interface QuarterStat {
  quarter: string;
  months: string;
  avgReturnPct: number;
  note: string;
}

export const QUARTER_STATS: QuarterStat[] = [
  { quarter: "Q1", months: "Jan–Mar", avgReturnPct: 18, note: "Strong start — Feb especially." },
  { quarter: "Q2", months: "Apr–Jun", avgReturnPct: 17, note: "April rallies, June often cools." },
  { quarter: "Q3", months: "Jul–Sep", avgReturnPct: 3, note: "Weakest stretch — Sep is the low." },
  { quarter: "Q4", months: "Oct–Dec", avgReturnPct: 59, note: "By far the strongest — 'Uptober' into the Nov run." },
];

export function bestMonth(): MonthStat {
  return MONTH_STATS.reduce((a, b) => (b.avgReturnPct > a.avgReturnPct ? b : a));
}

export function worstMonth(): MonthStat {
  return MONTH_STATS.reduce((a, b) => (b.avgReturnPct < a.avgReturnPct ? b : a));
}

export function currentMonthStat(monthIndex0: number): MonthStat {
  return MONTH_STATS[((monthIndex0 % 12) + 12) % 12];
}
