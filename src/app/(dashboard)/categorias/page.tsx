"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { mockCategories, mockProducts } from "@/lib/mock-data";
import { CATEGORY_ICON_NAMES, resolveCategoryIcon, CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";

export default function CategoriasPage() {
  const user = useAuth();
  const [openDialog, setOpenDialog] = useState(false);

  const scopedProducts = user.role === "admin" ? mockProducts : mockProducts.filter((p) => p.area === user.area);
  const categoriasConBienes = user.role === "admin"
    ? mockCategories
    : mockCategories.filter((c) => scopedProducts.some((p) => p.categoria_id === c.id));

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Categorías" subtitle="Tipos de bienes patrimoniales" />

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {user.role === "admin"
              ? `${mockCategories.length} categorías activas`
              : `${categoriasConBienes.length} categorías con bienes en tu área`}
          </p>
          {user.role === "admin" && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger render={<Button className="h-9 gap-2 text-primary-foreground" style={{ background: "var(--primary)" }} />}>
                <Plus className="w-4 h-4" /> Nueva Categoría
              </DialogTrigger>
              <DialogContent className="max-w-md border-border text-foreground bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nueva Categoría</DialogTitle>
                </DialogHeader>
                <CategoriaForm onClose={() => setOpenDialog(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categoriasConBienes.map((cat, i) => {
            const productos = scopedProducts.filter((p) => p.categoria_id === cat.id);
            const activos = productos.filter((p) => p.estado === "activo").length;
            const alerta = productos.filter((p) => p.estado === "bajo_stock" || p.estado === "agotado").length;

            return (
              <Card key={cat.id}
                className="border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group bg-card animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{ background: `${cat.color}20`, color: cat.color }}>
                        <CategoryIcon name={cat.icono} className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">{cat.nombre}</CardTitle>
                        <p className="text-xs mt-0.5 text-muted-foreground">{cat.descripcion}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent text-muted-foreground hover:text-primary">
                        <PencilSimple className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-px bg-border mb-3" />
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold text-foreground">{productos.length}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-500">{activos}</p>
                      <p className="text-xs text-muted-foreground">Activos</p>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${alerta > 0 ? "text-amber-500" : "text-muted-foreground/50"}`}>{alerta}</p>
                      <p className="text-xs text-muted-foreground">Alertas</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs text-muted-foreground">Color de sección</span>
                    </div>
                    {alerta > 0 && (
                      <Badge className="text-xs bg-amber-500/15 text-amber-500 border-0">
                        {alerta} alerta{alerta > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoriaForm({ onClose }: { onClose: () => void }) {
  const COLORS = ["#7C3AED", "#10B981", "#EF4444", "#F59E0B", "#3B82F6", "#F97316", "#EC4899", "#06B6D4"];
  const [selectedIcon, setSelectedIcon] = useState("Armchair");
  const [selectedColor, setSelectedColor] = useState("#7C3AED");

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Nombre *</Label>
        <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej. Mobiliario" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Descripción</Label>
        <Textarea className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none" rows={2} placeholder="Descripción de la sección..." />
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Ícono</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ICON_NAMES.map((name) => {
            const Icon = resolveCategoryIcon(name);
            return (
              <button key={name} type="button" onClick={() => setSelectedIcon(name)}
                aria-label={name}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${selectedIcon === name ? "ring-2 ring-purple-500 bg-purple-500/20 text-purple-500" : "bg-muted hover:bg-accent text-muted-foreground"}`}>
                <Icon className="w-4.5 h-4.5" weight="duotone" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Color</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setSelectedColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-ring ring-offset-background scale-110" : ""}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:bg-accent">
          Cancelar
        </Button>
        <Button className="flex-1 text-primary-foreground" style={{ background: "var(--primary)" }}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
