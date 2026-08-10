"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import type { Product, Category, Movement } from "@/lib/types"
import { computeEstado } from "@/lib/product-utils"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/components/auth-provider"
import {
  dbAddProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbAddCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbAddMovement,
  dbDeleteMovement,
  dbUpdateUserProfile,
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
  const { toast } = useToast()
  const { id: userId, foto_url: dbAvatarUrl } = useAuth()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [movements, setMovements] = useState<Movement[]>(initialMovements)

  // Refs para evitar stale closures en callbacks sin poner estado en dependencias
  const productsRef = useRef(products)
  const categoriesRef = useRef(categories)
  const movementsRef = useRef(movements)
  useEffect(() => { productsRef.current = products }, [products])
  useEffect(() => { categoriesRef.current = categories }, [categories])
  useEffect(() => { movementsRef.current = movements }, [movements])

  // Preferencias de usuario — localStorage como caché inmediato, BD como fuente de verdad
  const [profileName, setProfileNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("sibim_profileName")
  })

  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() => {
    if (typeof window === "undefined") return dbAvatarUrl ?? null
    return localStorage.getItem("sibim_avatarUrl") ?? dbAvatarUrl ?? null
  })

  const setProfileName = useCallback(async (name: string) => {
    setProfileNameState(name)
    localStorage.setItem("sibim_profileName", name)
    try { await dbUpdateUserProfile(userId, { nombre: name }) } catch { /* silent */ }
  }, [userId])

  const setAvatarUrl = useCallback(async (url: string | null) => {
    setAvatarUrlState(url)
    if (url) localStorage.setItem("sibim_avatarUrl", url)
    else localStorage.removeItem("sibim_avatarUrl")
    try { await dbUpdateUserProfile(userId, { foto_url: url }) } catch { /* silent */ }
  }, [userId])

  // Recarga la página para obtener datos frescos del servidor
  const resetData = useCallback(() => {
    window.location.reload()
  }, [])

  // ── Productos ──────────────────────────────────────────────

  const addProduct = useCallback(async (data: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const product: Product = { ...data, id, created_at: now, updated_at: now }
    setProducts((prev) => [product, ...prev])
    try {
      await dbAddProduct(product)
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast("No se pudo guardar el bien. Intente de nuevo.", "error")
    }
  }, [toast])

  const restoreProduct = useCallback(async (p: Product) => {
    setProducts((prev) => [p, ...prev])
    try {
      await dbAddProduct(p)
    } catch {
      setProducts((prev) => prev.filter((prod) => prod.id !== p.id))
      toast("No se pudo restaurar el bien. Intente de nuevo.", "error")
    }
  }, [toast])

  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, "id" | "created_at">>) => {
    const previous = productsRef.current.find((p) => p.id === id)
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    )
    try {
      await dbUpdateProduct(id, updates)
    } catch {
      if (previous) setProducts((prev) => prev.map((p) => (p.id === id ? previous : p)))
      toast("No se pudo actualizar el bien. Intente de nuevo.", "error")
    }
  }, [toast])

  const deleteProduct = useCallback(async (id: string) => {
    const previous = productsRef.current.find((p) => p.id === id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    try {
      await dbDeleteProduct(id)
    } catch {
      if (previous) setProducts((prev) => [previous, ...prev])
      toast("No se pudo eliminar el bien. Intente de nuevo.", "error")
    }
  }, [toast])

  // ── Categorías ─────────────────────────────────────────────

  const addCategory = useCallback(async (data: Omit<Category, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    const category: Category = { ...data, id, created_at: new Date().toISOString() }
    setCategories((prev) => [...prev, category])
    try {
      await dbAddCategory(category)
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast("No se pudo guardar la categoría. Intente de nuevo.", "error")
    }
  }, [toast])

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, "id">>) => {
    const previousCat = categoriesRef.current.find((c) => c.id === id)
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    setProducts((prev) =>
      prev.map((p) =>
        p.categoria_id === id
          ? { ...p, categoria: { ...p.categoria!, ...updates }, updated_at: new Date().toISOString() }
          : p
      )
    )
    try {
      await dbUpdateCategory(id, updates)
    } catch {
      if (previousCat) {
        setCategories((prev) => prev.map((c) => (c.id === id ? previousCat : c)))
        setProducts((prev) =>
          prev.map((p) =>
            p.categoria_id === id
              ? { ...p, categoria: previousCat, updated_at: new Date().toISOString() }
              : p
          )
        )
      }
      toast("No se pudo actualizar la categoría. Intente de nuevo.", "error")
    }
  }, [toast])

  const deleteCategory = useCallback(async (id: string) => {
    const previousCat = categoriesRef.current.find((c) => c.id === id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    try {
      await dbDeleteCategory(id)
    } catch {
      if (previousCat) setCategories((prev) => [...prev, previousCat])
      toast("No se pudo eliminar la categoría. Intente de nuevo.", "error")
    }
  }, [toast])

  // ── Movimientos ────────────────────────────────────────────

  const addMovement = useCallback(async (data: Omit<Movement, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const movement: Movement = { ...data, id, created_at: now }

    setMovements((prev) => [movement, ...prev])
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== data.producto_id) return p
        const stock_actual = data.stock_nuevo
        return { ...p, stock_actual, estado: computeEstado({ ...p, stock_actual }), updated_at: now }
      })
    )
    try {
      await dbAddMovement(movement)
    } catch {
      setMovements((prev) => prev.filter((m) => m.id !== id))
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== data.producto_id) return p
          const stock_actual = data.stock_anterior
          return { ...p, stock_actual, estado: computeEstado({ ...p, stock_actual }), updated_at: now }
        })
      )
      toast("No se pudo registrar el movimiento. Intente de nuevo.", "error")
    }
  }, [toast])

  const deleteMovement = useCallback(async (id: string) => {
    const mov = movementsRef.current.find((m) => m.id === id)
    if (!mov) return

    const restoredStock = mov.stock_anterior
    setMovements((prev) => prev.filter((m) => m.id !== id))
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== mov.producto_id) return p
        return {
          ...p,
          stock_actual: restoredStock,
          estado: computeEstado({ ...p, stock_actual: restoredStock }),
          updated_at: new Date().toISOString(),
        }
      })
    )
    try {
      await dbDeleteMovement(id, mov.producto_id, restoredStock)
    } catch {
      setMovements((prev) => [mov, ...prev])
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== mov.producto_id) return p
          return {
            ...p,
            stock_actual: mov.stock_nuevo,
            estado: computeEstado({ ...p, stock_actual: mov.stock_nuevo }),
            updated_at: new Date().toISOString(),
          }
        })
      )
      toast("No se pudo anular el movimiento. Intente de nuevo.", "error")
    }
  }, [toast])

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
