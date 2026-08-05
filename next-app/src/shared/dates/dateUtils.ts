export function startOfLocalDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysUntil(dateLike: string | null | undefined, now = new Date()): number | null {
  if (!dateLike) return null;
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.ceil((startOfLocalDay(parsed).getTime() - startOfLocalDay(now).getTime()) / 86_400_000);
}

export function formatDate(dateLike: string | null | undefined): string {
  if (!dateLike) return "Not set";
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return dateLike;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsed);
}
