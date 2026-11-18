// Central, easily editable site configuration.
// These are only DEFAULTS — the admin Settings page overrides them via localStorage.

export const SITE_DEFAULTS = {
  businessName: 'NOOLZ',
  tagline: 'stitched for you',
  // Digits only: country code + number (91 + 9585123004)
  whatsappNumber: '919585123004',
  phoneNumber: '+91 9585123004',
  email: 'Hellonoolz.in@gmail.com',
  instagram: 'https://instagram.com/noolz.co.in',
  instagramHandle: 'noolz.co.in',
  address: 'Mecheri, Salem - 636 453',
  hours: 'Mon – Sat, 10:00 AM – 7:00 PM',
  logo: '/logo.png',
  aboutImage: '',
};

export const sanitizeWhatsAppNumber = (number) =>
  String(number ?? '').replace(/\D/g, '');

export const getAdminWhatsAppNumber = (customSettingsNumber) => {
  const envNumber = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_WHATSAPP_NUMBER : '';
  const rawNumber = customSettingsNumber || envNumber || SITE_DEFAULTS.whatsappNumber || '919585123004';
  const clean = sanitizeWhatsAppNumber(rawNumber);
  return clean || '919585123004';
};

// Internal `slug` is stored on products (product.category / product.subcategory).
// `path` is the URL segment used in /shop/:path/:sub routes.
export const CATEGORIES = [
  {
    slug: 'men',
    path: 'mens',
    name: "Men's T-Shirts",
    collection: "Men's Collection",
    short: "Men's",
    image: '/categories/men.jpg',
    description: 'Relaxed, oversized and everyday tees with original prints on premium cotton.',
    subcategories: [
      { slug: 'normal-fit', name: 'Normal Fit' },
      { slug: 'oversized', name: 'Oversized' },
      { slug: 'plain-tees', name: 'Plain Tees' },
    ],
  },
  {
    slug: 'women',
    path: 'womens',
    name: "Women's T-Shirts",
    collection: "Women's Collection",
    short: "Women's",
    image: '/categories/women.jpg',
    description: 'Soft, flattering silhouettes — from cropped cuts to easy oversized fits.',
    subcategories: [
      { slug: 'oversized', name: 'Oversized Tees' },
      { slug: 'crop-tops', name: 'Crop Tops' },
      { slug: 'normal-fit', name: 'Normal Fit' },
    ],
  },
  {
    slug: 'kids',
    path: 'kids',
    name: "Kids' T-Shirts",
    collection: "Kids' Collection",
    short: "Kids'",
    image: '/categories/kids.jpg',
    description: 'Playful prints on gentle, skin-friendly cotton made for little adventurers.',
    allLabel: "All Kids' T-Shirts",
    subcategories: [], // ready for future subcategories
  },
  {
    slug: 'tote',
    path: 'tote-bags',
    name: 'Tote Bags',
    collection: 'Tote Bags',
    short: 'Tote Bags',
    image: '/categories/tote.jpg',
    description: 'Sturdy printed canvas totes — roomy, durable and made for everyday carry.',
    allLabel: 'All Tote Bags',
    subcategories: [], // ready for future subcategories
  },
];

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug || c.path === slug);
export const getCategoryByPath = (path) => CATEGORIES.find((c) => c.path === path || c.slug === path);
export const subcategoryName = (catSlug, subSlug) =>
  getCategory(catSlug)?.subcategories?.find((s) => s.slug === subSlug)?.name ?? subSlug;

/** Build a shop URL, e.g. categoryPath('men', 'oversized') -> /shop/mens/oversized */
export const categoryPath = (catSlug, subSlug) => {
  const cat = getCategory(catSlug);
  if (!cat) return '/shop';
  return `/shop/${cat.path}${subSlug ? `/${subSlug}` : ''}`;
};
export const STORAGE_KEYS = {
  products: 'noolz.products.v2',
  history: 'noolz.history.v2',
  settings: 'noolz.settings.v1',
};

export const SIZE_OPTIONS = {
  men: ['S', 'M', 'L', 'XL', 'XXL'],
  women: ['XS', 'S', 'M', 'L', 'XL'],
  kids: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
  tote: ['One Size'],
};

export const COLOR_PRESETS = [
  { name: 'Black', hex: '#1B1517' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off White', hex: '#F3ECDD' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Olive', hex: '#6B7048' },
  { name: 'Burgundy', hex: '#8A0B45' },
  { name: 'Mustard', hex: '#D39E57' },
  { name: 'Sage', hex: '#A9B79C' },
  { name: 'Sky', hex: '#A9C7E0' },
  { name: 'Blush', hex: '#EBC6C3' },
  { name: 'Sand', hex: '#D8C3A0' },
  { name: 'Natural', hex: '#EFE4CC' },
];
