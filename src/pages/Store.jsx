import { useState } from 'react'
import { useProducts, useOrders } from '../hooks/useStore.js'

const C = {
  crimson: '#8B0000',
  crimsonHover: '#A50000',
  silver: '#C8C8C8',
  black: '#0A0A0A',
  card: '#0F0F0F',
  border: '#1E1E1E',
  borderMid: '#2A2A2A',
  text: '#F0EDE8',
  muted: '#6A6560',
}

const fmt = (n) => `₦${Number(n).toLocaleString()}`

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Store() {
  const { products, loading: productsLoading } = useProducts()
  const { addOrder } = useOrders()

  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [filterCat, setFilterCat] = useState('All')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [buyNowProduct, setBuyNowProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', method: 'paystack' })
  const [formError, setFormError] = useState('')

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]
  const filtered = filterCat === 'All' ? products : products.filter((p) => p.category === filterCat)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id)
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      return [...c, { ...p, qty: 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id))
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const placeOrder = async () => {
    if (!form.name.trim()) return setFormError('Please enter your name.')
    if (!form.contact.trim()) return setFormError('Please enter your phone number or email.')
    setFormError('')
    const items = buyNowProduct ? [{ ...buyNowProduct, qty: 1 }] : cart
    const total = buyNowProduct ? buyNowProduct.price : cartTotal
    const { error } = await addOrder({ customer: form.name, contact: form.contact, method: form.method, items, total })
    if (error) return setFormError('Failed to place order. Please try again.')
    setCart([])
    setCheckoutOpen(false)
    setBuyNowProduct(null)
    setOrderSuccess(true)
    setForm({ name: '', contact: '', method: 'paystack' })
    setTimeout(() => setOrderSuccess(false), 5000)
  }

  const openBuyNow = (p) => {
    setBuyNowProduct(p)
    setCheckoutOpen(true)
    setSelectedProduct(null)
  }

  const checkoutItems = buyNowProduct ? [{ ...buyNowProduct, qty: 1 }] : cart
  const checkoutTotal = buyNowProduct ? buyNowProduct.price : cartTotal

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.text, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* Success toast */}
      {orderSuccess && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#0A1A0A', border: '1px solid #2D5A2D', color: '#6DBF6D', padding: '1rem 2rem', zIndex: 999, fontSize: '0.85rem', letterSpacing: '0.08em', whiteSpace: 'nowrap', animation: 'fadeIn 0.3s ease' }}>
          ✓ Order placed! We'll contact you shortly to confirm.
        </div>
      )}

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 2rem', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: 'rgba(10,10,10,0.97)', zIndex: 100, gap: '1rem' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img src="/pg_logo_dark.png" alt="Perfume Gallery" style={{ height: 36, objectFit: 'contain' }} />
        </a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setFilterCat(c); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}
              style={{ background: 'none', border: 'none', color: filterCat === c ? C.silver : C.muted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '0.2rem 0' }}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCartOpen(true)}
          style={{ background: 'none', border: `1px solid ${C.crimson}`, color: C.silver, padding: '0.45rem 1.1rem', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
        >
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </button>
      </nav>

      {/* TICKER */}
      <div style={{ background: '#0D0000', padding: '0.55rem 0', overflow: 'hidden', borderBottom: '1px solid #1A0000' }}>
        <span style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'ticker 22s linear infinite', fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, fontFamily: 'Inter, sans-serif' }}>
          OUD · AMBER · JASMINE · VETIVER · ROSE · MUSK · SAFFRON · CEDAR · BERGAMOT · NEROLI · PATCHOULI · LABDANUM · OUD · AMBER · JASMINE · VETIVER · ROSE · MUSK · SAFFRON · CEDAR · BERGAMOT · NEROLI · PATCHOULI · LABDANUM ·&nbsp;
        </span>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '6rem 2rem 5rem', borderBottom: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, #1A0000 0%, #0A0A0A 70%)', opacity: 0.6 }} />
        <img src="/pg_logo_light.png" alt="" style={{ height: 80, margin: '0 auto 2rem', opacity: 0.85, position: 'relative' }} />
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.45em', color: C.crimson, marginBottom: '1.5rem', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', position: 'relative' }}>The Art of Scent</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', fontWeight: 300, letterSpacing: '0.06em', marginBottom: '1rem', lineHeight: 1.1, position: 'relative' }}>
          Wear What <span style={{ color: C.crimson }}>Cannot Be Forgotten</span>
        </h1>
        <p style={{ color: C.muted, fontSize: '1rem', letterSpacing: '0.05em', maxWidth: 440, margin: '0 auto 2.5rem', lineHeight: 1.7, position: 'relative', fontWeight: 300 }}>
          Curated fragrances for those who leave a mark. Each bottle, a story told in scent.
        </p>
        <button
          className="btn-crimson"
          onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ background: C.crimson, color: C.text, border: 'none', padding: '0.9rem 2.8rem', fontSize: '0.72rem', letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', position: 'relative' }}
        >
          Shop the Collection
        </button>
      </div>

      {/* SHOP GRID */}
      <div id="shop" style={{ padding: '3.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', marginBottom: '0.8rem', fontFamily: 'Inter, sans-serif' }}>Our Collection</p>
          <div style={{ width: 40, height: 1, background: C.crimson, margin: '0 auto' }} />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              style={{ background: filterCat === c ? C.crimson : 'transparent', color: filterCat === c ? C.text : C.muted, border: `1px solid ${filterCat === c ? C.crimson : C.borderMid}`, padding: '0.45rem 1.2rem', fontSize: '0.65rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        {productsLoading ? (
          <p style={{ textAlign: 'center', color: C.muted, padding: '3rem', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Loading collection…</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: C.muted, padding: '3rem' }}>No products in this category yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1px', background: C.border, maxWidth: 1140, margin: '0 auto' }}>
            {filtered.map((p) => (
              <div key={p.id} className="pg-card" style={{ background: C.card }}>
                <img
                  src={p.image_url || '/pg_logo_dark.png'}
                  alt={p.name}
                  onClick={() => setSelectedProduct(p)}
                  style={{ width: '100%', height: 280, objectFit: 'cover', filter: 'saturate(0.7) brightness(0.85)', cursor: 'pointer', transition: 'filter 0.3s' }}
                />
                <div style={{ padding: '1.3rem' }}>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: C.crimson, textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'Inter, sans-serif' }}>{p.category} · {p.size}</p>
                  <p style={{ fontSize: '1.1rem', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 400 }}>{p.name}</p>
                  <p style={{ fontSize: '0.78rem', color: C.muted, marginBottom: '1rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.1rem', color: C.silver }}>{fmt(p.price)}</span>
                    <span style={{ fontSize: '0.62rem', color: p.stock < 5 ? '#A05030' : C.muted, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>
                      {p.stock < 5 ? `Only ${p.stock} left` : 'In stock'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-crimson" onClick={() => openBuyNow(p)} style={{ flex: 1, background: C.crimson, color: C.text, border: 'none', padding: '0.65rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Buy Now</button>
                    <button className="btn-outline" onClick={() => addToCart(p)} style={{ flex: 1, background: 'none', color: C.silver, border: `1px solid ${C.borderMid}`, padding: '0.65rem', fontSize: '0.65rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: '#0D0000', borderTop: '1px solid #1A0000', borderBottom: '1px solid #1A0000', padding: '3.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>How it works</p>
          <div style={{ width: 40, height: 1, background: C.crimson, margin: '0.8rem auto 0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          {[['01', 'Pick your scent', 'Browse, filter, and view details on every fragrance.'], ['02', 'Enter your details', 'Just your name and phone or email.'], ['03', 'Pay securely', 'Paystack, Flutterwave, or OPay.'], ['04', 'We confirm', "You'll hear from us to arrange delivery."]].map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: 'center', maxWidth: 180 }}>
              <span style={{ fontSize: '2rem', color: C.crimson, fontWeight: 300, display: 'block', marginBottom: '0.5rem' }}>{num}</span>
              <p style={{ fontSize: '0.88rem', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{title}</p>
              <p style={{ fontSize: '0.75rem', color: C.muted, lineHeight: 1.6, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <img src="/pg_logo_dark.png" alt="Perfume Gallery" style={{ height: 30, opacity: 0.7 }} />
        <p style={{ color: C.muted, fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>© {new Date().getFullYear()} Perfume Gallery. All rights reserved.</p>
        <p style={{ color: C.muted, fontSize: '0.7rem', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Curated scents. Premium quality.</p>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 150 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: 380, height: '100vh', background: '#0D0D0D', borderLeft: `1px solid ${C.borderMid}`, zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.silver, fontFamily: 'Inter, sans-serif' }}>Your Cart ({cartCount})</span>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p style={{ padding: '2rem', color: C.muted, textAlign: 'center', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>Your cart is empty.</p>
              ) : cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1.2rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
                  <img src={item.image_url || '/pg_logo_dark.png'} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', filter: 'saturate(0.6)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: C.silver, marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>{fmt(item.price)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: 'none', border: `1px solid ${C.borderMid}`, color: C.text, width: 24, height: 24, cursor: 'pointer', fontSize: '0.9rem' }}>−</button>
                      <span style={{ fontSize: '0.82rem', minWidth: 20, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: 'none', border: `1px solid ${C.borderMid}`, color: C.text, width: 24, height: 24, cursor: 'pointer', fontSize: '0.9rem' }}>+</button>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.7rem', cursor: 'pointer', marginLeft: '0.3rem', fontFamily: 'Inter, sans-serif' }}>Remove</button>
                    </div>
                  </div>
                  <span style={{ color: C.silver, fontSize: '0.9rem' }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: C.muted, fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>TOTAL</span>
                  <span style={{ color: C.silver, fontSize: '1.05rem' }}>{fmt(cartTotal)}</span>
                </div>
                <button className="btn-crimson" onClick={() => { setCartOpen(false); setBuyNowProduct(null); setCheckoutOpen(true) }} style={{ width: '100%', background: C.crimson, color: C.text, border: 'none', padding: '0.85rem', fontSize: '0.72rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
                  Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 250 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 260, padding: '1rem' }}>
            <div style={{ background: '#0F0F0F', border: `1px solid ${C.borderMid}`, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', display: 'flex' }}>
              <img src={selectedProduct.image_url || '/pg_logo_dark.png'} alt={selectedProduct.name} style={{ width: '45%', objectFit: 'cover', flexShrink: 0, filter: 'saturate(0.8)' }} />
              <div style={{ padding: '2rem', flex: 1 }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: C.crimson, marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{selectedProduct.category}</p>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontWeight: 300 }}>{selectedProduct.name}</h2>
                <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>{selectedProduct.size} · {selectedProduct.brand}</p>
                <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.7, marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{selectedProduct.description}</p>
                <p style={{ fontSize: '1.4rem', color: C.silver, marginBottom: '2rem' }}>{fmt(selectedProduct.price)}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button className="btn-crimson" onClick={() => openBuyNow(selectedProduct)} style={{ flex: 1, background: C.crimson, color: C.text, border: 'none', padding: '0.8rem', fontSize: '0.68rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Buy Now</button>
                  <button className="btn-outline" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }} style={{ flex: 1, background: 'none', color: C.silver, border: `1px solid ${C.borderMid}`, padding: '0.8rem', fontSize: '0.68rem', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Add to Cart</button>
                </div>
                <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>← Close</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <>
          <div onClick={() => { setCheckoutOpen(false); setBuyNowProduct(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 270 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 280, padding: '1rem' }}>
            <div style={{ background: '#0F0F0F', border: `1px solid ${C.borderMid}`, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: C.crimson, textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' }}>Complete your order</p>

              <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>Full Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your full name" style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.75rem 1rem', fontSize: '0.9rem', marginBottom: '1.2rem', outline: 'none', boxSizing: 'border-box' }} />

              <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>Phone Number or Email</label>
              <input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} placeholder="+234... or your@email.com" style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${C.borderMid}`, color: C.text, padding: '0.75rem 1rem', fontSize: '0.9rem', marginBottom: '1.2rem', outline: 'none', boxSizing: 'border-box' }} />

              <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block', fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['paystack', 'flutterwave', 'opay'].map((m) => (
                  <button key={m} onClick={() => setForm((f) => ({ ...f, method: m }))} style={{ flex: 1, padding: '0.6rem', background: form.method === m ? '#1A0000' : '#1A1A1A', color: form.method === m ? C.silver : C.muted, border: `1px solid ${form.method === m ? C.crimson : C.border}`, cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{m}</button>
                ))}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                {checkoutItems.map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: `1px solid ${C.border}`, color: C.muted, fontFamily: 'Inter, sans-serif' }}>
                    <span>{i.name} × {i.qty}</span>
                    <span>{fmt(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: C.muted, fontFamily: 'Inter, sans-serif' }}>TOTAL</span>
                <span style={{ color: C.silver, fontSize: '1.1rem' }}>{fmt(checkoutTotal)}</span>
              </div>

              {formError && <p style={{ color: '#E24B4A', fontSize: '0.78rem', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>{formError}</p>}

              <button className="btn-crimson" onClick={placeOrder} style={{ width: '100%', background: C.crimson, color: C.text, border: 'none', padding: '0.9rem', fontSize: '0.75rem', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Place Order — {fmt(checkoutTotal)}
              </button>
              <button onClick={() => { setCheckoutOpen(false); setBuyNowProduct(null) }} style={{ width: '100%', background: 'none', border: 'none', color: C.muted, fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
