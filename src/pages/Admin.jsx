import { useState, useRef } from 'react'
import { useProducts, useOrders, uploadImage } from '../hooks/useStore.js'

const C = {
  crimson: '#8B0000', silver: '#C8C8C8', black: '#080808',
  card: '#0F0F0F', border: '#1E1E1E', borderMid: '#2A2A2A',
  text: '#F0EDE8', muted: '#6A6560',
}

const fmt = (n) => `₦${Number(n).toLocaleString()}`
const ADMIN_PASSWORD = 'pg2026admin'
const CATEGORIES = ['Oud', 'Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Aquatic']
const STATUS_COLORS = {
  Pending:   { color: '#C9A84C', bg: '#1A1500' },
  Confirmed: { color: '#6DBF6D', bg: '#0A1A0A' },
  Shipped:   { color: '#4A8FBF', bg: '#0A121A' },
  Delivered: { color: '#6A6560', bg: '#141414' },
}
const EMPTY_PRODUCT = { name: '', brand: 'PG EXCLUSIVE', price: '', size: '', description: '', category: 'Oud', stock: '', image_url: '' }

const Label = ({ children }) => (
  <label style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>{children}</label>
)
const Field = ({ value, onChange, placeholder, type = 'text' }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.65rem 0.9rem', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />
)
const DropSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.65rem 0.9rem', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
)

const UploadZone = ({ preview, existingImage, onFile, fileRef, uploading }) => {
  const [dragging, setDragging] = useState(false)
  const display = preview || existingImage
  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
        style={{ border: `2px dashed ${dragging ? C.crimson : C.borderMid}`, background: dragging ? '#1A0000' : '#141414', cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.2s', overflow: 'hidden', padding: display ? '0' : '1.5rem', textAlign: display ? undefined : 'center' }}
      >
        {uploading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: C.crimson, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Uploading to storage…</p>
          </div>
        ) : display ? (
          <div style={{ position: 'relative' }}>
            <img src={display} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', filter: 'saturate(0.85)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.5rem', fontSize: '0.65rem', color: C.crimson, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Click or drop to replace</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2rem', color: C.borderMid, marginBottom: '0.5rem' }}>↑</div>
            <p style={{ fontSize: '0.72rem', color: C.muted, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Click or drag & drop to upload</p>
            <p style={{ fontSize: '0.65rem', color: '#3A3530', marginTop: '0.4rem', fontFamily: 'Inter, sans-serif' }}>JPG, PNG, WEBP — any size</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files[0])} />
    </div>
  )
}

