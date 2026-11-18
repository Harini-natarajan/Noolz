import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { categoryName, subcategoryName } from '../config/site';
import { formatPrice, productStatus } from '../utils/stock';
import { buildQuickMessage, openWhatsApp, getAdminWhatsAppNumber } from '../utils/whatsapp';

export default function ProductCard({ product }) {
  const { settings } = useStore();
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || null);
  const status = productStatus(product);
  const out = status === 'out';

  // Find images for the active selected color
  const activeColorObj = useMemo(() => {
    if (!product?.colors?.length) return null;
    return (
      product.colors.find(
        (c) => (c.name || c.color || c).toLowerCase() === (selectedColor || '').toLowerCase()
      ) || product.colors[0]
    );
  }, [product, selectedColor]);

  const colorImages = useMemo(() => {
    // 1. Direct color-specific images
    const colorImgs =
      activeColorObj?.images || (activeColorObj?.image ? [activeColorObj.image] : null);
    if (Array.isArray(colorImgs) && colorImgs.length > 0) {
      return colorImgs;
    }

    // 2. Check product.images matching color name
    if (Array.isArray(product?.images) && product.images.length > 0 && selectedColor) {
      const cLower = selectedColor.trim().toLowerCase();
      const match = product.images.find((url) => {
        if (typeof url !== 'string') return false;
        return url.split('/').pop().toLowerCase().includes(cLower);
      });
      if (match) return [match];

      // 3. Map by index if multiple colors
      const colorIdx = (product.colors || []).findIndex((c) => {
        const cName = typeof c === 'string' ? c : c?.name || c?.color;
        return cName && cName.trim().toLowerCase() === cLower;
      });
      if (colorIdx >= 0 && colorIdx < product.images.length && (product.colors || []).length > 1) {
        return [product.images[colorIdx]];
      }
    }

    return product?.images || [];
  }, [activeColorObj, product, selectedColor]);

  const primaryImage = colorImages[0] || product.images?.[0] || '';
  const secondaryImage = colorImages[1] || (colorImages.length === 1 ? null : product.images?.[1]);

  const productLink = `/product/${product.id || product._id}${
    selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''
  }`;

  const quickOrder = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${productLink}` : '';
    openWhatsApp(
      getAdminWhatsAppNumber(settings?.whatsappNumber),
      buildQuickMessage({ product, productUrl: url })
    );
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <Link to={productLink} className="relative block aspect-[4/5] overflow-hidden bg-cream-dark">
        <img
          key={primaryImage}
          src={primaryImage}
          alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${out ? 'opacity-70' : ''}`}
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
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
          {product.colors?.length > 0 && (
            <div className="flex -space-x-1 items-center" aria-label="Available color variants">
              {product.colors.slice(0, 5).map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(c.name);
                    }}
                    onMouseEnter={() => setSelectedColor(c.name)}
                    title={c.name}
                    aria-label={`Show ${c.name} variant`}
                    className={`relative h-4 w-4 rounded-full border border-white ring-1 transition-all ${
                      isSelected ? 'ring-2 ring-burgundy scale-125 z-10 shadow-xs' : 'ring-ink/20 hover:scale-110'
                    }`}
                    style={{ background: c.hex }}
                  />
                );
              })}
              {product.colors.length > 5 && (
                <span className="pl-2 text-[10px] text-ink-soft">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-4">
          <Link to={productLink} className="btn-outline btn-sm">
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
