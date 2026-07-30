"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Eye, Package, Upload } from "lucide-react";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import { Product, ProductStatus } from "@/lib/types";
import { CategoryIcon } from "@/lib/icon-map";
import { ALL_AREA_NAMES } from "@/lib/areas-list";
import { useAuth } from "@/components/auth-provider";
import type { AuthUser } from "@/lib/auth-users";

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  activo: { label: "Activo", className: "bg-emerald-500/20 text-emerald-400 border-0" },
  bajo_stock: { label: "Bajo Stock", className: "bg-amber-500/20 text-amber-400 border-0" },
  agotado: { label: "Agotado", className: "bg-red-500/20 text-red-400 border-0" },
  vencido: { label: "Vencido", className: "bg-gray-500/20 text-gray-400 border-0" },
};

const AREAS_CON_BIENES = Array.from(new Set(mockProducts.map((p) => p.area).filter(Boolean))) as string[];

export default function ProductosPage() {
  return (
    <Suspense fallback={null}>
      <ProductosContent />
    </Suspense>
  );
}

function ProductosContent() {
  const user = useAuth();
  const searchParams = useSearchParams();
  const areaFromUrl = searchParams.get("area") ?? "todas";

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterArea, setFilterArea] = useState(areaFromUrl);
  const [openDialog, setOpenDialog] = useState(false);

  const scopedProducts = user.role === "admin" ? mockProducts : mockProducts.filter((p) => p.area === user.area);

  const filtered = scopedProducts.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "todas" || p.categoria_id === filterCat;
    const matchStatus = filterStatus === "todos" || p.estado === filterStatus;
    const matchArea = filterArea === "todas" || p.area === filterArea;
    return matchSearch && matchCat && matchStatus && matchArea;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Productos" subtitle={`${filtered.length} bienes encontrados`} />

      <div className="p-6 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="pl-9 h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
          </div>

          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-44 h-9 bg-muted border-border text-foreground">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="border-border" style={{ background: "var(--card)" }}>
              <SelectItem value="todas" className="text-foreground">Todas las categorías</SelectItem>
              {mockCategories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-foreground">
                  <span className="inline-flex items-center gap-1.5"><CategoryIcon name={c.icono} className="w-3.5 h-3.5" /> {c.nombre}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9 bg-muted border-border text-foreground">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="border-border" style={{ background: "var(--card)" }}>
              <SelectItem value="todos" className="text-foreground">Todos</SelectItem>
              <SelectItem value="activo" className="text-foreground">Activo</SelectItem>
              <SelectItem value="bajo_stock" className="text-foreground">Bajo Stock</SelectItem>
              <SelectItem value="agotado" className="text-foreground">Agotado</SelectItem>
              <SelectItem value="vencido" className="text-foreground">Vencido</SelectItem>
            </SelectContent>
          </Select>

          {user.role === "admin" && (
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-56 h-9 bg-muted border-border text-foreground">
                <SelectValue placeholder="Área asignada" />
              </SelectTrigger>
              <SelectContent className="border-border" style={{ background: "var(--card)" }}>
                <SelectItem value="todas" className="text-foreground">Todas las áreas</SelectItem>
                {AREAS_CON_BIENES.map((a) => (
                  <SelectItem key={a} value={a} className="text-foreground">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-2 text-foreground" style={{ background: "var(--primary)" }}>
                <Plus className="w-4 h-4" /> Agregar Bien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-border text-foreground" style={{ background: "var(--card)" }}>
              <DialogHeader>
                <DialogTitle className="text-foreground">Nuevo Bien</DialogTitle>
              </DialogHeader>
              <ProductForm onClose={() => setOpenDialog(false)} user={user} />
            </DialogContent>
          </Dialog>
        </div>

        {user.role === "admin" && filterArea !== "todas" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Filtrando por área:
            <Badge variant="secondary" className="bg-accent text-foreground border-0 gap-1.5">
              {filterArea}
              <button type="button" onClick={() => setFilterArea("todas")} className="hover:text-primary">×</button>
            </Badge>
          </div>
        )}

        {/* Table */}
        <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Bien</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Código</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Categoría</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Área asignada</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Existencias</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Valor Actual</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Garantía</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: "var(--muted)" }}>
                          {product.foto_url
                            ? <img src={product.foto_url} alt={product.nombre} className="w-full h-full object-cover rounded-xl" />
                            : <CategoryIcon name={product.categoria?.icono} className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{product.nombre}</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{product.ubicacion}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.codigo}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CategoryIcon name={product.categoria?.icono} className="w-3.5 h-3.5" /> {product.categoria?.nombre.split(" ")[0]}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48">
                      {product.area ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className={`font-bold text-sm ${
                          product.estado === "agotado" ? "text-red-400" :
                          product.estado === "bajo_stock" ? "text-amber-400" : "text-foreground"
                        }`}>{product.stock_actual}</span>
                        <span className="text-xs text-muted-foreground ml-1">{product.unidad}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">mín. {product.stock_minimo}</div>
                    </TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      ${product.precio_venta.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.fecha_vencimiento
                        ? <span className={new Date(product.fecha_vencimiento) < new Date() ? "text-red-400" : "text-muted-foreground"}>
                            {new Date(product.fecha_vencimiento).toLocaleDateString("es-MX")}
                          </span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${STATUS_CONFIG[product.estado].className}`}>
                        {STATUS_CONFIG[product.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-purple-400">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No se encontraron bienes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductForm({ onClose, user }: { onClose: () => void; user: AuthUser }) {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Foto */}
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Arrastra una foto o haz clic para subir</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 5MB</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Nombre del Bien *</Label>
          <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej. Escritorio ejecutivo" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Código *</Label>
          <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej. MB-001" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Categoría *</Label>
          <Select>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="border-border" style={{ background: "var(--card)" }}>
              {mockCategories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-foreground">
                  <span className="inline-flex items-center gap-1.5"><CategoryIcon name={c.icono} className="w-3.5 h-3.5" /> {c.nombre}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Unidad de Medida</Label>
          <Select>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="border-border" style={{ background: "var(--card)" }}>
              {["pieza", "unidad", "equipo", "juego", "lote"].map((u) => (
                <SelectItem key={u} value={u} className="text-foreground">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Área asignada</Label>
        {user.role === "admin" ? (
          <Select>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Secretaría o dirección responsable" />
            </SelectTrigger>
            <SelectContent className="border-border max-h-64" style={{ background: "var(--card)" }}>
              {ALL_AREA_NAMES.map((a) => (
                <SelectItem key={a} value={a} className="text-foreground">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={user.area ?? ""} disabled className="bg-muted border-border text-foreground disabled:opacity-100" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Costo de Adquisición ($)</Label>
          <Input type="number" className="bg-muted border-border text-foreground" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Valor Actual ($)</Label>
          <Input type="number" className="bg-muted border-border text-foreground" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Existencias Iniciales</Label>
          <Input type="number" className="bg-muted border-border text-foreground" placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Mínimo</Label>
          <Input type="number" className="bg-muted border-border text-foreground" placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Máximo</Label>
          <Input type="number" className="bg-muted border-border text-foreground" placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Vencimiento de Garantía</Label>
          <Input type="date" className="bg-muted border-border text-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Proveedor</Label>
          <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Nombre del proveedor" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Ubicación física</Label>
          <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej. Palacio Municipal, Piso 2" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Descripción</Label>
        <Textarea className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none" rows={2} placeholder="Descripción del bien..." />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:bg-accent hover:text-foreground">
          Cancelar
        </Button>
        <Button className="flex-1 text-foreground" style={{ background: "var(--primary)" }}>
          Guardar Bien
        </Button>
      </div>
    </div>
  );
}
