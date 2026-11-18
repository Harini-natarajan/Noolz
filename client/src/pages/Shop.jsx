import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Search, SearchX, Sparkles, X, SlidersHorizontal, Ruler } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SizeChartModal from '../components/SizeChartModal';
import { EmptyState, ProductSkeleton } from '../components/ui';
import { CATEGORIES, getCategoryByPath, subcategoryName } from '../config/site';
import { useStore } from '../context/StoreContext';

export default function Shop() {
  const { categoryPath, subCategoryPath } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, loading } = useStore();
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeChartType, setSizeChartType] = useState('oversized');

  // If URL has /shop/:categoryPath, map it. Otherwise check search params `?category=...`
  const matchedCategory = categoryPath ? getCategoryByPath(categoryPath) : null;
  const activeCategorySlug = matchedCategory
    ? matchedCategory.slug
    : (params.get('category') || 'all');

  const currentCategory = CATEGORIES.find((c) => c.slug === activeCategorySlug);

  const q = params.get('q') || '';
  const sort = params.get('sort') || 'default';
  const featuredOnly = params.get('featured') === '1';

  // Category showcase images for the 4 sections on main shop page
  const categoryShowcase = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const sample = products.find((p) => p.category === cat.slug && p.featured) ||
                     products.find((p) => p.category === cat.slug);
      return {
        ...cat,
        image: sample?.images?.[0] || null,
        count: products.filter((p) => p.category === cat.slug).length,
      };
    });
  }, [products]);

  // Update query params helper
  const updateParams = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v && v !== 'all' && v !== 'default') {
        next.set(k, v);
      } else {
        next.delete(k);
      }
    });
    setParams(next, { replace: true });
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Category match
      if (activeCategorySlug !== 'all' && p.category !== activeCategorySlug) {
        return false;
      }
      // 2. Subcategory match if specified in route
      if (subCategoryPath && p.subcategory && p.subcategory !== subCategoryPath) {
        return false;
      }
      // 3. Featured filter
      if (featuredOnly && !p.featured) {
        return false;
      }
      // 4. Search query
      if (q.trim() && !p.name.toLowerCase().includes(q.trim().toLowerCase())) {
        return false;
      }
      return true;
    });

    // Sorting
    if (sort === 'low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeCategorySlug, subCategoryPath, featuredOnly, q, sort]);

  const isMainShopRoot = !categoryPath && activeCategorySlug === 'all';
  const hasActiveFilters = q || featuredOnly || sort !== 'default';

  return (
    <div className="container-page pb-16 pt-4 sm:pb-24 sm:pt-6">
      {/* Breadcrumb Navigation when viewing a specific category or subcategory */}
      {currentCategory && (
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-soft" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-burgundy">Home</Link>
          <ChevronRight size={13} className="text-ink/40" />
          <Link to="/shop" className="hover:text-burgundy">Shop</Link>
          <ChevronRight size={13} className="text-ink/40" />
          <Link to={`/shop/${currentCategory.path}`} className={`hover:text-burgundy ${!subCategoryPath ? 'font-semibold text-ink' : ''}`}>
            {currentCategory.collection}
          </Link>
          {subCategoryPath && (
            <>
              <ChevronRight size={13} className="text-ink/40" />
              <span className="font-semibold text-burgundy">
                {subcategoryName(currentCategory.slug, subCategoryPath)}
              </span>
            </>
          )}
        </nav>
      )}

      {/* 4 Main Category Sections Showcase (Displayed on Main Shop Page) */}
      {isMainShopRoot && (
        <section className="mb-16">
          <div className="mb-8 text-center">
            <p className="eyebrow mb-2">Our Collections</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Shop by Category</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">
              Explore our four signature categories, each printed on premium combed cotton or heavy canvas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categoryShowcase.map((cat) => (
              <div
                key={cat.slug}
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
              >
                {/* Category Banner Image */}
                <Link
                  to={`/shop/${cat.path}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.collection}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-cream-deep text-ink-soft">
                      {cat.name}
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-cream/90 px-2.5 py-0.5 text-[11px] font-medium text-ink shadow-xs backdrop-blur-xs">
                    {cat.count} items
                  </span>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-serif text-2xl font-semibold text-ink transition-colors group-hover:text-burgundy">
                    {cat.collection}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                    {cat.description}
                  </p>

                  <div className="mt-auto pt-5">
                    <Link
                      to={`/shop/${cat.path}`}
                      className="btn-outline btn-sm w-full group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-cream"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Header when inside a category route */}
      {!isMainShopRoot && currentCategory && (
        <header className="mb-8 rounded-3xl bg-cream-dark/60 p-6 sm:p-10 border border-ink/5">
          <div className="max-w-2xl">
            <span className="eyebrow">{currentCategory.collection}</span>
            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {subCategoryPath ? subcategoryName(currentCategory.slug, subCategoryPath) : currentCategory.name}
            </h1>
            <p className="mt-2 text-sm text-ink-soft sm:text-base">
              {currentCategory.description}
            </p>
          </div>

          {/* Subcategory Pills Filter */}
          {currentCategory.subcategories?.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft mr-1">
                Fit / Style:
              </span>
              <Link
                to={`/shop/${currentCategory.path}`}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  !subCategoryPath
                    ? 'bg-burgundy text-cream shadow-xs'
                    : 'bg-white border border-ink/15 text-ink hover:border-burgundy hover:text-burgundy'
                }`}
              >
                All {currentCategory.short}
              </Link>
              {currentCategory.subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  to={`/shop/${currentCategory.path}/${sub.slug}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    subCategoryPath === sub.slug
                      ? 'bg-burgundy text-cream shadow-xs'
                      : 'bg-white border border-ink/15 text-ink hover:border-burgundy hover:text-burgundy'
                  }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {/* Size Chart Guide Banner */}
          {(subCategoryPath === 'oversized' || subCategoryPath === 'normal-fit' || subCategoryPath === 'plain-tees') && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-burgundy/20 bg-white/80 p-4 text-xs sm:text-sm shadow-xs">
              <div className="flex items-center gap-3 text-ink">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy">
                  <Ruler size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    {subCategoryPath === 'oversized'
                      ? 'Need help picking your oversized size?'
                      : 'Need help choosing the right size?'}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Check chest, shoulder, length and sleeve measurements before ordering.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSizeChartType(subCategoryPath === 'oversized' ? 'oversized' : 'regular');
                  setSizeChartOpen(true);
                }}
                className="btn-primary btn-sm"
              >
                <Ruler size={14} /> View Size & Fit Chart
              </button>
            </div>
          )}
        </header>
      )}

      {/* Product Section Title Anchor */}
      <div id="all-products" className="scroll-mt-24">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-ink">
              {isMainShopRoot ? 'All Products' : `Products (${filteredProducts.length})`}
            </h2>
            <p className="text-xs text-ink-soft">
              {isMainShopRoot ? 'Browse our complete catalog of custom printed merchandise' : `Showing items in ${currentCategory?.name || 'this collection'}`}
            </p>
          </div>

          {/* Quick tab switch on root shop page */}
          {isMainShopRoot && (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:overflow-visible">
              <button
                onClick={() => updateParams({ category: 'all' })}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  activeCategorySlug === 'all'
                    ? 'bg-burgundy text-cream'
                    : 'bg-white border border-ink/15 text-ink/80 hover:border-burgundy hover:text-burgundy'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => navigate(`/shop/${cat.path}`)}
                  className="shrink-0 rounded-full bg-white border border-ink/15 px-3.5 py-1 text-xs font-medium text-ink/80 hover:border-burgundy hover:text-burgundy transition"
                >
                  {cat.short}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-8 grid gap-3 rounded-2xl border border-ink/5 bg-white/80 p-3 shadow-soft sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              className="input !pl-10"
              placeholder="Search products by name…"
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
              aria-label="Search products"
            />
          </div>

          <select
            className="input sm:w-48"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            aria-label="Sort products by price"
          >
            <option value="default">Sort: Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          <button
            onClick={() => updateParams({ featured: featuredOnly ? '' : '1' })}
            aria-pressed={featuredOnly}
            className={`btn !rounded-xl border text-xs sm:text-sm ${
              featuredOnly
                ? 'border-gold bg-gold text-ink font-semibold'
                : 'border-ink/15 bg-white/70 hover:border-gold'
            }`}
          >
            <Sparkles size={14} /> Featured only
          </button>
        </div>

        {/* Active filter counter & reset */}
        <div className="mb-6 flex items-center justify-between text-xs text-ink-soft">
          <p>
            {loading ? 'Loading catalog…' : `Displaying ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`}
          </p>
          {(hasActiveFilters || categoryPath || subCategoryPath) && (
            <button
              onClick={() => {
                navigate('/shop');
                setParams({}, { replace: true });
              }}
              className="inline-flex items-center gap-1 text-burgundy hover:underline font-medium"
            >
              <X size={13} /> Reset all filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No products found"
            message={
              q
                ? `No products matched "${q}". Try a different keyword.`
                : 'There are currently no items matching this specific category selection.'
            }
            action={
              <Link to="/shop" className="btn-primary">
                View All Products
              </Link>
            }
          />
        )}
      </div>

      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        initialType={sizeChartType}
      />
    </div>
  );
}
