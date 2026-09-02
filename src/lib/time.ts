const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** "2 min ago", "Yesterday", "Last week" — the dashboard's edited label. */
export function relativeTime(then: number, now = Date.now()) {
  const diff = Math.max(0, now - then);
  if (diff < MIN) return "Just now";
  if (diff < HOUR) return `${Math.round(diff / MIN)} min ago`;
  if (diff < DAY) return `${Math.round(diff / HOUR)} h ago`;
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)} days ago`;
  if (diff < 14 * DAY) return "Last week";
  if (diff < 30 * DAY) return `${Math.round(diff / (7 * DAY))} weeks ago`;
  return new Date(then).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
