"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import {
  mockProducts as initialProducts,
  mockCategories as initialCategories,
  mockMovements as initialMovements,
} from "@/lib/mock-data"
import { useToast } from "@/components/ui/toast"
import type { Product, Category, Movement } from "@/lib/types"

const STORAGE_FULL_MESSAGE =
  "No se pudo guardar: el almacenamiento local está lleno. Elimina fotos o bienes para liberar espacio."

const KEYS = {
  products:   "sibim_products",
  categories: "sibim_categories",
  movements:  "sibim_movements",
  profileName: "sibim_profileName",
  avatarUrl:  "sibim_avatarUrl",
}

function resolveProducts(raw: Product[], cats: Category[]): Product[] {
  return raw.map((p) => ({ ...p, categoria: cats.find((c) => c.id === p.categoria_id) }))
}

function resolveMovements(raw: Movement[], prods: Product[]): Movement[] {
  return raw.map((m) => ({ ...m, producto: prods.find((p) => p.id === m.producto_id) }))
}

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return [...fallback]
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T[]
  } catch {}
  return [...fallback]
}

function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// profileName/avatarUrl are stored as plain strings (read back via getItem
// with no JSON.parse), so they skip the JSON.stringify save() does above.
function saveRaw(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>(() => load(KEYS.categories, initialCategories))

  const [products, setProducts] = useState<Product[]>(() => {
    const cats = load<Category>(KEYS.categories, initialCategories)
    const prods = load<Product>(KEYS.products, initialProducts)
    return resolveProducts(prods, cats)
  })

  const [movements, setMovements] = useState<Movement[]>(() => {
    const cats = load<Category>(KEYS.categories, initialCategories)
    const prods = resolveProducts(load<Product>(KEYS.products, initialProducts), cats)
    const movs = load<Movement>(KEYS.movements, initialMovements)
    return resolveMovements(movs, prods)
  })

  const [profileName, setProfileNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(KEYS.profileName)
  })

  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(KEYS.avatarUrl)
  })

  // Persist state changes — surface a toast instead of silently swallowing a
  // QuotaExceededError, since a failed save here means the change is lost on
  // the next reload with no other indication to the user.
  useEffect(() => { if (!save(KEYS.products, products)) toast(STORAGE_FULL_MESSAGE, "error") }, [products, toast])
  useEffect(() => { if (!save(KEYS.categories, categories)) toast(STORAGE_FULL_MESSAGE, "error") }, [categories, toast])
  useEffect(() => { if (!save(KEYS.movements, movements)) toast(STORAGE_FULL_MESSAGE, "error") }, [movements, toast])

  const setProfileName = useCallback((name: string) => {
    setProfileNameState(name)
    if (!saveRaw(KEYS.profileName, name)) toast(STORAGE_FULL_MESSAGE, "error")
  }, [toast])

  const setAvatarUrl = useCallback((url: string | null) => {
    setAvatarUrlState(url)
    if (url) {
      if (!saveRaw(KEYS.avatarUrl, url)) toast(STORAGE_FULL_MESSAGE, "error")
    } else {
      localStorage.removeItem(KEYS.avatarUrl)
    }
  }, [toast])

  const resetData = useCallback(() => {
    localStorage.removeItem(KEYS.products)
    localStorage.removeItem(KEYS.categories)
    localStorage.removeItem(KEYS.movements)
    setCategories([...initialCategories])
    setProducts([...initialProducts])
    setMovements([...initialMovements])
  }, [])

  const addProduct = useCallback((data: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const id = crypto.randomUUID()
    setProducts((prev) => [
      { ...data, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const restoreProduct = useCallback((p: Product) => {
    setProducts((prev) => [p, ...prev])
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, "id" | "created_at">>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    )
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addCategory = useCallback((data: Omit<Category, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    setCategories((prev) => [...prev, { ...data, id, created_at: new Date().toISOString() }])
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
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addMovement = useCallback((data: Omit<Movement, "id" | "created_at">) => {
    const id = crypto.randomUUID()
    setMovements((prev) => [{ ...data, id, created_at: new Date().toISOString() }, ...prev])
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== data.producto_id) return p
        const newStock = data.stock_nuevo
        const estado: Product["estado"] =
          newStock === 0 ? "agotado" : newStock <= p.stock_minimo ? "bajo_stock" : "activo"
        return { ...p, stock_actual: newStock, estado, updated_at: new Date().toISOString() }
      })
    )
  }, [])

  const deleteMovement = useCallback((id: string) => {
    setMovements((prev) => {
      const mov = prev.find((m) => m.id === id)
      if (mov) {
        setProducts((products) =>
          products.map((p) => {
            if (p.id !== mov.producto_id) return p
            const restoredStock = mov.stock_anterior
            const estado: Product["estado"] =
              restoredStock === 0 ? "agotado" : restoredStock <= p.stock_minimo ? "bajo_stock" : "activo"
            return { ...p, stock_actual: restoredStock, estado, updated_at: new Date().toISOString() }
          })
        )
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
