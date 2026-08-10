"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                // Nueva versión disponible — se activará en la próxima carga
                worker.postMessage({ type: "SKIP_WAITING" })
              }
            })
          })
        })
        .catch(() => {
          // SW no disponible (HTTP, modo incógnito con restricciones, etc.)
        })
    }
  }, [])

  return null
}
