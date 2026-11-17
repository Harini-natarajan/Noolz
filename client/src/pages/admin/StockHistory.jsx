import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Search, SearchX } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { useStore } from '../../context/StoreContext';
import { formatDateTime } from '../../utils/stock';

const PAGE = 12;

export default function StockHistory() {
  const { history, loading } = useStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () =>
      history.filter(
        (h) =>
          (type === 'all' || (type === 'added' ? h.change > 0 : h.change < 0)) &&
          h.productName.toLowerCase().includes(q.trim().toLowerCase())
      ),
    [history, q, type]
  );
  useEffect(() => {
    setPage(1);
  }, [q, type]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const visible = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className="input !pl-10" placeholder="Search by product…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search history" />
        </div>
        <select className="input sm:w-52" value={type} onChange={(e) => setType(e.target.value)} aria-label="Movement type">
          <option value="all">All movements</option>
          <option value="added">Stock added</option>
          <option value="removed">Stock removed</option>
        </select>
      </div>

      {loading ? (
        <div className="card space-y-3 p-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-cream-dark" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={SearchX} title="No stock movements" message="Stock changes you make will be logged here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-cream-dark/70 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  {['Product', 'Size', 'Color', 'Previous', 'Updated', 'Change', 'Date & time'].map((h) => <th key={h} className="px-5 py-3.5 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {visible.map((h) => (
                  <tr key={h.id} className="transition hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <p className="font-medium">{h.productName}</p>
                      {h.note && <p className="text-xs text-ink-soft">{h.note}</p>}
                    </td>
                    <td className="px-5 py-3">{h.size}</td>
                    <td className="px-5 py-3">{h.color}</td>
                    <td className="px-5 py-3 text-ink-soft">{h.previous}</td>
                    <td className="px-5 py-3 font-medium">{h.updated}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${h.change > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {h.change > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {h.change > 0 ? `+${h.change}` : h.change}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{formatDateTime(h.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-ink/5 px-5 py-3 text-xs text-ink-soft">
            <p>{rows.length} records</p>
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
