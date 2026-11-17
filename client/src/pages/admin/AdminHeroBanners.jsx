import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/ui';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.heroBanners.getAll();
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
      }
    } catch (err) {
      toast(err.message || 'Failed to load hero banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleActive = async (banner) => {
    const updatedStatus = !banner.isActive;
    setActionLoading(banner.id || banner._id);

    try {
      const res = await api.heroBanners.update(banner.id || banner._id, {
        isActive: updatedStatus,
      });

      if (res.success) {
        setBanners((list) =>
          list.map((b) =>
            (b.id || b._id) === (banner.id || banner._id)
              ? { ...b, isActive: updatedStatus }
              : b
          )
        );
        toast(
          `Banner "${banner.title}" is now ${updatedStatus ? 'active' : 'inactive'}.`
        );
      }
    } catch (err) {
      toast(err.message || 'Could not update banner status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const targetId = toDelete.id || toDelete._id;

    try {
      const res = await api.heroBanners.delete(targetId);
      if (res.success) {
        setBanners((list) => list.filter((b) => (b.id || b._id) !== targetId));
        toast(`Banner "${toDelete.title}" deleted.`);
      }
    } catch (err) {
      toast(err.message || 'Failed to delete banner', 'error');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-soft">
            Manage auto-scrolling promotional hero banners shown at the top of the homepage.
          </p>
        </div>
        <Link to="/admin/banners/new" className="btn-primary">
          <Plus size={16} /> Add New Banner
        </Link>
      </div>

      {loading ? (
        <div className="card space-y-4 p-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-cream-dark" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No Hero Banners"
          message="Add your first banner to feature it on the homepage carousel."
          action={
            <Link to="/admin/banners/new" className="btn-primary">
              <Plus size={16} /> Add New Banner
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-cream-dark/70 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Banner Preview</th>
                  <th className="px-5 py-3.5 font-medium">Headline & Copy</th>
                  <th className="px-5 py-3.5 font-medium">Button / Link</th>
                  <th className="px-4 py-3.5 font-medium text-center">Order</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {banners.map((b) => {
                  const id = b.id || b._id;
                  const isBusy = actionLoading === id;

                  return (
                    <tr
                      key={id}
                      className={`transition hover:bg-cream/70 ${
                        !b.isActive ? 'bg-cream-dark/30 opacity-75' : ''
                      }`}
                    >
                      {/* Image Preview */}
                      <td className="px-5 py-3.5">
                        <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-ink/10 bg-black/10 shadow-soft">
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              if (b.fallbackImage && e.currentTarget.src !== b.fallbackImage) {
                                e.currentTarget.src = b.fallbackImage;
                              }
                            }}
                          />
                        </div>
                      </td>

                      {/* Title & Copy */}
                      <td className="px-5 py-3.5 max-w-xs">
                        {b.eyebrow && (
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-gold-dark">
                            {b.eyebrow}
                          </span>
                        )}
                        <p className="font-serif text-base font-semibold leading-snug text-ink">
                          {b.title}
                        </p>
                        {b.subtitle && (
                          <p className="line-clamp-1 text-xs text-ink-soft mt-0.5">
                            {b.subtitle}
                          </p>
                        )}
                      </td>

                      {/* CTA & Link */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream-dark px-2.5 py-1 text-xs font-medium text-ink">
                          {b.buttonText || 'Explore'}
                        </span>
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                          <ExternalLink size={12} /> {b.buttonLink}
                        </p>
                      </td>

                      {/* Display Order */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-2.5 py-0.5 text-xs font-semibold text-ink">
                          <ArrowUpDown size={11} className="text-ink-soft" />
                          {b.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(b)}
                          disabled={isBusy}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                            b.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-ink/10 text-ink-soft hover:bg-ink/20'
                          }`}
                          title={b.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {b.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{b.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/banners/${id}/edit`}
                            className="btn-outline btn-sm"
                            aria-label={`Edit ${b.title}`}
                          >
                            <Pencil size={14} /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(b)}
                            className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${b.title}`}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-ink/5 px-5 py-3 text-xs text-ink-soft flex items-center justify-between">
            <span>
              {banners.length} total banner{banners.length !== 1 ? 's' : ''} ·{' '}
              {banners.filter((b) => b.isActive).length} active on homepage
            </span>
            <span className="flex items-center gap-1 text-gold-dark font-medium">
              <Sparkles size={13} /> Displayed in ascending order by priority
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete Hero Banner?"
        message={
          toDelete
            ? `Are you sure you want to delete "${toDelete.title}"? This banner will be permanently removed from the homepage.`
            : ''
        }
        confirmLabel="Delete Banner"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
