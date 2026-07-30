"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Package, TrendingUp, AlertTriangle, XCircle,
  ArrowUpRight, ArrowDownRight, DollarSign, Activity,
} from "lucide-react";
import { mockProducts, mockMovements, mockStats, mockCategories } from "@/lib/mock-data";
import { CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";
import type { AuthUser } from "@/lib/auth-users";

const movimientosSemana = [
  { dia: "Lun", entradas: 12, salidas: 8 },
  { dia: "Mar", entradas: 5, salidas: 15 },
  { dia: "Mié", entradas: 20, salidas: 10 },
  { dia: "Jue", entradas: 8, salidas: 18 },
  { dia: "Vie", entradas: 15, salidas: 22 },
  { dia: "Sáb", entradas: 30, salidas: 25 },
  { dia: "Dom", entradas: 3, salidas: 5 },
];

function buildValorPorCategoria(scopedProducts: typeof mockProducts) {
  return mockCategories
    .map((cat) => ({
      name: cat.nombre.split(" ")[0],
      value: scopedProducts.filter((p) => p.categoria_id === cat.id).reduce((s, p) => s + p.stock_actual * p.precio_venta, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0);
}

function buildStatCards(user: AuthUser, scopedProducts: typeof mockProducts, scopedMovements: typeof mockMovements) {
  if (user.role === "admin") {
    return [
      { label: "Total de Bienes", value: mockStats.total_productos, icon: Package, color: "#7C3AED", bg: "rgba(124,58,237,0.15)", change: "+2 este mes", up: true },
      { label: "Valor Patrimonial", value: `$${mockStats.valor_total_inventario.toLocaleString()}`, icon: DollarSign, color: "#10B981", bg: "rgba(16,185,129,0.15)", change: "+8.2% vs ayer", up: true },
      { label: "Existencias Bajas", value: mockStats.productos_bajo_stock, icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", change: "Requiere atención", up: false },
      { label: "Agotados", value: mockStats.productos_agotados, icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.15)", change: "Reponer existencias", up: false },
      { label: "Movimientos Hoy", value: mockStats.movimientos_hoy, icon: Activity, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", change: `${mockMovements.length} operaciones`, up: true },
      { label: "Categorías", value: mockStats.categorias, icon: TrendingUp, color: "#3B82F6", bg: "rgba(59,130,246,0.15)", change: "Todas activas", up: true },
    ];
  }

  const valor = scopedProducts.reduce((s, p) => s + p.stock_actual * p.precio_venta, 0);
  const bajoStock = scopedProducts.filter((p) => p.estado === "bajo_stock").length;
  const agotados = scopedProducts.filter((p) => p.estado === "agotado").length;
  const categorias = new Set(scopedProducts.map((p) => p.categoria_id)).size;

  return [
    { label: "Bienes de mi Área", value: scopedProducts.length, icon: Package, color: "#7C3AED", bg: "rgba(124,58,237,0.15)", change: user.area ?? "", up: true },
    { label: "Valor de mi Área", value: `$${valor.toLocaleString()}`, icon: DollarSign, color: "#10B981", bg: "rgba(16,185,129,0.15)", change: "Valor actual", up: true },
    { label: "Existencias Bajas", value: bajoStock, icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", change: "Requiere atención", up: false },
    { label: "Agotados", value: agotados, icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.15)", change: "Reponer existencias", up: false },
    { label: "Movimientos", value: scopedMovements.length, icon: Activity, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", change: "Registrados", up: true },
    { label: "Categorías", value: categorias, icon: TrendingUp, color: "#3B82F6", bg: "rgba(59,130,246,0.15)", change: "En uso", up: true },
  ];
}

export default function DashboardPage() {
  const user = useAuth();
  const scopedProducts = user.role === "admin" ? mockProducts : mockProducts.filter((p) => p.area === user.area);
  const scopedMovements = user.role === "admin" ? mockMovements : mockMovements.filter((m) => m.producto?.area === user.area);
  const STAT_CARDS = buildStatCards(user, scopedProducts, scopedMovements);
  const valorPorCategoria = buildValorPorCategoria(scopedProducts);
  const bajosStock = scopedProducts.filter((p) => p.estado === "bajo_stock" || p.estado === "agotado");

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Dashboard" subtitle="Resumen general del inventario" />

      <div className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, change, up }, i) => (
            <Card key={label}
              className="border-border relative overflow-hidden group bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-1"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}>
              <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
              <CardContent className="p-4 pl-5">
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {up
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs mt-1.5 text-muted-foreground">{label}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: up ? "#10B981" : "#F59E0B" }}>{change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Movements chart */}
          <Card className="xl:col-span-2 border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Movimientos de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={movimientosSemana}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dia" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }} />
                  <Area type="monotone" dataKey="entradas" stroke="#7C3AED" strokeWidth={2} fill="url(#colorEntradas)" name="Entradas" />
                  <Area type="monotone" dataKey="salidas" stroke="#10B981" strokeWidth={2} fill="url(#colorSalidas)" name="Salidas" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-600" /><span className="text-xs text-muted-foreground">Entradas</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Salidas</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Valor por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={valorPorCategoria} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value">
                    {valorPorCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {valorPorCategoria.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-medium text-foreground">${cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Alertas stock */}
          <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Alertas de Stock</CardTitle>
                <Badge variant="destructive" className="text-xs">{bajosStock.length} alertas</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bajosStock.map((p) => {
                const pct = p.stock_maximo > 0 ? (p.stock_actual / p.stock_maximo) * 100 : 0;
                const isAgotado = p.estado === "agotado";
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={p.categoria?.icono} className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{p.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{p.stock_actual}/{p.stock_maximo}</span>
                        <Badge variant={isAgotado ? "destructive" : "secondary"}
                          className={!isAgotado ? "bg-amber-500/20 text-amber-400 border-0 text-xs" : "text-xs"}>
                          {isAgotado ? "Agotado" : "Bajo"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={pct} className="h-1.5"
                      style={{ background: "var(--muted)" }} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Últimos movimientos */}
          <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scopedMovements.map((mov) => (
                <div key={mov.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    mov.tipo === "entrada" ? "bg-emerald-500/15" :
                    mov.tipo === "salida" ? "bg-red-500/15" : "bg-purple-500/15"
                  }`}>
                    {mov.tipo === "entrada"
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : mov.tipo === "salida"
                      ? <ArrowDownRight className="w-4 h-4 text-red-400" />
                      : <Activity className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{mov.producto?.nombre}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{mov.motivo} · {mov.usuario_nombre}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${
                      mov.tipo === "entrada" ? "text-emerald-400" : mov.tipo === "salida" ? "text-red-400" : "text-purple-400"
                    }`}>
                      {mov.tipo === "entrada" ? "+" : mov.tipo === "salida" ? "-" : "~"}{mov.cantidad}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(mov.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
