import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, CreditCard, Heart, Instagram, Menu, Minus, Package, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Truck, X } from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  blurb: string;
  description: string;
  color: string;
  accent: string;
  tag?: string;
  stock: number;
};
type CartItem = { productId: string; quantity: number };

const queryClient = new QueryClient();
const money = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const productCatalog: Product[] = [
  { id: 'aero-01', name: 'Aero Headphones', category: 'Technology', price: 289, blurb: 'Quiet, considered sound.', description: 'A sculptural listening instrument with adaptive silence, featherweight memory foam, and a finish that feels at home anywhere.', color: 'linear-gradient(135deg,#111125 0%,#393375 54%,#b7a2ff 100%)', accent: '#cfc3ff', tag: 'New arrival', stock: 12 },
  { id: 'atlas-02', name: 'Atlas Carryall', category: 'Travel', price: 198, blurb: 'A better way to move.', description: 'A soft-structured carryall cut from recycled technical canvas, with considered pockets for the things you never leave behind.', color: 'linear-gradient(135deg,#242837 0%,#717b91 48%,#ded5c6 100%)', accent: '#e2d2b7', tag: 'Aurelia essential', stock: 8 },
  { id: 'halo-03', name: 'Halo Lamp', category: 'Home', price: 164, blurb: 'Light, with a point of view.', description: 'A low, ambient glow for late hours. Halo shifts from cool morning light to a warm evening pool with one touch.', color: 'linear-gradient(145deg,#37305f,#a28be1 45%,#f2cf9d)', accent: '#f2cf9d', stock: 5 },
  { id: 'arc-04', name: 'Arc Charger', category: 'Technology', price: 79, blurb: 'Power without the noise.', description: 'A weighted aluminum charging dock that disappears into your desk and keeps the essentials within reach.', color: 'linear-gradient(145deg,#1b1d2f,#596178 46%,#d3d8df)', accent: '#d3d8df', stock: 21 },
  { id: 'fold-05', name: 'Fold Wallet', category: 'Everyday carry', price: 92, blurb: 'The elegant minimum.', description: 'A slim, beautifully balanced wallet in vegetable-tanned leather. Six cards, one quiet signature.', color: 'linear-gradient(145deg,#372d49,#815e7e 54%,#d7b7c7)', accent: '#d7b7c7', tag: 'Low stock', stock: 3 },
  { id: 'orbit-06', name: 'Orbit Speaker', category: 'Technology', price: 246, blurb: 'Small object. Big atmosphere.', description: 'Room-filling sound in a soft geometric form. Designed to sit in plain sight, tuned to disappear into the room.', color: 'linear-gradient(135deg,#0e2230,#3e7381 45%,#d4a77b)', accent: '#d4a77b', stock: 14 },
  { id: 'line-07', name: 'Line Notebook', category: 'Everyday carry', price: 34, blurb: 'For the thoughts worth keeping.', description: '120 pages of warm ivory paper, a lay-flat spine, and a cover designed to age with your ideas.', color: 'linear-gradient(145deg,#30353a,#8a918a 48%,#d8c8a6)', accent: '#d8c8a6', stock: 35 },
  { id: 'drift-08', name: 'Drift Weekender', category: 'Travel', price: 228, blurb: 'Leave room for the unexpected.', description: 'A generous weekender with an architectural silhouette and a calm interior. Made for departures without a checklist.', color: 'linear-gradient(135deg,#222139,#554f81 48%,#bdadd2)', accent: '#bdadd2', stock: 7 },
];
const categories = ['All objects', 'Technology', 'Travel', 'Home', 'Everyday carry'];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function Art({ product, className = '' }: { product: Product; className?: string }) {
  return <div className={`product-art ${className}`} style={{ background: product.color }} aria-label={`${product.name} product visual`} data-testid={`art-product-${product.id}`}>
    <div className="art-orbit" style={{ borderColor: `${product.accent}66` }} />
    <div className="art-object" style={{ background: `linear-gradient(145deg, ${product.accent}cc, ${product.color.includes('#') ? '#211d3b' : '#26213f'})` }} />
    <span className="art-mark">A</span>
  </div>;
}

