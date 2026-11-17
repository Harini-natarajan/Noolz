import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShieldCheck, Truck, Palette } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import StockBadge from '../components/StockBadge';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/ui';
import { categoryName, categoryPath } from '../config/site';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getStatus, getVariantQty, STATUS_LABEL } from '../utils/stock';
import { buildOrderMessage, openWhatsApp, getAdminWhatsAppNumber } from '../utils/whatsapp';

export default function ProductDetails() {
  const { id } = useParams();
  const { products, loading, settings } = useStore();
  const toast = useToast();
  const product = products.find((p) => p.id === id);

  const [img, setImg] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  // Reset selection whenever the product changes.
  useEffect(() => {
    if (!product) return;
    setImg(0);
    setQty(1);
    // Preselect the first available combination.
    const first = product.colors
      .flatMap((c) => product.sizes.map((s) => ({ c: c.name, s })))
      .find(({ c, s }) => getVariantQty(product, c, s) > 0);
    setColor(first?.c ?? product.colors[0]?.name ?? null);
    setSize(first?.s ?? null);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const available = product && color && size ? getVariantQty(product, color, size) : 0;
  const threshold = product?.lowStockThreshold ?? 5;
  const status = getStatus(available, threshold);

  // Keep quantity within stock.
  useEffect(() => {
    setQty((q) => Math.max(1, Math.min(q, available || 1)));
  }, [available]);

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [products, product]
  );

  if (loading) {
    return (
      <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-cream-dark" />
        <div className="space-y-4">
          {[40, 70, 30, 100, 60].map((w, i) => <div key={i} className="h-8 animate-pulse rounded bg-cream-dark" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div className="container-page py-20">
        <EmptyState title="Product not found" message="It may have been removed." action={<Link to="/shop" className="btn-primary">Back to shop</Link>} />
      </div>
    );

  const sizeHasStock = (s) => (color ? getVariantQty(product, color, s) > 0 : false);
  const colorHasStock = (c) => product.sizes.some((s) => getVariantQty(product, c, s) > 0);
  const totalAll = product.colors.reduce(
    (sum, c) => sum + product.sizes.reduce((n, s) => n + getVariantQty(product, c.name, s), 0), 0);

  const pickColor = (c) => {
    setColor(c);
    // If the selected size is unavailable in this colour, move to an available one.
    if (getVariantQty(product, c, size) <= 0) {
      const alt = product.sizes.find((s) => getVariantQty(product, c, s) > 0);
      setSize(alt ?? size);
    }
  };

  const unitPrice =
    product?.discountPrice && Number(product.discountPrice) < Number(product.price)
      ? Number(product.discountPrice)
      : Number(product?.price || 0);
  const totalPrice = unitPrice * qty;

  const order = () => {
    if (!product) {
      return toast('Please select a product first.', 'error');
    }
    if (product.colors?.length > 0 && !color) {
      return toast('Please select a color for your piece.', 'error');
    }
    if (product.sizes?.length > 0 && !size) {
      return toast('Please select a size for your piece.', 'error');
    }
    if (!qty || qty < 1) {
      return toast('Please select a quantity of at least 1.', 'error');
    }
    if (available <= 0) {
      return toast('This combination is currently out of stock.', 'error');
    }
    if (qty > available) {
      return toast(`Only ${available} unit(s) available in this combination. Please adjust quantity.`, 'error');
    }

    const adminNumber = getAdminWhatsAppNumber(settings?.whatsappNumber);
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';

    const message = buildOrderMessage({
      product,
      color: color || 'Default',
      size: size || 'Standard',
      quantity: qty,
      productUrl,
    });

    openWhatsApp(adminNumber, message);
    toast('Opening WhatsApp with your order details…', 'info');
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft" aria-label="Breadcrumb">
        <Link to="/shop" className="inline-flex items-center gap-1 hover:text-burgundy"><ChevronLeft size={16} /> Shop</Link>
        <span>/</span>
        <Link to={categoryPath(product.category)} className="hover:text-burgundy">{categoryName(product.category)}</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div className="grid gap-4 sm:grid-cols-[84px_1fr]">
          <div className="no-scrollbar order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                aria-label={`View image ${i + 1}`}
                className={`aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-full ${
                  img === i ? 'border-burgundy shadow-soft' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative order-1 overflow-hidden rounded-3xl bg-cream-dark shadow-soft sm:order-2">
            <img src={product.images[img] ?? product.images[0]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            {product.featured && (
              <span className="absolute left-4 top-4 rounded-full bg-burgundy px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-cream">Featured</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{categoryName(product.category)}</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-medium text-burgundy">{formatPrice(unitPrice)}</span>
            {product.discountPrice && Number(product.discountPrice) < Number(product.price) && (
              <span className="text-lg text-ink-soft line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-ink/10 py-4 text-sm">
            <StockBadge status={totalAll <= 0 ? 'out' : status} label={totalAll <= 0 ? 'Out of Stock' : STATUS_LABEL[status]} />
            {totalAll > 0 && color && size && (
              <span className="text-ink-soft">
                {available > 0 ? (status === 'low' ? `Only ${available} left in this option` : `${available} available`) : 'This option is sold out'}
              </span>
            )}
          </div>

          {/* Colour */}
          <div className="mt-6">
            <p className="label">Color: <span className="normal-case tracking-normal text-ink">{color}</span></p>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => {
                const ok = colorHasStock(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => pickColor(c.name)}
                    title={ok ? c.name : `${c.name} — sold out`}
                    aria-label={`${c.name}${ok ? '' : ' (sold out)'}`}
                    aria-pressed={color === c.name}
                    className={`relative h-10 w-10 rounded-full border border-ink/20 transition ${
                      color === c.name ? 'ring-2 ring-burgundy ring-offset-2 ring-offset-cream' : 'hover:scale-110'
                    } ${ok ? '' : 'opacity-40'}`}
                    style={{ background: c.hex }}
                  >
                    {!ok && <span className="absolute inset-0 flex items-center justify-center"><span className="h-px w-full rotate-45 bg-ink/60" /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="label">Size: <span className="normal-case tracking-normal text-ink">{size}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const ok = sizeHasStock(s);
                return (
                  <button
                    key={s}
                    disabled={!ok}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    title={ok ? s : 'Unavailable in this colour'}
                    className={`min-w-[3.25rem] rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      size === s
                        ? 'border-burgundy bg-burgundy text-cream'
                        : ok
                          ? 'border-ink/20 bg-white/70 hover:border-burgundy hover:text-burgundy'
                          : 'cursor-not-allowed border-ink/10 bg-cream-dark/60 text-ink/30 line-through'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <p className="label">Quantity</p>
            <div className="inline-flex items-center rounded-full border border-ink/20 bg-white/70">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream-dark disabled:opacity-30"><Minus size={16} /></button>
              <span className="w-12 text-center font-medium" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(available, q + 1))} disabled={qty >= available} aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream-dark disabled:opacity-30"><Plus size={16} /></button>
            </div>
            {available > 0 && qty >= available && <p className="mt-2 text-xs text-amber-700">Maximum available quantity selected.</p>}
          </div>

          <div className="mt-8 rounded-2xl border border-ink/5 bg-white/70 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Total</span>
              <span className="font-serif text-2xl font-semibold text-burgundy">{formatPrice(totalPrice)}</span>
            </div>
            <button onClick={order} disabled={available <= 0} className="btn-whatsapp mt-4 w-full !py-3.5 text-base">
              <WhatsAppIcon size={20} /> {available <= 0 ? 'Out of Stock' : 'Order via WhatsApp'}
            </button>
            <p className="mt-3 text-center text-xs text-ink-soft">No online payment. We'll confirm your order and delivery on WhatsApp.</p>
          </div>

          <ul className="mt-6 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
            {[[Palette, 'Original print'], [ShieldCheck, 'Quality checked'], [Truck, 'Ships across India']].map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-2"><Icon size={16} className="text-gold-dark" /> {t}</li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">You may also like</h2>
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
