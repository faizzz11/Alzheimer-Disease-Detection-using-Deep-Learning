import {
  studentActivityGraphWeeks,
} from "@/config/student-dashboard";

export function utcDayKeyFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function utcMidnightMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function activityCountToLevel(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export type ActivityGraphCell = {
  key: string;
  dateKey: string | null;
  inRange: boolean;
  level: number;
  count: number;
};

export function buildActivityGraphColumns(
  counts: Record<string, number>,
  weeks: number = studentActivityGraphWeeks,
): ActivityGraphCell[][] {
  const now = new Date();
  const endMs = utcMidnightMs(now);
  const spanDays = weeks * 7;
  const startMs = endMs - (spanDays - 1) * 86_400_000;
  const startDow = new Date(startMs).getUTCDay();
  const gridStartMs = startMs - startDow * 86_400_000;
  const daySpan = Math.floor((endMs - gridStartMs) / 86_400_000) + 1;
  const numCols = Math.ceil(daySpan / 7);
  const columns: ActivityGraphCell[][] = [];

  for (let c = 0; c < numCols; c++) {
    const col: ActivityGraphCell[] = [];
    for (let r = 0; r < 7; r++) {
      const cellMs = gridStartMs + (c * 7 + r) * 86_400_000;
      const key = `c${c}-r${r}`;
      if (cellMs > endMs) {
        col.push({
          key,
          dateKey: null,
          inRange: false,
          level: 0,
          count: 0,
        });
        continue;
      }
      if (cellMs < startMs) {
        col.push({
          key,
          dateKey: null,
          inRange: false,
          level: 0,
          count: 0,
        });
        continue;
      }
      const dateKey = utcDayKeyFromMs(cellMs);
      const count = counts[dateKey] ?? 0;
      col.push({
        key,
        dateKey,
        inRange: true,
        level: activityCountToLevel(count),
        count,
      });
    }
    columns.push(col);
  }

  return columns;
}
