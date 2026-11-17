import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { categoryName, subcategoryName } from '../config/site';
import { formatPrice, productStatus } from '../utils/stock';
import { buildQuickMessage, openWhatsApp, getAdminWhatsAppNumber } from '../utils/whatsapp';

export default function ProductCard({ product }) {
  const { settings } = useStore();
  const status = productStatus(product);
  const out = status === 'out';

  const quickOrder = () =>
    openWhatsApp(getAdminWhatsAppNumber(settings?.whatsappNumber), buildQuickMessage({ product }));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-cream-dark">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${out ? 'opacity-70' : ''}`}
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.featured && (
            <span className="rounded-full bg-burgundy px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-cream">
              Featured
            </span>
          )}
          {status === 'low' && (
            <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-ink">
              Low stock
            </span>
          )}
          {out && (
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-cream">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-dark">
          {categoryName(product.category)}
          {product.subcategory && (
            <span className="text-ink/40 font-normal"> · {subcategoryName(product.category, product.subcategory)}</span>
          )}
        </p>
        <h3 className="mt-1 line-clamp-1 font-serif text-xl font-semibold text-ink">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-base font-medium text-burgundy">{formatPrice(product.price)}</p>
          <div className="flex -space-x-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-4 w-4 rounded-full border border-white ring-1 ring-ink/15"
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-4">
          <Link to={`/product/${product.id}`} className="btn-outline btn-sm">
            <Eye size={15} /> View Details
          </Link>
          <button
            onClick={quickOrder}
            className="btn-whatsapp btn-sm"
            aria-label={`Quick order ${product.name} via WhatsApp`}
            title="Quick Order via WhatsApp"
          >
            <WhatsAppIcon size={16} />
            <span className="hidden sm:inline">Quick Order</span>
          </button>
        </div>
      </div>
    </article>
  );
}