function Button({ children, onClick, className = '', disabled = false, type = 'button', variant = 'dark', testId }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean; type?: 'button' | 'submit'; variant?: 'dark' | 'light' | 'outline' | 'accent'; testId?: string }) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`a-btn a-btn-${variant} ${className}`}>{children}</button>;
}

function Header({ cartCount }: { cartCount: number }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = (path: string) => { setMenuOpen(false); setLocation(path); };
  return <header className="site-header">
    <div className="topline"><span>Complimentary delivery on orders over $150</span><span className="topline-right">Worldwide dispatch <span className="topline-dot" /> USD / EN <ChevronDown size={12} /></span></div>
    <div className="nav-wrap">
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" data-testid="button-toggle-menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Link href="/" className="wordmark" data-testid="link-home">AURELIA<span className="wordmark-dot">.</span></Link>
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} data-testid="navigation-main">
        <Link href="/shop" onClick={() => setMenuOpen(false)} className={location === '/shop' ? 'active' : ''} data-testid="link-shop">Shop</Link>
        <Link href="/shop?category=New" onClick={() => setMenuOpen(false)} data-testid="link-new">New in</Link>
        <Link href="/shop?category=Journal" onClick={() => setMenuOpen(false)} data-testid="link-journal">Journal</Link>
      </nav>
      <div className="header-actions">
        <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search" className="icon-button" data-testid="button-open-search"><Search size={18} /></button>
        <Link href="/login" aria-label="Account" className="icon-button account-icon" data-testid="link-account"><CircleUserRound size={18} /></Link>
        <Link href="/cart" aria-label="Shopping bag" className="bag-button" data-testid="link-cart"><ShoppingBag size={18} /><span>{cartCount}</span></Link>
      </div>
    </div>
    {searchOpen && <form className="search-drawer" onSubmit={(e) => { e.preventDefault(); setSearchOpen(false); setLocation(`/shop?search=${encodeURIComponent(search)}`); }}><Search size={18} /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search objects, materials, places…" data-testid="input-global-search" /><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button></form>}
  </header>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div><Link href="/" className="wordmark light">AURELIA<span className="wordmark-dot">.</span></Link><p className="footer-note">Fewer, better objects<br />for a life in motion.</p><div className="socials"><a href="https://instagram.com" aria-label="Instagram" data-testid="link-instagram"><Instagram size={16} /></a><span>New York · London · Tokyo</span></div></div><div className="footer-links"><div><p className="eyebrow">Explore</p><Link href="/shop">All objects</Link><Link href="/shop?category=Technology">Technology</Link><Link href="/shop?category=Travel">Travel</Link></div><div><p className="eyebrow">Aurelia</p><Link href="/dashboard">Your account</Link><Link href="/shop">Our journal</Link><a href="mailto:hello@aurelia.example">Contact us</a></div></div><div className="newsletter"><p className="eyebrow">The good edit</p><h3>A considered note,<br /><em>occasionally.</em></h3><form onSubmit={(e) => { e.preventDefault(); (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value = ''; }}><input name="email" type="email" required placeholder="Your email address" data-testid="input-newsletter" /><button type="submit" aria-label="Subscribe" data-testid="button-subscribe"><ArrowUpRight size={18} /></button></form></div></div><div className="footer-bottom"><span>© 2025 Aurelia Objects</span><span>Privacy · Terms · Accessibility</span><span className="mono">EST. 2025 / 01</span></div></footer>;
}

function ProductCard({ product, wished, onWish, onAdd }: { product: Product; wished: boolean; onWish: () => void; onAdd: () => void }) {
  const [, setLocation] = useLocation();
  return <article className="product-card" data-testid={`card-product-${product.id}`}>
    <div className="card-art-wrap" onClick={() => setLocation(`/product/${product.id}`)} role="button" tabIndex={0} data-testid={`button-view-product-${product.id}`}><Art product={product} /><button className={`wish-button ${wished ? 'wished' : ''}`} onClick={(e) => { e.stopPropagation(); onWish(); }} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} data-testid={`button-wishlist-${product.id}`}><Heart size={17} fill={wished ? 'currentColor' : 'none'} /></button>{product.tag && <span className="tag">{product.tag}</span>}</div>
    <div className="card-meta"><div><p className="card-category">{product.category}</p><h3 onClick={() => setLocation(`/product/${product.id}`)} data-testid={`text-product-name-${product.id}`}>{product.name}</h3></div><p className="card-price">{money(product.price)}</p></div>
    <div className="card-bottom"><span>{product.blurb}</span><button onClick={onAdd} data-testid={`button-add-${product.id}`}><Plus size={16} /> Add</button></div>
  </article>;
}

