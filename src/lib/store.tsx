"use client"

import { createContext, useContext, useState, useCallback } from "react"
import type { Product, Category, Movement } from "@/lib/types"
import {
  dbAddProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbAddCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbAddMovement,
  dbDeleteMovement,
} from "@/lib/db-actions"

interface DataStore {
  products: Product[]
  categories: Category[]
  movements: Movement[]
  profileName: string | null
  setProfileName: (name: string) => void
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  resetData: () => void
  addProduct: (p: Omit<Product, "id" | "created_at" | "updated_at">) => void
  restoreProduct: (p: Product) => void
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "created_at">>) => void
  deleteProduct: (id: string) => void
  addCategory: (c: Omit<Category, "id" | "created_at">) => void
  updateCategory: (id: string, updates: Partial<Omit<Category, "id">>) => void
  deleteCategory: (id: string) => void
  addMovement: (m: Omit<Movement, "id" | "created_at">) => void
  deleteMovement: (id: string) => void
}

const DataContext = createContext<DataStore | null>(null)

export function DataProvider({
  children,
  initialProducts = [],
  initialCategories = [],
  initialMovements = [],
}: {
  children: React.ReactNode
  initialProducts?: Product[]
  initialCategories?: Category[]
  initialMovements?: Movement[]
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [movements, setMovements] = useState<Movement[]>(initialMovements)

  // Preferencias de usuario — se mantienen en localStorage (no son datos de inventario)
  const [profileName, setProfileNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("sibim_profileName")
  })

  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("sibim_avatarUrl")
  })

  const setProfileName = useCallback((name: string) => {
    setProfileNameState(name)
    localStorage.setItem("sibim_profileName", name)
  }, [])

  const setAvatarUrl = useCallback((url: string | null) => {
    setAvatarUrlState(url)
    if (url) localStorage.setItem("sibim_avatarUrl", url)
    else localStorage.removeItem("sibim_avatarUrl")
  }, [])

  // Recarga la página para obtener datos frescos del servidor
  const resetData = useCallback(() => {
    window.location.reload()
  }, [])

  // ── Productos ──────────────────────────────────────────────

  const addProduct = useCallback((data: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const product: Product = { ...data, id, created_at: now, updated_at: now }
    setProducts((prev) => [product, ...prev])
    dbAddProduct(product).catch(console.error)
  }, [])

  const restoreProduct = useCallback((p: Product) => {
    setProducts((prev) => [p, ...prev])
    dbAddProduct(p).catch(console.error)
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, "id" | "created_at">>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    )
    dbUpdateProduct(id, updates).catch(console.error)
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    dbDeleteProduct(id).catch(console.error)
  }, [])

  // ── Categorías ─────────────────────────────────────────────

  const addCategory = useCallback((data: Omit<Category, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    const category: Category = { ...data, id, created_at: new Date().toISOString() }
    setCategories((prev) => [...prev, category])
    dbAddCategory(category).catch(console.error)
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, "id">>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    setProducts((prev) =>
      prev.map((p) =>
        p.categoria_id === id
          ? { ...p, categoria: { ...p.categoria!, ...updates }, updated_at: new Date().toISOString() }
          : p
      )
    )
    dbUpdateCategory(id, updates).catch(console.error)
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    dbDeleteCategory(id).catch(console.error)
  }, [])

  // ── Movimientos ────────────────────────────────────────────

  const addMovement = useCallback((data: Omit<Movement, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const movement: Movement = { ...data, id, created_at: now }

    setMovements((prev) => [movement, ...prev])
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== data.producto_id) return p
        const newStock = data.stock_nuevo
        const estado: Product["estado"] =
          newStock === 0 ? "agotado" : newStock <= p.stock_minimo ? "bajo_stock" : "activo"
        return { ...p, stock_actual: newStock, estado, updated_at: now }
      })
    )
    dbAddMovement(movement).catch(console.error)
  }, [])

  const deleteMovement = useCallback((id: string) => {
    setMovements((prev) => {
      const mov = prev.find((m) => m.id === id)
      if (mov) {
        const restoredStock = mov.stock_anterior
        setProducts((products) =>
          products.map((p) => {
            if (p.id !== mov.producto_id) return p
            const estado: Product["estado"] =
              restoredStock === 0 ? "agotado" : restoredStock <= p.stock_minimo ? "bajo_stock" : "activo"
            return { ...p, stock_actual: restoredStock, estado, updated_at: new Date().toISOString() }
          })
        )
        dbDeleteMovement(id, mov.producto_id, restoredStock).catch(console.error)
      }
      return prev.filter((m) => m.id !== id)
    })
  }, [])

  return (
    <DataContext.Provider
      value={{
        products, categories, movements,
        profileName, setProfileName,
        avatarUrl, setAvatarUrl,
        resetData,
        addProduct, restoreProduct, updateProduct, deleteProduct,
        addCategory, updateCategory, deleteCategory,
        addMovement, deleteMovement,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used inside DataProvider")
  return ctx
}
