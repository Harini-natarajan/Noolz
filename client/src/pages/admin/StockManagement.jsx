import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Minus, Plus, Search, SearchX } from 'lucide-react';
import StockBadge from '../../components/StockBadge';
import { EmptyState } from '../../components/ui';
import { CATEGORIES, categoryName } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { getStatus, variantRows } from '../../utils/stock';

const PAGE = 15;

function QtyControl({ row, onSet }) {
  const [draft, setDraft] = useState(String(row.qty));
  useEffect(() => {
    setDraft(String(row.qty));
  }, [row.qty]);

  const commit = () => {
    const n = Math.max(0, Math.floor(Number(draft)));
    if (Number.isNaN(n)) return setDraft(String(row.qty));
    if (n !== row.qty) onSet(n, 'Manual edit');
    else setDraft(String(row.qty));
  };

  return (
    <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
      <button onClick={() => onSet(row.qty - 1, 'Stock decreased')} disabled={row.qty <= 0} aria-label="Decrease stock"
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-dark disabled:opacity-30"><Minus size={14} /></button>
      <input
        type="number" min="0" value={draft} aria-label="Stock quantity"
        onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="w-14 bg-transparent text-center text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button onClick={() => onSet(row.qty + 1, 'Stock increased')} aria-label="Increase stock"
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-dark"><Plus size={14} /></button>
    </div>
  );
}

export default function StockManagement() {
  const { products, setVariantStock, loading } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const allRows = useMemo(() => products.flatMap(variantRows), [products]);
  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (cat === 'all' || r.product.category === cat) &&
          (status === 'all' || r.status === status) &&
          r.product.name.toLowerCase().includes(q.trim().toLowerCase())
      ),
    [allRows, q, cat, status]
  );

  useEffect(() => {
    setPage(1);
  }, [q, cat, status]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const visible = rows.slice((page - 1) * PAGE, page * PAGE);

  const lowCount = allRows.filter((r) => r.status === 'low').length;
  const outCount = allRows.filter((r) => r.status === 'out').length;

  const apply = (row, qty, note) => {
    const next = Math.max(0, qty);
    setVariantStock(row.productId, row.color, row.size, next, note);
    const st = getStatus(next, row.product.lowStockThreshold);
    if (st === 'out' && row.status !== 'out') toast(`${row.product.name} (${row.color}/${row.size}) is now out of stock.`, 'error');
    else if (st === 'low' && row.status === 'in') toast(`${row.product.name} (${row.color}/${row.size}) is running low.`, 'info');
  };

  return (
    <div className="space-y-5">
      {(lowCount > 0 || outCount > 0) && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-gold/15 px-5 py-4 text-sm">
          <AlertTriangle size={18} className="text-gold-dark" />
          <p className="flex-1">
            <strong>{lowCount}</strong> variants are low on stock and <strong>{outCount}</strong> are out of stock.
          </p>
          <button onClick={() => setStatus('low')} className="btn-outline btn-sm">Show low</button>
          <button onClick={() => setStatus('out')} className="btn-outline btn-sm">Show out</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className="input !pl-10" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </div>
        <select className="input sm:w-52" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="card space-y-3 p-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-cream-dark" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={SearchX} title="No variants found" message="Adjust your search or filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream-dark/70 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  {['Product', 'Color', 'Size', 'Available stock', 'Status'].map((h) => <th key={h} className="px-5 py-3.5 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {visible.map((r) => (
                  <tr key={`${r.productId}-${r.color}-${r.size}`} className={`transition hover:bg-cream/70 ${r.status === 'out' ? 'bg-red-50/40' : r.status === 'low' ? 'bg-gold/10' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={r.product.images[0]} alt="" className="h-11 w-9 rounded-md object-cover" />
                        <div>
                          <p className="font-medium">{r.product.name}</p>
                          <p className="text-xs text-ink-soft">{categoryName(r.product.category)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-ink/20" style={{ background: r.hex }} />{r.color}</span></td>
                    <td className="px-5 py-3 font-medium">{r.size}</td>
                    <td className="px-5 py-3"><QtyControl row={r} onSet={(n, note) => apply(r, n, note)} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StockBadge status={r.status} />
                        {r.status === 'low' && <AlertTriangle size={15} className="text-amber-600" title={`At or below threshold (${r.product.lowStockThreshold})`} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-ink/5 px-5 py-3 text-xs text-ink-soft">
            <p>{rows.length} variants</p>
            <div className="flex items-center gap-2">
              <button className="rounded-full p-1.5 hover:bg-cream-dark disabled:opacity-30" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span>Page {page} of {pages}</span>
              <button className="rounded-full p-1.5 hover:bg-cream-dark disabled:opacity-30" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