function Home({ wished, toggleWish, addToCart }: { wished: string[]; toggleWish: (id: string) => void; addToCart: (id: string) => void }) {
  const featured = productCatalog.slice(0, 4);
  return <><main>
    <section className="hero"><div className="hero-gridline" /><div className="hero-copy"><p className="eyebrow reveal">Aurelia / Objects of consideration</p><h1 className="reveal delay-1">Discover Products.<br /><em>Experience</em> Excellence.</h1><p className="hero-sub reveal delay-2">A quiet collection of technology, travel, home, and everyday carry — chosen for how it makes a life feel.</p><div className="hero-cta reveal delay-3"><Link href="/shop" className="a-btn a-btn-light" data-testid="link-hero-shop">Explore the collection <ArrowUpRight size={17} /></Link><span className="hero-index mono">01 / 04</span></div></div><div className="hero-art"><div className="hero-glow" /><div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><div className="hero-object"><span>A</span></div><div className="hero-caption mono">FORM / FUNCTION<br />BEAUTIFULLY RESOLVED</div></div><div className="hero-scroll mono">Scroll to discover <ChevronDown size={14} /></div></section>
    <section className="intro-band"><div className="section-label"><span>01</span><span>Point of view</span></div><div className="intro-grid"><h2>Good design is<br /><em>felt</em> before it is seen.</h2><div><p>We look for the objects that make the everyday more intentional. Not louder. Not newer. Simply better made, better considered, and worth keeping close.</p><Link href="/shop" className="text-link">Meet the collection <ArrowUpRight size={15} /></Link></div></div></section>
    <section className="featured-section"><div className="section-head"><div><p className="eyebrow">The first edit</p><h2>Objects with <em>presence.</em></h2></div><Link href="/shop" className="text-link">View all objects <ArrowUpRight size={15} /></Link></div><div className="product-grid">{featured.map((p) => <ProductCard key={p.id} product={p} wished={wished.includes(p.id)} onWish={() => toggleWish(p.id)} onAdd={() => addToCart(p.id)} />)}</div></section>
    <section className="statement-band"><div className="statement-art"><div className="statement-orb" /><span className="mono">A / 2025</span></div><div className="statement-copy"><p className="eyebrow">The Aurelia standard</p><h2>Buy less.<br /><em>Live more.</em></h2><p>Our edit is intentionally small. Every object earns its place through material, utility, and a certain indefinable feeling.</p><Link href="/shop" className="a-btn a-btn-dark">Shop the standard <ArrowUpRight size={17} /></Link></div></section>
    <section className="categories-section"><div className="section-label"><span>02</span><span>Find your frequency</span></div><div className="category-links">{categories.slice(1).map((cat, i) => <Link href={`/shop?category=${encodeURIComponent(cat)}`} key={cat} className="category-link" data-testid={`link-category-${cat.toLowerCase().replaceAll(' ', '-')}`}><span className="category-number">0{i + 1}</span><span>{cat}</span><ArrowUpRight size={21} /></Link>)}</div></section>
  </main><Footer /></>;
}

