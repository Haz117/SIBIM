"use client";

import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  UserCircle, Palette, ShieldCheck, Info, Crown, Briefcase, Envelope, SignOut,
  Sun, Moon, Desktop, Camera, PencilSimple, Check, X, ArrowCounterClockwise, WarningOctagon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth-provider";
import { useData } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { AUTH_USERS } from "@/lib/auth-users";
import { logout } from "@/lib/auth-actions";
import { initials } from "@/lib/format";
import { getAreaIcon } from "@/lib/areas-icons";
import { cn } from "@/lib/utils";

export default function ConfiguracionPage() {
  const user = useAuth();
  const { theme, setTheme } = useTheme();
  const { profileName, setProfileName, avatarUrl, setAvatarUrl, resetData } = useData();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profileName ?? user.nombre);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(profileName ?? user.nombre);
  }, [profileName, user.nombre]);

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== (profileName ?? user.nombre)) {
      setProfileName(trimmed);
      toast("Nombre actualizado correctamente");
    }
    setEditingName(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("La imagen no puede superar 2 MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
      toast("Foto de perfil actualizada");
    };
    reader.readAsDataURL(file);
  }

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
              {/* Avatar with upload */}
              <div className="relative flex-shrink-0 group">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-primary-foreground text-lg font-bold cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all"
                  style={{ background: avatarUrl ? "transparent" : "var(--primary)" }}
                  onClick={() => fileRef.current?.click()}
                  title="Cambiar foto"
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    : initials(user.nombre)
                  }
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground shadow-md border-2 border-card transition-transform group-hover:scale-110"
                  style={{ background: "var(--primary)" }}
                  title="Cambiar foto"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {editingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                        className="text-sm font-semibold text-foreground bg-muted border border-border rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-primary/30"
                        style={{ minWidth: 0, width: Math.max(nameInput.length, 8) + "ch" }}
                      />
                      <button type="button" onClick={saveName}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors">
                        <Check className="w-3 h-3" weight="bold" />
                      </button>
                      <button type="button" onClick={() => setEditingName(false)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-muted text-muted-foreground hover:bg-accent transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/name">
                      <p className="font-semibold text-foreground">{profileName ?? user.nombre}</p>
                      <button type="button" onClick={() => setEditingName(true)}
                        className="opacity-0 group-hover/name:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <PencilSimple className="w-3 h-3" />
                      </button>
                    </div>
                  )}
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
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => { setAvatarUrl(null); toast("Foto de perfil eliminada", "info"); }}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors mt-1"
                  >
                    Eliminar foto
                  </button>
                )}
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

        {/* Reset demo data — admin only */}
        {user.role === "admin" && (
          <Card className="border-amber-500/20 hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: "180ms", animationFillMode: "backwards" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <WarningOctagon className="w-4 h-4 text-amber-500" weight="duotone" /> Datos de demostración
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Restaura todos los bienes, categorías y movimientos al conjunto de datos inicial de la demo.
                Los cambios realizados durante la sesión se perderán.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="shrink-0 gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" /> Restablecer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: "220ms", animationFillMode: "backwards" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              SIBIM — Sistema Integral de Bienes Municipales. Los usuarios y la autenticación de esta versión son de
              demostración; deben sustituirse por un proveedor de autenticación real antes de producción.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Restablecer datos de demo"
        description="Se restaurarán todos los bienes, categorías y movimientos al estado inicial. Esta acción no se puede deshacer."
        confirmLabel="Restablecer"
        destructive
        onConfirm={() => { resetData(); setConfirmReset(false); toast("Datos restablecidos correctamente", "info"); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
