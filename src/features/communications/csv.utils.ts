type Cell = string;

function csvCell(value: Cell) {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function communicationCsv(rows: Cell[][]) {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
