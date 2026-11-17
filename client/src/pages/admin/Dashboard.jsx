import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Boxes, Package, PackageX } from 'lucide-react';
import StockBadge from '../../components/StockBadge';
import { CATEGORIES, categoryName } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { formatDateTime, formatPrice, productStatus, totalStock, variantRows } from '../../utils/stock';

function StatCard({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon size={22} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
        <p className="font-serif text-4xl font-semibold leading-tight">{value}</p>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { products } = useStore();
  const statuses = products.map(productStatus);
  const units = products.reduce((n, p) => n + totalStock(p), 0);
  const low = statuses.filter((s) => s === 'low').length;
  const out = statuses.filter((s) => s === 'out').length;
  const inStock = statuses.filter((s) => s === 'in').length;

  const lowVariants = products.flatMap(variantRows).filter((v) => v.status !== 'in').length;

  const recent = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const catStats = CATEGORIES.map((c) => {
    const list = products.filter((p) => p.category === c.slug);
    return { ...c, count: list.length, units: list.reduce((n, p) => n + totalStock(p), 0) };
  });
  const maxCatUnits = Math.max(1, ...catStats.map((c) => c.units));
  const topStock = [...products].sort((a, b) => totalStock(b) - totalStock(a)).slice(0, 8);
  const maxStock = Math.max(1, ...topStock.map(totalStock));

  const total = Math.max(1, products.length);
  const pIn = (inStock / total) * 100;
  const pLow = (low / total) * 100;
  const donut = `conic-gradient(#059669 0 ${pIn}%, #D39E57 ${pIn}% ${pIn + pLow}%, #DC2626 ${pIn + pLow}% 100%)`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={products.length} tone="bg-burgundy/10 text-burgundy" />
        <StatCard icon={Boxes} label="Available Units" value={units.toLocaleString('en-IN')} tone="bg-emerald-50 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Low Stock Products" value={low} tone="bg-gold/25 text-gold-dark" hint={`${lowVariants} variants need attention`} />
        <StatCard icon={PackageX} label="Out of Stock" value={out} tone="bg-red-50 text-red-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Stock by product</h2>
            <span className="text-xs text-ink-soft">Top 8 · units available</span>
          </div>
          {topStock.length ? (
            <div className="flex h-56 items-end gap-2 sm:gap-4">
              {topStock.map((p) => {
                const s = productStatus(p);
                return (
                  <div key={p.id} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${p.name}: ${totalStock(p)} units`}>
                    <span className="text-xs font-medium text-ink-soft">{totalStock(p)}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 ${s === 'low' ? 'bg-gold' : s === 'out' ? 'bg-red-400' : 'bg-burgundy'}`}
                      style={{ height: `${Math.max(4, (totalStock(p) / maxStock) * 80)}%` }}
                    />
                    <span className="line-clamp-2 h-8 w-full text-center text-[10px] leading-tight text-ink-soft">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="py-10 text-center text-sm text-ink-soft">No products yet.</p>}
        </section>

        <section className="card p-6">
          <h2 className="mb-5 text-2xl font-semibold">Stock status</h2>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: donut }}>
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="font-serif text-3xl font-semibold leading-none">{products.length}</span>
                <span className="text-[10px] uppercase tracking-wider text-ink-soft">products</span>
              </div>
            </div>
            <ul className="flex-1 space-y-3 text-sm">
              {[['In Stock', inStock, 'bg-emerald-600'], ['Low Stock', low, 'bg-gold'], ['Out of Stock', out, 'bg-red-600']].map(([l, n, c]) => (
                <li key={l} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{l}</span>
                  <span className="font-medium">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-6">
          <h2 className="mb-5 text-2xl font-semibold">Category overview</h2>
          <ul className="space-y-5">
            {catStats.map((c) => (
              <li key={c.slug}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-ink-soft">{c.count} products · {c.units} units</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-cream-dark">
                  <div className="h-full rounded-full bg-gradient-to-r from-burgundy to-gold transition-all duration-700" style={{ width: `${(c.units / maxCatUnits) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="text-2xl font-semibold">Recently added</h2>
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-burgundy hover:underline">View all <ArrowRight size={14} /></Link>
          </div>
          <ul className="divide-y divide-ink/5">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-6 py-3">
                <img src={p.images[0]} alt="" className="h-14 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-ink-soft">{categoryName(p.category)} · {formatDateTime(p.createdAt)}</p>
                </div>
                <p className="hidden text-sm font-medium sm:block">{formatPrice(p.price)}</p>
                <StockBadge status={productStatus(p)} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
