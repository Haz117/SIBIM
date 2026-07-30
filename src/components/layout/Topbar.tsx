"use client";

import { Bell, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border sticky top-0 z-40 bg-background/85 backdrop-blur-sm">

      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
        <p className="text-xs capitalize text-muted-foreground">{subtitle || fecha}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar producto, código..."
            className="pl-9 h-9 w-64 text-sm border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-shadow"
          />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Refresh */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent text-muted-foreground hover:text-foreground">
          <ArrowClockwise className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent text-muted-foreground hover:text-foreground relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-xs flex items-center justify-center border-0"
            style={{ background: "var(--destructive)", color: "white" }}>
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
