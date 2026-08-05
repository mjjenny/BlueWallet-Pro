export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function compactText(value: string | null | undefined, fallback = "Not set"): string {
  const trimmed = String(value ?? "").trim();
  return trimmed || fallback;
}
