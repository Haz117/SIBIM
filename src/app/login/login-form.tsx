"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Eye, EyeSlash, SignIn, UsersThree, WarningCircle, CaretDown, SpinnerGap,
  UserCircle, LockKey, Crown,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { login } from "@/lib/auth-actions";
import { AUTH_USERS } from "@/lib/auth-users";
import { getAreaIcon } from "@/lib/areas-icons";
import { cn } from "@/lib/utils";
import { BrandPanel } from "./brand-panel";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-10 gap-2 text-primary-foreground transition-transform active:scale-[0.98]"
      style={{ background: "var(--primary)" }}
    >
      {pending ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <SignIn className="w-4 h-4" />}
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </Button>
  );
}

function DemoUserRow({ nombre, area, username, password, onPick }: {
  nombre: string; area: string | null; username: string; password: string; onPick: (u: string, p: string) => void;
}) {
  // Stable lookup (same `area` always resolves to the same stateless Phosphor
  // component), so dynamic selection here is safe — see CategoryIcon for the same pattern.
  const Icon = area ? getAreaIcon(area) : Crown;
  return (
    <button
      type="button"
      onClick={() => onPick(username, password)}
      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5"
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
        area ? "bg-accent text-primary" : "text-primary-foreground"
      )} style={!area ? { background: "var(--primary)" } : undefined}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="w-3.5 h-3.5" weight="duotone" />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-foreground truncate">{nombre}</span>
        <span className="block text-[10px] text-muted-foreground truncate">{area ?? "Superusuario"}</span>
      </span>
      <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{username}</span>
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const prevErrorRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (state?.error && state.error !== prevErrorRef.current) {
      prevErrorRef.current = state.error;
      setErrorKey((k) => k + 1);
    }
  }, [state?.error]);

  function fillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
  }

  const admins = AUTH_USERS.filter((u) => u.role === "admin");
  const secretarios = AUTH_USERS.filter((u) => u.role === "secretario");
  const direcciones = AUTH_USERS.filter((u) => u.role === "direccion");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <BrandPanel />

      <div className="relative flex items-center justify-center overflow-hidden px-4 py-10">
        {/* Ambient background (visible on mobile where BrandPanel is hidden) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-ambient-a"
          style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none animate-ambient-b"
          style={{ background: "var(--accent)" }} />

        <div className="w-full max-w-sm relative">
          {/* Compact branding — mobile only, desktop has the BrandPanel */}
          <div className="flex flex-col items-center mb-6 lg:hidden animate-in fade-in zoom-in-50 duration-700">
            <Logo size={56} className="drop-shadow-lg" />
            <h1 className="mt-3 text-lg font-bold text-foreground text-center">SIBIM</h1>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Sistema Integral de Bienes Municipales
            </p>
          </div>

          <div className="hidden lg:block mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-xl font-bold text-foreground">Bienvenido de nuevo</h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresa con tu cuenta institucional.</p>
          </div>

          <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-3 duration-700"
            style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, transparent, var(--primary), transparent)" }} />
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-muted-foreground text-xs">Usuario</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario@ayuntamiento.gob.mx"
                    autoComplete="username"
                    className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-muted-foreground text-xs">Contraseña</Label>
                <div className="relative">
                  <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-9 pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {state?.error && (
                <div key={errorKey}
                  className="animate-shake flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <WarningCircle className="w-4 h-4 flex-shrink-0" weight="fill" />
                  {state.error}
                </div>
              )}

              <SubmitButton />
            </form>
          </div>

          {/* Demo users panel */}
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <UsersThree className="w-3.5 h-3.5" />
              Usuarios de prueba
              <CaretDown className={cn("w-3 h-3 transition-transform", showDemo && "rotate-180")} />
            </button>

            {showDemo && (
              <div className="bg-card border border-border rounded-xl p-2 max-h-64 overflow-y-auto space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] text-muted-foreground px-2 pt-1">
                  Cuentas de demostración — sustituir por autenticación real en producción.
                </p>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2.5 pb-1">Superusuario</p>
                  {admins.map((u) => (
                    <DemoUserRow key={u.id} nombre={u.nombre} area={u.area} username={u.username} password={u.password} onPick={fillDemo} />
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2.5 pb-1">Secretarios (secretaría completa)</p>
                  <div className="space-y-0.5">
                    {secretarios.map((u) => (
                      <DemoUserRow key={u.id} nombre={u.nombre} area={u.area} username={u.username} password={u.password} onPick={fillDemo} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2.5 pb-1">Direcciones (solo la suya)</p>
                  <div className="space-y-0.5">
                    {direcciones.map((u) => (
                      <DemoUserRow key={u.id} nombre={u.nombre} area={u.area} username={u.username} password={u.password} onPick={fillDemo} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-muted-foreground/60 animate-in fade-in duration-700"
            style={{ animationDelay: "350ms", animationFillMode: "backwards" }}>
            H. Ayuntamiento Municipal · SIBIM · Sistema Integral de Bienes Municipales
          </p>
      </div>
    </div>
  );
}
