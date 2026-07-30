"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeSlash, SignIn, UsersThree, WarningCircle, CaretDown, SpinnerGap } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { login } from "@/lib/auth-actions";
import { AUTH_USERS } from "@/lib/auth-users";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-10 gap-2 text-primary-foreground"
      style={{ background: "var(--primary)" }}
    >
      {pending ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <SignIn className="w-4 h-4" />}
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function fillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-ambient-a"
        style={{ background: "var(--primary)" }} />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none animate-ambient-b"
        style={{ background: "var(--accent)" }} />

      <div className="w-full max-w-sm relative">
        {/* Logo entrance */}
        <div className="flex flex-col items-center mb-6 animate-in fade-in zoom-in-50 duration-700">
          <Logo size={64} className="drop-shadow-lg" />
          <h1 className="mt-4 text-lg font-bold text-foreground text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
            SIBIM
          </h1>
          <p className="text-xs text-muted-foreground text-center mt-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "220ms", animationFillMode: "backwards" }}>
            Sistema Integral de Bienes Municipales — H. Ayuntamiento
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-lg p-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-muted-foreground text-xs">Usuario</Label>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@ayuntamiento.gob.mx"
                autoComplete="username"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-muted-foreground text-xs">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
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
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1">
                <WarningCircle className="w-4 h-4 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>

        {/* Demo users panel */}
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: "380ms", animationFillMode: "backwards" }}>
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
            <div className="bg-card border border-border rounded-xl p-2 max-h-56 overflow-y-auto space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-[10px] text-muted-foreground px-2 py-1">
                Cuentas de demostración — sustituir por autenticación real en producción.
              </p>
              {AUTH_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillDemo(u.username, u.password)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-accent transition-colors flex items-center justify-between gap-2"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-foreground truncate">{u.nombre}</span>
                    <span className="block text-[10px] text-muted-foreground truncate">{u.area ?? "Superusuario"}</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
