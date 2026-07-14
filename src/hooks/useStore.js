import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// ── PRODUCTS ─────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const addProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        size: product.size,
        description: product.description,
        category: product.category,
        stock: Number(product.stock) || 0,
        image_url: product.image || null,
      }])
      .select()
      .single()
    if (!error && data) setProducts((prev) => [data, ...prev])
    return { data, error }
  }

  const updateProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        size: product.size,
        description: product.description,
        category: product.category,
        stock: Number(product.stock) || 0,
        image_url: product.image_url || product.image || null,
      })
      .eq('id', product.id)
      .select()
      .single()
    if (!error && data) setProducts((prev) => prev.map((p) => p.id === data.id ? data : p))
    return { data, error }
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id))
    return { error }
  }

  return { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct }
}

// ── ORDERS ───────────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const addOrder = async (order) => {
    const newOrder = {
      id: `PG-${Date.now()}`,
      customer: order.customer,
      contact: order.contact,
      method: order.method,
      items: order.items,
      total: order.total,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-NG'),
    }
    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single()
    if (!error && data) setOrders((prev) => [data, ...prev])
    return { data, error }
  }

  const updateOrderStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    return { error }
  }

  return { orders, loading, fetchOrders, addOrder, updateOrderStatus }
}

// ── IMAGE UPLOAD to Supabase Storage ─────────────────────────────
export async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, error }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: urlData.publicUrl, error: null }
}
