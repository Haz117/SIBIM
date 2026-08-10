"use client"

import { useRef, useState, useEffect, type ChangeEvent } from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  UserCircle, Palette, ShieldCheck, Info, Crown, Briefcase, Envelope, SignOut,
  Sun, Moon, Desktop, Camera, PencilSimple, Check, X, ArrowCounterClockwise,
  WarningOctagon, UserPlus, Trash, Key, PencilLine,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { logout } from "@/lib/auth-actions"
import { dbAddUser, dbUpdateUser, dbChangeUserPassword, dbDeleteUser } from "@/lib/db-actions"
import { initials } from "@/lib/format"
import { getAreaIcon } from "@/lib/areas-icons"
import { compressImage } from "@/lib/image"
import { ALL_AREA_NAMES } from "@/lib/areas-list"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth-users"

type ModalMode = "create" | "edit" | "password"

interface UserFormState {
  nombre: string
  username: string
  password: string
  cargo: string
  role: "admin" | "secretario" | "direccion"
  area: string
}

const EMPTY_FORM: UserFormState = {
  nombre: "",
  username: "",
  password: "",
  cargo: "",
  role: "direccion",
  area: "",
}

export function ConfiguracionClient({
  initialUsers,
  canManage,
}: {
  initialUsers: AuthUser[]
  canManage: boolean
}) {
  const currentUser = useAuth()
  const { theme, setTheme } = useTheme()
  const { profileName, setProfileName, avatarUrl, setAvatarUrl, resetData } = useData()
  const { toast } = useToast()

  const [users, setUsers] = useState(initialUsers)
  const [userModal, setUserModal] = useState<{ mode: ModalMode; user?: AuthUser } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AuthUser | null>(null)
  const [formData, setFormData] = useState<UserFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [confirmReset, setConfirmReset] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profileName ?? currentUser.nombre)
  const fileRef = useRef<HTMLInputElement>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [prevSourceName, setPrevSourceName] = useState(profileName ?? currentUser.nombre)
  const sourceName = profileName ?? currentUser.nombre
  if (sourceName !== prevSourceName) {
    setPrevSourceName(sourceName)
    setNameInput(sourceName)
  }

  function saveName() {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== (profileName ?? currentUser.nombre)) {
      setProfileName(trimmed)
      toast("Nombre actualizado correctamente")
    }
    setEditingName(false)
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast("La imagen no puede superar 8 MB", "error")
      e.target.value = ""
      return
    }
    try {
      const url = await compressImage(file, 320, 0.85)
      setAvatarUrl(url)
      toast("Foto de perfil actualizada")
    } catch {
      toast("No se pudo procesar la imagen. Intenta con otro archivo.", "error")
    } finally {
      e.target.value = ""
    }
  }

  function openCreate() {
    setFormData(EMPTY_FORM)
    setFormError(null)
    setUserModal({ mode: "create" })
  }

  function openEdit(u: AuthUser) {
    setFormData({ nombre: u.nombre, username: u.username, password: "", cargo: u.cargo, role: u.role, area: u.area ?? "" })
    setFormError(null)
    setUserModal({ mode: "edit", user: u })
  }

  function openPassword(u: AuthUser) {
    setFormData({ ...EMPTY_FORM, password: "" })
    setFormError(null)
    setUserModal({ mode: "password", user: u })
  }

  function closeModal() {
    if (!saving) setUserModal(null)
  }

  async function handleSubmitUser() {
    setFormError(null)
    setSaving(true)
    try {
      const mode = userModal!.mode
      if (mode === "create") {
        if (!formData.nombre.trim() || !formData.username.trim() || !formData.password || !formData.cargo.trim()) {
          setFormError("Completa todos los campos obligatorios.")
          return
        }
        if (formData.role !== "admin" && !formData.area.trim()) {
          setFormError("Debes asignar un área para secretarios y direcciones.")
          return
        }
        const newUser = await dbAddUser({
          nombre: formData.nombre.trim(),
          username: formData.username.trim(),
          password: formData.password,
          cargo: formData.cargo.trim(),
          role: formData.role,
          area: formData.area || null,
        })
        setUsers((prev) => [...prev, newUser])
        toast(`Usuario ${newUser.nombre} creado`)
        setUserModal(null)
      } else if (mode === "edit") {
        if (!formData.nombre.trim() || !formData.cargo.trim()) {
          setFormError("Nombre y cargo son obligatorios.")
          return
        }
        if (formData.role !== "admin" && !formData.area.trim()) {
          setFormError("Debes asignar un área para secretarios y direcciones.")
          return
        }
        const id = userModal!.user!.id
        const updates = {
          nombre: formData.nombre.trim(),
          cargo: formData.cargo.trim(),
          role: formData.role,
          area: formData.area || null,
        }
        await dbUpdateUser(id, updates)
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)))
        toast("Usuario actualizado")
        setUserModal(null)
      } else {
        if (!formData.password || formData.password.length < 8) {
          setFormError("La contraseña debe tener al menos 8 caracteres.")
          return
        }
        await dbChangeUserPassword(userModal!.user!.id, formData.password)
        toast("Contraseña actualizada")
        setUserModal(null)
      }
    } catch (e: unknown) {
      setFormError((e as Error)?.message ?? "Ocurrió un error. Intente de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return
    try {
      await dbDeleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      toast(`Usuario ${deleteTarget.nombre} eliminado`)
    } catch (e: unknown) {
      toast((e as Error)?.message ?? "No se pudo eliminar el usuario.", "error")
    } finally {
      setDeleteTarget(null)
    }
  }

  const modalTitle =
    userModal?.mode === "create" ? "Agregar usuario"
    : userModal?.mode === "edit" ? "Editar usuario"
    : "Cambiar contraseña"

  const submitLabel =
    userModal?.mode === "create" ? "Crear usuario"
    : userModal?.mode === "password" ? "Cambiar contraseña"
    : "Guardar cambios"

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Configuración" subtitle="Tu cuenta y preferencias del sistema" />

      <div className="p-6 space-y-6 max-w-3xl">

        {/* Mi cuenta */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary" weight="duotone" /> Mi cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 group">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-primary-foreground text-lg font-bold cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all"
                  style={{ background: avatarUrl ? "transparent" : "var(--primary)" }}
                  onClick={() => fileRef.current?.click()}
                  title="Cambiar foto"
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    : initials(currentUser.nombre)
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
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-teal-500/20 text-teal-500 hover:bg-teal-500/30 transition-colors">
                        <Check className="w-3 h-3" weight="bold" />
                      </button>
                      <button type="button" onClick={() => setEditingName(false)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-muted text-muted-foreground hover:bg-accent transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 group/name">
                      <p className="font-semibold text-foreground">{profileName ?? currentUser.nombre}</p>
                      <button type="button" onClick={() => setEditingName(true)}
                        className="opacity-0 group-hover/name:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <PencilSimple className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {currentUser.role === "admin" && (
                    <Badge className="text-xs gap-1 border-0 text-primary-foreground" style={{ background: "var(--primary)" }}>
                      <Crown className="w-3 h-3" weight="fill" /> Superusuario
                    </Badge>
                  )}
                  {currentUser.role === "secretario" && (
                    <Badge className="text-xs gap-1 border-0 bg-accent text-primary">
                      <ShieldCheck className="w-3 h-3" weight="fill" /> Secretario/a
                    </Badge>
                  )}
                  {currentUser.role === "direccion" && (
                    <Badge variant="secondary" className="text-xs gap-1 border-0">
                      <Briefcase className="w-3 h-3" /> Dirección
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {currentUser.cargo}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Envelope className="w-3.5 h-3.5" /> {currentUser.username}
                </p>
                {avatarUrl && (
                  <button type="button"
                    onClick={() => { setAvatarUrl(null); toast("Foto de perfil eliminada", "info") }}
                    className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors mt-1">
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-border my-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Área asignada</p>
                <p className="text-sm text-foreground mt-1">{currentUser.area ?? "Todas las áreas (acceso total)"}</p>
              </div>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm"
                  className="gap-1.5 border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30">
                  <SignOut className="w-3.5 h-3.5" /> Cerrar sesión
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
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
                { value: "dark",  label: "Oscuro", icon: Moon },
                { value: "system", label: "Sistema", icon: Desktop },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs transition-all",
                    mounted && theme === value
                      ? "border-primary bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" weight={mounted && theme === value ? "fill" : "regular"} />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuarios — solo admin */}
        {currentUser.role === "admin" && (
          <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" weight="duotone" /> Usuarios con acceso
              </CardTitle>
              {canManage && (
                <Button type="button" size="sm" onClick={openCreate} className="gap-1.5 h-7 text-xs">
                  <UserPlus className="w-3.5 h-3.5" /> Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {!canManage && (
                <p className="text-xs text-muted-foreground mb-2 px-2">
                  Modo demo — conecta Supabase para gestionar usuarios desde aquí.
                </p>
              )}
              {users.map((u) => {
                const AreaIcon = u.area ? getAreaIcon(u.area) : Crown
                const roleLabel = u.role === "admin" ? "Superusuario" : u.role === "secretario" ? "Secretario/a" : "Dirección"
                const roleClass = u.role === "admin"
                  ? "text-primary-foreground"
                  : u.role === "secretario"
                  ? "bg-accent text-primary"
                  : "bg-muted text-muted-foreground"
                return (
                  <div key={u.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors group/row">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-accent text-primary">
                      {initials(u.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{u.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <AreaIcon className="w-3 h-3 flex-shrink-0" /> {u.area ?? "Todas las áreas"}
                      </p>
                    </div>
                    <Badge
                      className={cn("text-[10px] border-0 flex-shrink-0", roleClass)}
                      style={u.role === "admin" ? { background: "var(--primary)" } : undefined}
                    >
                      {roleLabel}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground flex-shrink-0 hidden sm:inline">{u.username}</span>
                    {canManage && (
                      <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0">
                        <button type="button" onClick={() => openEdit(u)}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Editar">
                          <PencilLine className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => openPassword(u)}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Cambiar contraseña">
                          <Key className="w-3 h-3" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button type="button" onClick={() => setDeleteTarget(u)}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar">
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Recargar / restablecer — solo admin */}
        {currentUser.role === "admin" && (
          <Card className="border-amber-500/20 hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
            style={{ animationDelay: "180ms", animationFillMode: "backwards" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <WarningOctagon className="w-4 h-4 text-amber-500" weight="duotone" />
                {canManage ? "Recargar datos" : "Datos de demostración"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {canManage
                  ? "Recarga los datos desde la base de datos para reflejar cambios realizados por otros usuarios."
                  : "Restaura todos los bienes, categorías y movimientos al conjunto de datos inicial de la demo. Los cambios realizados durante la sesión se perderán."
                }
              </p>
              <Button type="button" variant="outline" size="sm"
                onClick={() => setConfirmReset(true)}
                className="shrink-0 gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50">
                <ArrowCounterClockwise className="w-3.5 h-3.5" />
                {canManage ? "Recargar" : "Restablecer"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Acerca de */}
        <Card className="border-border hover:shadow-md transition-shadow bg-card animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: "220ms", animationFillMode: "backwards" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              SIBIM — Sistema Integral de Bienes Municipales.
              {!canManage && " Los usuarios y la autenticación de esta versión son de demostración; configura Supabase antes de producción."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confirmar reload / reset */}
      <ConfirmDialog
        open={confirmReset}
        title={canManage ? "Recargar datos" : "Restablecer datos de demo"}
        description={
          canManage
            ? "Se recargará la página para obtener los datos más recientes del servidor."
            : "Se restaurarán todos los bienes, categorías y movimientos al estado inicial. Esta acción no se puede deshacer."
        }
        confirmLabel={canManage ? "Recargar" : "Restablecer"}
        destructive={!canManage}
        onConfirm={() => { resetData(); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Confirmar eliminar usuario */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        description={`¿Eliminar a ${deleteTarget?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal crear / editar / contraseña */}
      <Dialog open={!!userModal} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {formError && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{formError}</p>
            )}

            {userModal?.mode === "password" ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nueva contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>

                {userModal?.mode === "create" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Usuario *</Label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                        placeholder="usuario.ejemplo"
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Contraseña *</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cargo *</Label>
                  <Input
                    value={formData.cargo}
                    onChange={(e) => setFormData((p) => ({ ...p, cargo: e.target.value }))}
                    placeholder="Ej. Responsable de bienes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Rol *</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        const role = e.target.value as UserFormState["role"]
                        setFormData((p) => ({ ...p, role, area: role === "admin" ? "" : p.area }))
                      }}
                      className="h-8 w-full rounded-xl border border-input bg-background px-2.5 py-1 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <option value="admin">Superusuario</option>
                      <option value="secretario">Secretario/a</option>
                      <option value="direccion">Dirección</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Área {formData.role !== "admin" && "*"}
                    </Label>
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))}
                      disabled={formData.role === "admin"}
                      className="h-8 w-full rounded-xl border border-input bg-background px-2.5 py-1 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">— Todas —</option>
                      {ALL_AREA_NAMES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmitUser} disabled={saving}>
              {saving ? "Guardando…" : submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
