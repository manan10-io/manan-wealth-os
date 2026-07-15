export function formatINR(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Local-time ISO date (YYYY-MM-DD). Never use toISOString() for calendar
 * dates — it's UTC, which shifts everything before 5:30 AM IST to yesterday. */
export function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function todayISO(): string {
  return toLocalISO(new Date());
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = todayISO();
  const yesterday = toLocalISO(new Date(Date.now() - 86400000));
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
