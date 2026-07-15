import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { db } from "@/database/client";
import { expenses, investments, salaryEntries, netWorthSnapshots } from "@/database/schema";
import { desc } from "drizzle-orm";
import { categoryByKey } from "@/constants/categories";
import { currentMonthKey, formatINR } from "@/services/format";

async function collectMonthlyReportData() {
  const month = currentMonthKey();
  const allExpenses = await db.select().from(expenses);
  const monthExpenses = allExpenses.filter((e) => e.date.startsWith(month));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = new Map<string, number>();
  for (const e of monthExpenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  const categoryRows = Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const allInvestments = await db.select().from(investments);
  const investedTotal = allInvestments.reduce((s, i) => s + i.investedAmount, 0);
  const currentTotal = allInvestments.reduce((s, i) => s + i.currentValue, 0);

  const salaryRows = await db.select().from(salaryEntries).orderBy(desc(salaryEntries.month));
  const salaryThisMonth = salaryRows.find((s) => s.month === month) ?? salaryRows[0] ?? null;
  const savings = salaryThisMonth ? Math.max(0, salaryThisMonth.inHandSalary - monthTotal) : 0;

  const netWorthRows = await db.select().from(netWorthSnapshots).orderBy(desc(netWorthSnapshots.month));
  const latestNetWorth = netWorthRows[0] ?? null;

  return { month, monthExpenses, monthTotal, categoryRows, allInvestments, investedTotal, currentTotal, salaryThisMonth, savings, latestNetWorth };
}

function reportHTML(data: Awaited<ReturnType<typeof collectMonthlyReportData>>): string {
  const rows = (arr: { label: string; value: string }[]) =>
    arr.map((r) => `<tr><td style="padding:6px 0;color:#5B6270">${r.label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${r.value}</td></tr>`).join("");

  return `
  <html>
  <head><meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 32px; color: #14171F; }
    h1 { font-size: 22px; margin-bottom: 2px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #5B6CFF; margin-top: 28px; margin-bottom: 8px; }
    .sub { color: #8B93A3; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    tr { border-bottom: 1px solid #eee; }
  </style>
  </head>
  <body>
    <h1>Manan Wealth OS — Monthly Report</h1>
    <div class="sub">${data.month} · generated on this device</div>

    <h2>Expense report</h2>
    <table>${rows([
      { label: "Total spent this month", value: formatINR(data.monthTotal) },
      { label: "Number of entries", value: String(data.monthExpenses.length) },
      ...data.categoryRows.map((c) => ({ label: categoryByKey(c.category).label, value: formatINR(c.total) })),
    ])}</table>

    <h2>Savings report</h2>
    <table>${rows([
      { label: "In-hand salary", value: data.salaryThisMonth ? formatINR(data.salaryThisMonth.inHandSalary) : "—" },
      { label: "Total spent", value: formatINR(data.monthTotal) },
      { label: "Saved this month", value: formatINR(data.savings) },
    ])}</table>

    <h2>Investment report</h2>
    <table>${rows([
      { label: "Total invested", value: formatINR(data.investedTotal) },
      { label: "Current value", value: formatINR(data.currentTotal) },
      { label: "Returns", value: formatINR(data.currentTotal - data.investedTotal) },
      ...data.allInvestments.map((i) => ({ label: i.name, value: formatINR(i.currentValue) })),
    ])}</table>

    <h2>Net worth report</h2>
    <table>${rows([
      { label: "Net worth", value: data.latestNetWorth ? formatINR(data.latestNetWorth.netWorth) : formatINR(data.currentTotal) },
    ])}</table>
  </body>
  </html>`;
}

export async function exportMonthlyReportPDF(): Promise<void> {
  const data = await collectMonthlyReportData();
  const { uri } = await Print.printToFileAsync({ html: reportHTML(data) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Monthly report" });
  }
}

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

/** Excel-compatible CSV export of the full expense log (opens natively in Excel/Sheets). */
export async function exportExpensesCSV(): Promise<void> {
  const rows = await db.select().from(expenses).orderBy(desc(expenses.date));
  const csv = toCSV(
    ["Date", "Category", "Amount", "Payment Method", "Notes"],
    rows.map((e) => [e.date, categoryByKey(e.category).label, e.amount, e.paymentMethod ?? "", e.notes ?? ""])
  );
  const path = `${FileSystem.cacheDirectory}manan-wealth-os-expenses-${Date.now()}.csv`;
  // BOM so Excel detects UTF-8 — without it, ₹ and other non-ASCII notes render as mojibake.
  await FileSystem.writeAsStringAsync(path, "\uFEFF" + csv, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Expenses export" });
  }
}
