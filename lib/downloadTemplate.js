/**
 * Downloads a CSV file that opens correctly in Excel.
 * @param {string[]} headers - Column header names (exact API keys)
 * @param {string[][]} sampleRows - Sample data rows
 * @param {string} filename - e.g. "doctors_template.csv"
 */
export function downloadCSVTemplate(headers, sampleRows, filename) {
  const rows = [headers, ...sampleRows];
  const csv  = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
