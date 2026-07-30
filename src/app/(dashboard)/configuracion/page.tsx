"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle, Palette, ShieldCheck, Info, Crown, Briefcase, Envelope, SignOut,
  Sun, Moon, Desktop,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-provider";
import { AUTH_USERS } from "@/lib/auth-users";
import { logout } from "@/lib/auth-actions";
import { initials } from "@/lib/format";
import { getAreaIcon } from "@/lib/areas-icons";
import { cn } from "@/lib/utils";

export default function ConfiguracionPage() {
  const user = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Configuración" subtitle="Tu cuenta y preferencias del sistema" />

      <div className="p-6 space-y-6 max-w-3xl">

        {/* Profile */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" weight="duotone" /> Mi cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0"
                style={{ background: "var(--primary)" }}>
                {initials(user.nombre)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{user.nombre}</p>
                  {user.role === "admin" && (
                    <Badge className="text-xs gap-1 border-0 text-primary-foreground" style={{ background: "var(--primary)" }}>
                      <Crown className="w-3 h-3" weight="fill" /> Superusuario
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {user.cargo}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Envelope className="w-3.5 h-3.5" /> {user.username}
                </p>
              </div>
            </div>

            <div className="h-px bg-border my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Área asignada</p>
                <p className="text-sm text-foreground mt-1">{user.area ?? "Todas las áreas (acceso total)"}</p>
              </div>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm" className="gap-1.5 border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30">
                  <SignOut className="w-3.5 h-3.5" /> Cerrar sesión
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: "60ms", animationFillMode: "backwards" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" weight="duotone" /> Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">Elige cómo se ve SIBIM en este dispositivo.</p>
            <div className="grid grid-cols-3 gap-2 max-w-sm">
              {[
                { value: "light", label: "Claro", icon: Sun },
                { value: "dark", label: "Oscuro", icon: Moon },
                { value: "system", label: "Sistema", icon: Desktop },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs transition-all",
                    theme === value
                      ? "border-primary bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" weight={theme === value ? "fill" : "regular"} />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users with access — admin only */}
        {user.role === "admin" && (
          <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" weight="duotone" /> Usuarios con acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {AUTH_USERS.map((u) => {
                const AreaIcon = u.area ? getAreaIcon(u.area) : Crown;
                return (
                  <div key={u.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-accent text-primary">
                      {initials(u.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{u.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <AreaIcon className="w-3 h-3 flex-shrink-0" /> {u.area ?? "Superusuario"}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{u.username}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: "180ms", animationFillMode: "backwards" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              SIBIM — Sistema Integral de Bienes Municipales. Los usuarios y la autenticación de esta versión son de
              demostración; deben sustituirse por un proveedor de autenticación real antes de producción.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
