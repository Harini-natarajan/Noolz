import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, PackagePlus, Search, SearchX, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import StockBadge from '../../components/StockBadge';
import { EmptyState } from '../../components/ui';
import { CATEGORIES, categoryName } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, productStatus, totalStock } from '../../utils/stock';

export default function AdminProducts() {
  const { products, deleteProduct, loading } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [toDelete, setToDelete] = useState(null);

  const list = useMemo(
    () =>
      products.filter(
        (p) => (cat === 'all' || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())
      ),
    [products, q, cat]
  );

  const confirmDelete = async () => {
    try {
      await deleteProduct(toDelete.id || toDelete._id);
      toast(`"${toDelete.name}" was deleted.`);
      setToDelete(null);
    } catch {
      // toast shown by StoreContext
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className="input !pl-10" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </div>
        <select className="input sm:w-56" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <Link to="/admin/products/new" className="btn-primary"><PackagePlus size={16} /> Add Product</Link>
      </div>

      {loading ? (
        <div className="card space-y-3 p-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-cream-dark" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={products.length ? 'No matching products' : 'No products yet'}
          message={products.length ? 'Try adjusting your search or filter.' : 'Add your first product to get started.'}
          action={<Link to="/admin/products/new" className="btn-primary">Add Product</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-cream-dark/70 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 font-medium ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {list.map((p) => (
                  <tr key={p.id} className="transition hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || p.colors?.[0]?.images?.[0] || ''}
                          alt=""
                          className="h-14 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.featured && <span className="text-[11px] uppercase tracking-wider text-gold-dark">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{categoryName(p.category)}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">{totalStock(p)} units</td>
                    <td className="px-5 py-3"><StockBadge status={productStatus(p)} /></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/products/${p.id}/edit`} className="btn-outline btn-sm" aria-label={`Edit ${p.name}`}><Pencil size={14} /> Edit</Link>
                        <button onClick={() => setToDelete(p)} className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${p.name}`}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-ink/5 px-5 py-3 text-xs text-ink-soft">Showing {list.length} of {products.length} products</p>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this product?"
        message={toDelete ? `"${toDelete.name}" will be removed from the store and the admin. This can't be undone.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
