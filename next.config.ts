import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  // Evita que la app se cargue dentro de un iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Evita que el browser adivine el tipo MIME de un archivo
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla qué información se envía en el encabezado Referer al navegar fuera
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deshabilita APIs del browser que la app no usa
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Fuerza HTTPS por 2 años en producción
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Política de origen de contenido — bloquea recursos no autorizados
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requiere unsafe-inline/unsafe-eval para hydration y estilos de Tailwind
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // data: para fotos base64, blob: para PDFs generados con jsPDF
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // Supabase REST API (solo se activa cuando está configurado)
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
