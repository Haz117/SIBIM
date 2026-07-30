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
    .logo { width: 42px; height: 42px; background: linear-gradient(135deg, #4c1d95, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo span { color: white; font-weight: 800; font-size: 14px; }
    h1 { font-size: 20px; color: #4c1d95; margin: 0 0 2px; }
    .meta { color: #6b7280; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 12px; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo"><span>SB</span></div>
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
