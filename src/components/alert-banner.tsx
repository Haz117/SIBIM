"use client";

import { useState } from "react";
import Link from "next/link";
import { Warning, X } from "@phosphor-icons/react";
import { useAuth } from "@/components/auth-provider";
import { isAreaAccessible } from "@/lib/access";
import { useData } from "@/lib/store";

export function AlertBanner() {
  const user = useAuth();
  const { products } = useData();
  const [dismissed, setDismissed] = useState(false);

  const scopedProducts =
    user.role === "admin"
      ? products
      : products.filter((p) => isAreaAccessible(user, p.area));

  const agotados = scopedProducts.filter((p) => p.estado === "agotado");

  if (dismissed || agotados.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-xs animate-in slide-in-from-top-1 duration-300"
      style={{ background: "rgba(244,63,94,0.1)", borderBottom: "1px solid rgba(244,63,94,0.2)" }}>
      <Warning className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" weight="fill" />
      <span className="flex-1 text-rose-500">
        <span className="font-semibold">{agotados.length} {agotados.length === 1 ? "bien agotado" : "bienes agotados"}</span>
        {" — "}
        {agotados.map((p) => p.nombre).join(", ")}
      </span>
      <Link href="/alertas" className="font-semibold text-rose-500 hover:text-rose-400 underline-offset-2 hover:underline flex-shrink-0 transition-colors">
        Ver alertas
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        className="text-rose-500/50 hover:text-rose-500 transition-colors flex-shrink-0 ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