export default function Admin() {
  const { products, loading: prodLoading, addProduct, updateProduct, deleteProduct } = useProducts()
  const { orders, loading: ordLoading, updateOrderStatus } = useOrders()

  const [authed, setAuthed]             = useState(false)
  const [pass, setPass]                 = useState('')
  const [passError, setPassError]       = useState(false)
  const [tab, setTab]                   = useState('dashboard')
  const [newProd, setNewProd]           = useState(EMPTY_PRODUCT)
  const [newPreview, setNewPreview]     = useState(null)
  const [newUploading, setNewUploading] = useState(false)
  const [editProd, setEditProd]         = useState(null)
  const [editPreview, setEditPreview]   = useState(null)
  const [editUploading, setEditUploading] = useState(false)
  const [confirmDel, setConfirmDel]     = useState(null)
  const [toast, setToast]               = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [saving, setSaving]             = useState(false)

  const newFileRef  = useRef(null)
  const editFileRef = useRef(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const login = () => {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setPassError(false) }
    else setPassError(true)
  }

  const handleNewImageUpload = async (file) => {
    if (!file) return
    setNewUploading(true)
    const { url, error } = await uploadImage(file)
    if (error) { showToast('Image upload failed. Try again.', 'error') }
    else { setNewProd((p) => ({ ...p, image_url: url })); setNewPreview(url) }
    setNewUploading(false)
  }

  const handleEditImageUpload = async (file) => {
    if (!file) return
    setEditUploading(true)
    const { url, error } = await uploadImage(file)
    if (error) { showToast('Image upload failed. Try again.', 'error') }
    else { setEditProd((p) => ({ ...p, image_url: url })); setEditPreview(url) }
    setEditUploading(false)
  }

  const submitNewProduct = async () => {
    if (!newProd.name.trim()) return showToast('Product name is required.', 'error')
    if (!newProd.price)       return showToast('Price is required.', 'error')
    setSaving(true)
    const { error } = await addProduct({ ...newProd, image: newProd.image_url })
    if (error) showToast('Failed to add product. Try again.', 'error')
    else {
      showToast('Product added successfully.')
      setNewProd(EMPTY_PRODUCT)
      setNewPreview(null)
      if (newFileRef.current) newFileRef.current.value = ''
    }
    setSaving(false)
  }

  const submitEditProduct = async () => {
    if (!editProd.name.trim()) return showToast('Product name is required.', 'error')
    setSaving(true)
    const { error } = await updateProduct(editProd)
    if (error) showToast('Failed to update product.', 'error')
    else { showToast('Product updated.'); setEditProd(null); setEditPreview(null) }
    setSaving(false)
  }

  const confirmDelete = async (id) => {
    const { error } = await deleteProduct(id)
    if (error) showToast('Failed to delete.', 'error')
    else showToast('Product deleted.')
    setConfirmDel(null)
  }

  const revenue        = orders.reduce((s, o) => s + o.total, 0)
  const filteredOrders = filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus)

  const thStyle = { textAlign: 'left', padding: '0.65rem 1rem', fontSize: '0.6rem', letterSpacing: '0.18em', color: C.crimson, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, fontWeight: 400 }
  const tdStyle = { padding: '0.8rem 1rem', borderBottom: `1px solid ${C.border}`, color: C.muted, verticalAlign: 'middle' }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.black }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: '2.5rem', width: '100%', maxWidth: 360, textAlign: 'center' }}>
          <img src="/pg_logo_dark.png" alt="Perfume Gallery" style={{ height: 60, margin: '0 auto 1.5rem' }} />
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: C.crimson, marginBottom: '2rem', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Admin Dashboard</p>
          <Label>Password</Label>
          <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setPassError(false) }} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="••••••••"
            style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${passError ? C.crimson : C.borderMid}`, color: C.text, padding: '0.75rem 1rem', fontSize: '0.9rem', textAlign: 'center', letterSpacing: '0.2em', outline: 'none', marginBottom: '0.8rem', boxSizing: 'border-box' }} />
          {passError && <p style={{ color: '#E24B4A', fontSize: '0.72rem', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Incorrect password.</p>}
          <button onClick={login} style={{ width: '100%', background: C.crimson, color: C.text, border: 'none', padding: '0.85rem', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#0A1A0A' : '#1A0A0A', border: `1px solid ${toast.type === 'success' ? '#2D5A2D' : '#5A2D2D'}`, color: toast.type === 'success' ? '#6DBF6D' : '#E24B4A', padding: '0.85rem 1.5rem', zIndex: 999, fontSize: '0.78rem', letterSpacing: '0.08em', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/pg_logo_dark.png" alt="Perfume Gallery" style={{ height: 32 }} />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.crimson, textTransform: 'uppercase', border: '1px solid #3A0000', padding: '0.2rem 0.6rem' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ background: 'none', border: `1px solid ${C.borderMid}`, color: C.silver, padding: '0.45rem 1.1rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>View Store ↗</a>
          <button onClick={() => setAuthed(false)} style={{ background: '#2A0000', color: '#E24B4A', border: '1px solid #3A0000', padding: '0.45rem 1.1rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>Log out</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 53px)' }}>
        <aside style={{ background: '#0A0A0A', borderRight: `1px solid ${C.border}`, paddingTop: '1.5rem' }}>
          {[['dashboard', 'Dashboard'], ['products', 'Products'], ['orders', 'Orders']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ display: 'block', padding: '0.75rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: tab === key ? C.silver : C.muted, cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', borderLeft: `2px solid ${tab === key ? C.crimson : 'transparent'}` }}>{label}</button>
          ))}
        </aside>

        <main style={{ padding: '2rem', overflowY: 'auto' }}>

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', marginBottom: '2rem' }}>Dashboard Overview</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: C.border, marginBottom: '2rem' }}>
                {[['Products', products.length, 'in catalogue'], ['Orders', orders.length, 'total received'], ['Revenue', fmt(revenue), 'from all orders'], ['Pending', orders.filter((o) => o.status === 'Pending').length, 'awaiting confirmation']].map(([label, val, sub]) => (
                  <div key={label} style={{ background: C.card, padding: '1.2rem 1.5rem' }}>
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: C.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
                    <p style={{ fontSize: '1.8rem', color: C.silver, fontWeight: 300, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{val}</p>
                    <p style={{ fontSize: '0.65rem', color: C.crimson, marginTop: '0.2rem' }}>{sub}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: '1rem' }}>Recent Orders</p>
              {ordLoading ? <p style={{ color: C.muted, padding: '1rem' }}>Loading orders…</p> : orders.length === 0 ? (
                <p style={{ color: C.muted, fontSize: '0.85rem', padding: '2rem', textAlign: 'center', border: `1px solid ${C.border}` }}>No orders yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead><tr>{['Order ID', 'Customer', 'Contact', 'Total', 'Status'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.slice(0, 10).map((o) => {
                      const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending
                      return (
                        <tr key={o.id}>
                          <td style={{ ...tdStyle, color: C.crimson, fontSize: '0.72rem' }}>{o.id}</td>
                          <td style={{ ...tdStyle, color: C.text }}>{o.customer}</td>
                          <td style={tdStyle}>{o.contact}</td>
                          <td style={{ ...tdStyle, color: C.silver }}>{fmt(o.total)}</td>
                          <td style={tdStyle}><span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', fontSize: '0.6rem', letterSpacing: '0.1em', color: sc.color, background: sc.bg, textTransform: 'uppercase' }}>{o.status}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', marginBottom: '2rem' }}>Manage Products</p>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: '1.5rem', marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: '1.2rem' }}>Add New Product</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div><Label>Product Name *</Label><Field value={newProd.name} onChange={(e) => setNewProd((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Oud Noir" /></div>
                  <div><Label>Brand</Label><Field value={newProd.brand} onChange={(e) => setNewProd((p) => ({ ...p, brand: e.target.value }))} /></div>
                  <div><Label>Price (₦) *</Label><Field type="number" value={newProd.price} onChange={(e) => setNewProd((p) => ({ ...p, price: e.target.value }))} placeholder="e.g. 45000" /></div>
                  <div><Label>Size</Label><Field value={newProd.size} onChange={(e) => setNewProd((p) => ({ ...p, size: e.target.value }))} placeholder="e.g. 100ml" /></div>
                  <div><Label>Stock Quantity</Label><Field type="number" value={newProd.stock} onChange={(e) => setNewProd((p) => ({ ...p, stock: e.target.value }))} placeholder="e.g. 10" /></div>
                  <div><Label>Category</Label><DropSelect value={newProd.category} onChange={(e) => setNewProd((p) => ({ ...p, category: e.target.value }))} options={CATEGORIES} /></div>
                </div>
                <Label>Description</Label>
                <textarea value={newProd.description} onChange={(e) => setNewProd((p) => ({ ...p, description: e.target.value }))} style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.65rem 0.9rem', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box', height: 72, resize: 'vertical' }} />
                <Label>Product Image (any size — uploaded to cloud)</Label>
                <UploadZone preview={newPreview} existingImage={null} onFile={handleNewImageUpload} fileRef={newFileRef} uploading={newUploading} />
                <button onClick={submitNewProduct} disabled={saving || newUploading} style={{ background: saving ? '#4A0000' : C.crimson, color: C.text, border: 'none', padding: '0.65rem 1.8rem', fontSize: '0.68rem', letterSpacing: '0.15em', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>
                  {saving ? 'Saving…' : 'Add Product'}
                </button>
              </div>

              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: '1rem' }}>All Products ({products.length})</p>
              {prodLoading ? <p style={{ color: C.muted, padding: '1rem' }}>Loading products…</p> : products.length === 0 ? (
                <p style={{ color: C.muted, padding: '2rem', textAlign: 'center', border: `1px solid ${C.border}` }}>No products yet. Add one above.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead><tr>{['Image', 'Name', 'Category', 'Size', 'Price', 'Stock', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td style={tdStyle}><img src={p.image_url || '/pg_logo_dark.png'} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', filter: 'saturate(0.7)', display: 'block' }} /></td>
                        <td style={{ ...tdStyle, color: C.text }}>{p.name}</td>
                        <td style={tdStyle}>{p.category}</td>
                        <td style={tdStyle}>{p.size}</td>
                        <td style={{ ...tdStyle, color: C.silver }}>{fmt(p.price)}</td>
                        <td style={{ ...tdStyle, color: p.stock < 5 ? '#E24B4A' : C.muted }}>{p.stock}</td>
                        <td style={tdStyle}>
                          <button onClick={() => { setEditProd({ ...p }); setEditPreview(null) }} style={{ background: '#0A1A2A', color: '#4A8FBF', border: '1px solid #1A3A5A', padding: '0.35rem 0.9rem', fontSize: '0.6rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', marginRight: '0.5rem' }}>Edit</button>
                          <button onClick={() => setConfirmDel(p.id)} style={{ background: '#2A0000', color: '#E24B4A', border: '1px solid #3A0000', padding: '0.35rem 0.9rem', fontSize: '0.6rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', marginBottom: '1.5rem' }}>All Orders</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map((st) => (
                  <button key={st} onClick={() => setFilterStatus(st)} style={{ background: filterStatus === st ? '#1A0000' : 'transparent', color: filterStatus === st ? C.silver : C.muted, border: `1px solid ${filterStatus === st ? C.crimson : C.borderMid}`, padding: '0.4rem 1rem', fontSize: '0.62rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>{st}</button>
                ))}
              </div>
              {ordLoading ? <p style={{ color: C.muted, padding: '1rem' }}>Loading orders…</p> : filteredOrders.length === 0 ? (
                <p style={{ color: C.muted, padding: '2rem', textAlign: 'center', border: `1px solid ${C.border}` }}>No orders in this category.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead><tr>{['Order ID', 'Date', 'Customer', 'Contact', 'Payment', 'Items', 'Total', 'Status', 'Update'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredOrders.map((o) => {
                      const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending
                      return (
                        <tr key={o.id}>
                          <td style={{ ...tdStyle, color: C.crimson, fontSize: '0.72rem' }}>{o.id}</td>
                          <td style={tdStyle}>{o.date}</td>
                          <td style={{ ...tdStyle, color: C.text }}>{o.customer}</td>
                          <td style={tdStyle}>{o.contact}</td>
                          <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{o.method}</td>
                          <td style={tdStyle}>{Array.isArray(o.items) ? o.items.reduce((s, i) => s + i.qty, 0) : 0}</td>
                          <td style={{ ...tdStyle, color: C.silver }}>{fmt(o.total)}</td>
                          <td style={tdStyle}><span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', fontSize: '0.6rem', letterSpacing: '0.1em', color: sc.color, background: sc.bg, textTransform: 'uppercase' }}>{o.status}</span></td>
                          <td style={tdStyle}>
                            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} style={{ background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.3rem 0.5rem', fontSize: '0.72rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                              {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </main>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <>
          <div onClick={() => setConfirmDel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 290 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
            <div style={{ background: '#0F0F0F', border: `1px solid ${C.borderMid}`, padding: '2rem', width: '100%', maxWidth: 380 }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: C.crimson, textTransform: 'uppercase', marginBottom: '1rem' }}>Confirm Delete</p>
              <p style={{ color: C.muted, fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>This will permanently remove the product.</p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => confirmDelete(confirmDel)} style={{ background: '#2A0000', color: '#E24B4A', border: '1px solid #3A0000', padding: '0.65rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>Delete</button>
                <button onClick={() => setConfirmDel(null)} style={{ background: 'none', color: C.silver, border: `1px solid ${C.borderMid}`, padding: '0.65rem 1.5rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit product */}
      {editProd && (
        <>
          <div onClick={() => { setEditProd(null); setEditPreview(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 290 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
            <div style={{ background: '#0F0F0F', border: `1px solid ${C.borderMid}`, padding: '2rem', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: C.crimson, textTransform: 'uppercase', marginBottom: '1.5rem' }}>Edit Product</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div><Label>Product Name *</Label><Field value={editProd.name} onChange={(e) => setEditProd((p) => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Brand</Label><Field value={editProd.brand} onChange={(e) => setEditProd((p) => ({ ...p, brand: e.target.value }))} /></div>
                <div><Label>Price (₦)</Label><Field type="number" value={editProd.price} onChange={(e) => setEditProd((p) => ({ ...p, price: e.target.value }))} /></div>
                <div><Label>Size</Label><Field value={editProd.size} onChange={(e) => setEditProd((p) => ({ ...p, size: e.target.value }))} /></div>
                <div><Label>Stock</Label><Field type="number" value={editProd.stock} onChange={(e) => setEditProd((p) => ({ ...p, stock: e.target.value }))} /></div>
                <div><Label>Category</Label><DropSelect value={editProd.category} onChange={(e) => setEditProd((p) => ({ ...p, category: e.target.value }))} options={CATEGORIES} /></div>
              </div>
              <Label>Description</Label>
              <textarea value={editProd.description} onChange={(e) => setEditProd((p) => ({ ...p, description: e.target.value }))} style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.65rem 0.9rem', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box', height: 72, resize: 'vertical' }} />
              <Label>Product Image (any size)</Label>
              <UploadZone preview={editPreview} existingImage={editProd.image_url} onFile={handleEditImageUpload} fileRef={editFileRef} uploading={editUploading} />
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button onClick={submitEditProduct} disabled={saving || editUploading} style={{ background: saving ? '#4A0000' : C.crimson, color: C.text, border: 'none', padding: '0.65rem 1.8rem', fontSize: '0.68rem', letterSpacing: '0.15em', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                <button onClick={() => { setEditProd(null); setEditPreview(null) }} style={{ background: 'none', color: C.silver, border: `1px solid ${C.borderMid}`, padding: '0.65rem 1.5rem', fontSize: '0.68rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