function Shop({ wished, toggleWish, addToCart }: { wished: string[]; toggleWish: (id: string) => void; addToCart: (id: string) => void }) {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All objects';
  const [query, setQuery] = useState(initialSearch);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'All objects');
  const [sort, setSort] = useState('Featured');
  const filtered = useMemo(() => productCatalog.filter((p) => (category === 'All objects' || p.category === category) && `${p.name} ${p.category} ${p.blurb}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : 0), [category, query, sort]);
  return <><main className="page-shell shop-page"><div className="page-heading"><div><p className="eyebrow">The collection / 08 objects</p><h1>Choose <em>well.</em></h1><p>Considered things for considered living.</p></div><div className="heading-note mono">CURATED IN<br />NEW YORK / 2025</div></div><div className="shop-controls"><div className="category-pills">{categories.map((cat) => <button className={category === cat ? 'selected' : ''} key={cat} onClick={() => setCategory(cat)} data-testid={`button-filter-${cat.toLowerCase().replaceAll(' ', '-')}`}>{cat}</button>)}</div><div className="sort-search"><label className="shop-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the edit" data-testid="input-shop-search" /></label><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" data-testid="select-sort"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select></div></div>{filtered.length > 0 ? <div className="product-grid shop-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} wished={wished.includes(p.id)} onWish={() => toggleWish(p.id)} onAdd={() => addToCart(p.id)} />)}</div> : <div className="empty-state"><Sparkles size={25} /><h2>Nothing by that name.</h2><p>Try a different search, or return to the full collection.</p><Button onClick={() => { setQuery(''); setCategory('All objects'); }} variant="dark" testId="button-clear-filters">Clear filters</Button></div>}</main><Footer /></>;
}

function ProductPage({ wished, toggleWish, addToCart }: { wished: string[]; toggleWish: (id: string) => void; addToCart: (id: string) => void }) {
  const [, params] = useRoute('/product/:id');
  const product = productCatalog.find((p) => p.id === params?.id);
  const [quantity, setQuantity] = useState(1);
  if (!product) return <NotFound />;
  return <><main className="product-page"><div className="breadcrumb mono"><Link href="/shop">Collection</Link><span>/</span><span>{product.category}</span><span>/</span><span>{product.name}</span></div><div className="product-layout"><div className="product-hero-art"><Art product={product} className="large-art" /><span className="art-spec mono">AURELIA / {product.id.toUpperCase()} / 2025</span></div><div className="product-info"><p className="eyebrow">{product.category} / {product.tag || 'Considered object'}</p><h1>{product.name}</h1><p className="product-price">{money(product.price)}</p><p className="product-description">{product.description}</p><div className="detail-rule" /><div className="product-detail-row"><span>Finish</span><strong>Midnight / Lilac</strong></div><div className="product-detail-row"><span>Availability</span><strong className={product.stock < 5 ? 'low-stock' : ''}>{product.stock < 5 ? `Only ${product.stock} remaining` : 'In stock — ready to ship'}</strong></div><div className="purchase-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" data-testid="button-decrease-quantity"><Minus size={15} /></button><span data-testid="text-product-quantity">{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity" data-testid="button-increase-quantity"><Plus size={15} /></button></div><Button onClick={() => { for (let i = 0; i < quantity; i++) addToCart(product.id); }} variant="dark" className="add-large" testId="button-add-to-cart">Add to bag <ArrowUpRight size={17} /></Button><button className={`detail-wish ${wished.includes(product.id) ? 'wished' : ''}`} onClick={() => toggleWish(product.id)} aria-label="Toggle wishlist" data-testid="button-product-wishlist"><Heart size={18} fill={wished.includes(product.id) ? 'currentColor' : 'none'} /></button></div><div className="promise-list"><div><ShieldCheck size={17} /><span><b>Considered quality</b> Made to be kept, not replaced.</span></div><div><Truck size={17} /><span><b>Fast, considered delivery</b> Complimentary over $150.</span></div></div></div></div></main><section className="product-story"><p className="eyebrow">A closer look</p><h2>Form follows<br /><em>feeling.</em></h2><p>Every curve and contact point has been pared back to its essential purpose. This is the Aurelia approach: objects that become invisible in your routine, and unforgettable when you notice them.</p></section><Footer /></>;
}

function Cart({ cart, updateCart, removeCart }: { cart: CartItem[]; updateCart: (id: string, quantity: number) => void; removeCart: (id: string) => void }) {
  const items = cart.map((item) => ({ ...item, product: productCatalog.find((p) => p.id === item.productId)! })).filter((i) => i.product);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return <><main className="page-shell cart-page"><div className="page-heading compact"><div><p className="eyebrow">Your selection</p><h1>The <em>bag.</em></h1></div><span className="mono">{items.length} {items.length === 1 ? 'object' : 'objects'}</span></div>{items.length ? <div className="cart-layout"><div className="cart-items">{items.map(({ product, quantity }) => <div className="cart-item" key={product.id} data-testid={`row-cart-${product.id}`}><Art product={product} /><div className="cart-item-info"><p className="card-category">{product.category}</p><h3>{product.name}</h3><p className="cart-blurb">{product.blurb}</p><div className="cart-item-bottom"><div className="quantity"><button onClick={() => updateCart(product.id, quantity - 1)} aria-label="Decrease item quantity" data-testid={`button-cart-decrease-${product.id}`}><Minus size={14} /></button><span>{quantity}</span><button onClick={() => updateCart(product.id, quantity + 1)} aria-label="Increase item quantity" data-testid={`button-cart-increase-${product.id}`}><Plus size={14} /></button></div><button className="remove-button" onClick={() => removeCart(product.id)} data-testid={`button-remove-${product.id}`}>Remove</button></div></div><p className="cart-item-price">{money(product.price * quantity)}</p></div>)}</div><aside className="cart-summary"><p className="eyebrow">Summary</p><div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Delivery</span><span>{subtotal >= 150 ? 'Complimentary' : money(14)}</span></div><div className="summary-total"><span>Total</span><strong>{money(subtotal >= 150 ? subtotal : subtotal + 14)}</strong></div><Link href="/checkout" className="a-btn a-btn-dark checkout-link" data-testid="link-checkout">Continue to checkout <ArrowUpRight size={17} /></Link><p className="secure-note"><ShieldCheck size={14} /> Secure, considered checkout</p></aside></div> : <div className="empty-state cart-empty"><ShoppingBag size={27} /><h2>Your bag is quiet.</h2><p>Good things take consideration. Begin with the collection.</p><Link href="/shop" className="a-btn a-btn-dark" data-testid="link-empty-shop">Explore the collection <ArrowUpRight size={17} /></Link></div>}</main><Footer /></>;
}

function Checkout({ cart, clearCart, setOrder }: { cart: CartItem[]; clearCart: () => void; setOrder: (order: { number: string; total: number; date: string }) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ number: string; total: number; date: string } | null>(null);
  const [error, setError] = useState('');
  const items = cart.map((item) => ({ ...item, product: productCatalog.find((p) => p.id === item.productId)! })).filter((i) => i.product);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); if (!form.get('name') || !form.get('email') || !form.get('address') || !form.get('city')) { setError('Please complete the required fields to continue.'); return; } const newOrder = { number: `AU-${Math.floor(10000 + Math.random() * 89999)}`, total, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }; setOrder(newOrder); setConfirmedOrder(newOrder); clearCart(); setSubmitted(true); };
  if (submitted) return <main className="confirmation"><div className="confirmation-mark"><Sparkles size={27} /></div><p className="eyebrow">Order received</p><h1>Thank you for<br /><em>choosing well.</em></h1><p>Your order is confirmed. We will send a considered dispatch note to your inbox shortly.</p><span className="mono confirmation-number">ORDER {confirmedOrder?.number}</span><Link href="/dashboard" className="a-btn a-btn-dark">View your order <ArrowUpRight size={17} /></Link></main>;
  if (!items.length) return <main className="confirmation"><div className="confirmation-mark"><ShoppingBag size={27} /></div><h1>Your bag is empty.</h1><Link href="/shop" className="a-btn a-btn-dark">Explore the collection <ArrowUpRight size={17} /></Link></main>;
  return <main className="page-shell checkout-page"><div className="checkout-header"><Link href="/cart" className="back-link"><ChevronLeft size={16} /> Back to bag</Link><p className="eyebrow">Aurelia / Checkout</p><h1>Almost <em>yours.</em></h1></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><fieldset><legend>01 / Contact</legend><div className="form-grid"><label>Full name<input name="name" placeholder="Your name" data-testid="input-checkout-name" /></label><label>Email address<input type="email" name="email" placeholder="you@example.com" data-testid="input-checkout-email" /></label></div></fieldset><fieldset><legend>02 / Delivery</legend><label>Street address<input name="address" placeholder="12 Example Street" data-testid="input-checkout-address" /></label><div className="form-grid"><label>City<input name="city" placeholder="New York" data-testid="input-checkout-city" /></label><label>Postal code<input name="postal" placeholder="10001" data-testid="input-checkout-postal" /></label></div><label>Country<select name="country" data-testid="select-checkout-country"><option>United States</option><option>United Kingdom</option><option>Japan</option><option>France</option></select></label></fieldset><fieldset><legend>03 / Payment</legend><div className="payment-option selected"><div><CreditCard size={18} /><span><b>Cash on Delivery</b><small>Pay when your considered objects arrive.</small></span></div><span className="radio selected" /></div><div className="payment-option disabled"><div><CreditCard size={18} /><span><b>Card payment</b><small>Available soon</small></span></div><span className="unavailable">Unavailable</span></div><div className="payment-option disabled"><div><CreditCard size={18} /><span><b>Digital wallet</b><small>Available soon</small></span></div><span className="unavailable">Unavailable</span></div></fieldset>{error && <p className="form-error" data-testid="status-checkout-error">{error}</p>}<Button type="submit" variant="dark" className="place-order" testId="button-place-order">Place order · {money(total)} <ArrowUpRight size={17} /></Button></form><aside className="order-aside"><p className="eyebrow">Your objects</p>{items.map(({ product, quantity }) => <div className="mini-order" key={product.id}><Art product={product} /><div><b>{product.name}</b><span>Qty {quantity}</span></div><strong>{money(product.price * quantity)}</strong></div>)}<div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><p className="secure-note"><ShieldCheck size={14} /> Your details are kept private.</p></aside></div></main>;
}

function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState('sign in');
  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); localStorage.setItem('aurelia-user', 'true'); setLocation('/dashboard'); };
  return <main className="auth-page"><div className="auth-art"><div className="auth-sun" /><span className="wordmark light">AURELIA<span className="wordmark-dot">.</span></span><span className="auth-art-caption mono">A PLACE FOR<br />BETTER THINGS</span></div><div className="auth-form-wrap"><Link href="/" className="back-link"><ChevronLeft size={16} /> Return home</Link><p className="eyebrow">Your Aurelia</p><h1>Welcome <em>back.</em></h1><p className="auth-sub">Keep your objects, orders, and considered choices in one place.</p><div className="auth-tabs"><button className={mode === 'sign in' ? 'active' : ''} onClick={() => setMode('sign in')} data-testid="button-sign-in-tab">Sign in</button><button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')} data-testid="button-create-account-tab">Create account</button></div><form onSubmit={submit} className="auth-form"><label>Email address<input required type="email" placeholder="you@example.com" data-testid="input-login-email" /></label><label>Password<input required type="password" placeholder="At least 8 characters" data-testid="input-login-password" /></label><div className="auth-row"><label className="check-label"><input type="checkbox" /> Remember me</label><button type="button" className="text-button" data-testid="button-forgot-password">Forgot password?</button></div><Button type="submit" variant="dark" className="auth-submit" testId="button-submit-login">{mode === 'sign in' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17} /></Button></form><p className="auth-foot">By continuing, you agree to our Terms and Privacy Policy.</p></div></main>;
}

function Dashboard() {
  const [, setLocation] = useLocation();
  const order = JSON.parse(localStorage.getItem('aurelia-last-order') || 'null') as { number: string; total: number; date: string } | null;
  return <main className="page-shell dashboard-page"><div className="dashboard-head"><div><p className="eyebrow">Your Aurelia</p><h1>Hello, <em>Alex.</em></h1><p>Welcome back to your considered collection.</p></div><Button onClick={() => { localStorage.removeItem('aurelia-user'); setLocation('/'); }} variant="outline" testId="button-sign-out">Sign out</Button></div><div className="dashboard-grid"><section className="account-card account-profile"><div className="avatar">AM</div><div><p className="eyebrow">Account</p><h3>Alex Morgan</h3><p>alex.morgan@example.com</p></div><button className="text-button">Edit details <ArrowUpRight size={14} /></button></section><section className="account-card"><div className="card-topline"><p className="eyebrow">Order history</p><Package size={19} /></div>{order ? <div className="order-row" data-testid="row-order-history"><div><b>{order.number}</b><span>{order.date} · Cash on Delivery</span></div><strong>{money(order.total)}</strong><span className="status-badge">Confirmed</span></div> : <div className="dashboard-empty"><p>No orders yet.</p><Link href="/shop" className="text-link">Find your first object <ArrowUpRight size={14} /></Link></div>}</section><section className="account-card account-preferences"><p className="eyebrow">Aurelia preferences</p><h3>Your edit is personal.</h3><p>Save objects you love to build a collection with a point of view.</p><Link href="/shop" className="a-btn a-btn-dark">Explore objects <ArrowUpRight size={16} /></Link></section></div></main>;
}

function Admin() {
  const [tab, setTab] = useState('Overview');
  return <main className="admin-page"><aside className="admin-sidebar"><Link href="/" className="wordmark">AURELIA<span className="wordmark-dot">.</span></Link><p className="admin-label mono">Studio / Internal</p>{['Overview', 'Products', 'Categories', 'Orders'].map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)} data-testid={`button-admin-${item.toLowerCase()}`}>{item}<ArrowUpRight size={14} /></button>)}<Link href="/" className="admin-back"><ChevronLeft size={14} /> Back to store</Link></aside><section className="admin-content"><div className="admin-top"><div><p className="eyebrow">Monday, 14 October 2025</p><h1>{tab}</h1></div><div className="admin-user">AM <span>Alex Morgan</span></div></div>{tab === 'Overview' && <><div className="admin-kpis"><div><span>Gross sales</span><strong>$18,462</strong><small>+12.4% this month</small></div><div><span>Orders</span><strong>86</strong><small>14 awaiting dispatch</small></div><div><span>Objects live</span><strong>08</strong><small>Across 4 categories</small></div></div><div className="admin-panels"><div className="admin-panel"><div className="panel-head"><div><p className="eyebrow">Recent orders</p><h3>Keep things moving.</h3></div><button className="text-button" onClick={() => setTab('Orders')}>View all <ArrowUpRight size={14} /></button></div>{[['AU-20481', 'Alex Morgan', '$452.00', 'Confirmed'], ['AU-20480', 'Samira Cole', '$164.00', 'In transit'], ['AU-20479', 'Theo Park', '$79.00', 'Delivered']].map((row) => <div className="admin-order" key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span>{row[2]}</span><span className="status-badge">{row[3]}</span></div>)}</div><div className="admin-panel inventory"><div className="panel-head"><div><p className="eyebrow">Inventory pulse</p><h3>Know what matters.</h3></div></div>{productCatalog.slice(0, 4).map((p) => <div className="inventory-row" key={p.id}><span className="inventory-dot" style={{ background: p.accent }} /><b>{p.name}</b><span>{p.stock} units</span><div className="inventory-bar"><i style={{ width: `${Math.min(100, p.stock * 4)}%`, background: p.accent }} /></div></div>)}</div></div></>}{tab !== 'Overview' && <div className="admin-table-panel"><div className="panel-head"><div><p className="eyebrow">Studio / {tab}</p><h3>Manage your catalogue.</h3></div><Button variant="dark" testId="button-admin-add">Add {tab === 'Orders' ? 'note' : tab.slice(0, -1).toLowerCase()} <Plus size={15} /></Button></div><div className="admin-table">{(tab === 'Products' ? productCatalog : tab === 'Categories' ? categories.slice(1).map((c, i) => ({ id: `cat-${i}`, name: c, category: 'Collection', price: i + 4, stock: 8 + i })) : [['AU-20481', 'Alex Morgan', 'Confirmed', '$452.00'], ['AU-20480', 'Samira Cole', 'In transit', '$164.00'], ['AU-20479', 'Theo Park', 'Delivered', '$79.00']].map((r) => ({ id: r[0], name: r[1], category: r[2], price: r[3], stock: 1 }))).map((p: any) => <div className="table-row" key={p.id}><span className="mono">{p.id}</span><b>{p.name}</b><span>{p.category}</span><strong>{typeof p.price === 'number' ? money(p.price) : p.price}</strong><span className="status-badge">{p.stock} {tab === 'Orders' ? '' : 'in stock'}</span></div>)}</div></div>}</section></main>;
}

function NotFound() {
  return <main className="not-found"><div className="not-found-number">404</div><p className="eyebrow">A quiet wrong turn</p><h1>Nothing <em>here.</em></h1><p>The page you are looking for has moved on to somewhere more considered.</p><Link href="/" className="a-btn a-btn-dark" data-testid="link-not-found-home">Return home <ArrowUpRight size={17} /></Link></main>;
}

function Store() {
  const [cart, setCart] = useLocalStorage<CartItem[]>('aurelia-cart', []);
  const [wished, setWished] = useLocalStorage<string[]>('aurelia-wishlist', []);
  const addToCart = (id: string) => setCart((items) => { const found = items.find((i) => i.productId === id); return found ? items.map((i) => i.productId === id ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i) : [...items, { productId: id, quantity: 1 }]; });
  const updateCart = (id: string, quantity: number) => setCart((items) => quantity <= 0 ? items.filter((i) => i.productId !== id) : items.map((i) => i.productId === id ? { ...i, quantity: Math.min(10, quantity) } : i));
  const removeCart = (id: string) => setCart((items) => items.filter((i) => i.productId !== id));
  const toggleWish = (id: string) => setWished((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const clearCart = () => setCart([]);
  const setOrderAndPersist = (newOrder: { number: string; total: number; date: string }) => { localStorage.setItem('aurelia-last-order', JSON.stringify(newOrder)); };
  return <><Header cartCount={cartCount} /><Switch><Route path="/" component={() => <Home wished={wished} toggleWish={toggleWish} addToCart={addToCart} />} /><Route path="/shop" component={() => <Shop wished={wished} toggleWish={toggleWish} addToCart={addToCart} />} /><Route path="/product/:id" component={() => <ProductPage wished={wished} toggleWish={toggleWish} addToCart={addToCart} />} /><Route path="/cart" component={() => <Cart cart={cart} updateCart={updateCart} removeCart={removeCart} />} /><Route path="/checkout" component={() => <Checkout cart={cart} clearCart={clearCart} setOrder={setOrderAndPersist} />} /><Route path="/login" component={Login} /><Route path="/dashboard" component={Dashboard} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch></>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={window.location.pathname}><Store /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;