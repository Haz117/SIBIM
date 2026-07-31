// Client-side only — never call these functions from server components.
import * as XLSX from "xlsx"

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Column widths sized to content (header vs. widest cell), capped so a stray long
  // value doesn't blow out the sheet. (Frozen header panes aren't available in the
  // community build of SheetJS — that's a Pro-only feature — so column sizing is
  // the readability win available here.)
  ws["!cols"] = headers.map((h, col) => {
    const longest = rows.reduce((max, r) => Math.max(max, String(r[col] ?? "").length), h.length)
    return { wch: Math.min(Math.max(longest + 2, 10), 40) }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "SIBIM")
  XLSX.writeFile(wb, filename)
}

export function printReport(title: string, period: string, headers: string[], rows: string[][]) {
  const headerCells = headers
    .map((h) => `<th style="padding:8px 12px;border:1px solid #d1d5db;background:#4c1d95;color:white;text-align:left;font-size:12px;white-space:nowrap">${h}</th>`)
    .join("")
  const bodyRows = rows
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 === 0 ? "#f9fafb" : "white"}">${r
          .map((c) => `<td style="padding:6px 12px;border:1px solid #e5e7eb;font-size:12px">${c ?? ""}</td>`)
          .join("")}</tr>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title} — SIBIM</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111827; }
    .header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid #4c1d95; }
    .logo { flex-shrink: 0; }
    h1 { font-size: 20px; color: #4c1d95; margin: 0 0 2px; }
    .meta { color: #6b7280; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print {
      body { padding: 12px; }
      button { display: none; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <svg class="logo" width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo Municipal">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#4c1d95" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logo-gradient)" />
      <path d="M12 20 L24 12 L36 20 Z" fill="white" fill-opacity="0.95" />
      <rect x="12" y="20" width="24" height="15" rx="1.5" fill="white" fill-opacity="0.95" />
      <rect x="16" y="23" width="2.4" height="9" rx="1" fill="#4c1d95" />
      <rect x="22.8" y="23" width="2.4" height="9" rx="1" fill="#4c1d95" />
      <rect x="29.6" y="23" width="2.4" height="9" rx="1" fill="#4c1d95" />
      <rect x="10" y="35" width="28" height="2.5" rx="1.25" fill="white" fill-opacity="0.95" />
    </svg>
    <div>
      <h1>${title}</h1>
      <p class="meta">H. Ayuntamiento Municipal &nbsp;·&nbsp; ${period} &nbsp;·&nbsp; ${new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}</p>
    </div>
  </div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="footer">SIBIM — Sistema Integral de Bienes Municipales &nbsp;·&nbsp; Documento generado electrónicamente &nbsp;·&nbsp; ${rows.length} registros</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  const w = window.open("", "_blank", "width=1080,height=780,menubar=no,toolbar=no")
  if (!w) return
  w.document.write(html)
  w.document.close()
}
