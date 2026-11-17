import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  Save,
  ArrowLeft,
  Eye,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function HeroBannerForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    eyebrow: '',
    buttonText: 'Explore Collection',
    buttonLink: '/shop',
    displayOrder: 1,
    isActive: true,
    imageUrl: '',
    fallbackImage: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    async function loadBanner() {
      try {
        setLoading(true);
        const res = await api.heroBanners.getById(id);
        if (isMounted && res.success && res.banner) {
          const b = res.banner;
          setForm({
            title: b.title || '',
            subtitle: b.subtitle || '',
            eyebrow: b.eyebrow || '',
            buttonText: b.buttonText || 'Explore Collection',
            buttonLink: b.buttonLink || '/shop',
            displayOrder: b.displayOrder ?? 1,
            isActive: b.isActive ?? true,
            imageUrl: b.imageUrl || '',
            fallbackImage: b.fallbackImage || '',
          });
          setPreviewUrl(b.imageUrl || '');
        }
      } catch (err) {
        toast(err.message || 'Failed to load banner details', 'error');
        navigate('/admin/banners');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBanner();
    return () => {
      isMounted = false;
    };
  }, [id, isEditing, navigate, toast]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast('Please select an image file (PNG, JPG, WebP).', 'error');
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setForm((f) => ({ ...f, imageUrl: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Banner title / headline is required.';
    if (!selectedFile && !form.imageUrl.trim() && !previewUrl) {
      errs.image = 'Please upload a banner image or enter an image URL.';
    }
    if (!form.buttonText.trim()) errs.buttonText = 'Button text is required.';
    if (!form.buttonLink.trim()) errs.buttonLink = 'Destination link is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      return toast('Please fix the highlighted fields.', 'error');
    }

    setSubmitting(true);
    try {
      let payload;

      if (selectedFile) {
        payload = new FormData();
        payload.append('image', selectedFile);
        payload.append('title', form.title.trim());
        payload.append('subtitle', form.subtitle.trim());
        payload.append('eyebrow', form.eyebrow.trim());
        payload.append('buttonText', form.buttonText.trim());
        payload.append('buttonLink', form.buttonLink.trim());
        payload.append('displayOrder', String(form.displayOrder));
        payload.append('isActive', String(form.isActive));
        if (form.fallbackImage) payload.append('fallbackImage', form.fallbackImage.trim());
      } else {
        payload = {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          eyebrow: form.eyebrow.trim(),
          buttonText: form.buttonText.trim(),
          buttonLink: form.buttonLink.trim(),
          displayOrder: Number(form.displayOrder),
          isActive: Boolean(form.isActive),
          imageUrl: form.imageUrl.trim() || previewUrl,
          fallbackImage: form.fallbackImage ? form.fallbackImage.trim() : null,
        };
      }

      if (isEditing) {
        await api.heroBanners.update(id, payload);
        toast(`Hero banner "${form.title}" updated.`);
      } else {
        await api.heroBanners.create(payload);
        toast(`Hero banner "${form.title}" created.`);
      }

      navigate('/admin/banners');
    } catch (err) {
      toast(err.message || 'Failed to save hero banner', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card space-y-4 p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-cream-dark" />
        <div className="h-64 animate-pulse rounded-2xl bg-cream-dark" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/banners"
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-burgundy transition"
        >
          <ArrowLeft size={16} /> Back to Hero Banners
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/admin/banners" className="btn-outline btn-sm">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary btn-sm">
            <Save size={15} /> {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Publish Banner'}
          </button>
        </div>
      </div>

      {/* Banner Image Section */}
      <div className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Banner Photography</h2>
            <p className="text-xs text-ink-soft mt-1">
              High-resolution landscape imagery (1920×1080 or 16:9 ratio). Uploaded to Cloudinary.
            </p>
          </div>
          {previewUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-gold-dark font-medium">
              <Sparkles size={13} /> Image ready
            </span>
          )}
        </div>

        {/* Image Preview Box */}
        {previewUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink/10 bg-[#140F12] shadow-soft">
            <img
              src={previewUrl}
              alt="Banner Preview"
              className="h-full w-full object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end text-white">
              {form.eyebrow && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold-light font-semibold">
                  {form.eyebrow}
                </p>
              )}
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#FAF6EE]">
                {form.title || 'Express Your Style.'}
              </h3>
              {form.subtitle && (
                <p className="text-xs sm:text-sm text-[#FAF6EE]/80 mt-1 max-w-md">
                  {form.subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline btn-sm absolute right-4 top-4 bg-white/90 backdrop-blur"
            >
              Replace Photo
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition hover:border-burgundy hover:bg-cream-dark/40 ${
              errors.image ? 'border-red-400 bg-red-50/20' : 'border-ink/20'
            }`}
          >
            <UploadCloud size={36} className="text-burgundy" />
            <span className="mt-3 text-sm font-medium text-ink">
              Click to upload a high-resolution banner photo
            </span>
            <span className="text-xs text-ink-soft mt-1">
              PNG, JPG, or WebP up to 5MB · Stored on Cloudinary
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
        {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}

        {/* Or enter direct URL */}
        <div className="pt-2">
          <label className="label" htmlFor="burl">
            Or Paste Image URL (Optional)
          </label>
          <input
            id="burl"
            type="url"
            value={form.imageUrl}
            onChange={(e) => {
              setForm({ ...form, imageUrl: e.target.value });
              if (e.target.value) {
                setPreviewUrl(e.target.value);
                setSelectedFile(null);
              }
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className="input"
          />
        </div>
      </div>

      {/* Content & Copy Section */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-ink">Editorial Content</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="beyebrow">
              Category Eyebrow Tag
            </label>
            <input
              id="beyebrow"
              type="text"
              value={form.eyebrow}
              onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
              placeholder="e.g. Men's Collection, New Arrival"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="btitle">
              Main Headline <span className="text-burgundy">*</span>
            </label>
            <input
              id="btitle"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Express Your Style."
              className={`input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="bsubtitle">
              Supporting Subtitle / Description
            </label>
            <textarea
              id="bsubtitle"
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Everyday comfort. Extraordinary prints."
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Action Button & Destination */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-ink">Call-to-Action & Target</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bbtn">
              Button Label <span className="text-burgundy">*</span>
            </label>
            <input
              id="bbtn"
              type="text"
              required
              value={form.buttonText}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              placeholder="e.g. Explore Men's Collection"
              className={`input ${errors.buttonText ? 'input-error' : ''}`}
            />
            {errors.buttonText && (
              <p className="text-xs text-red-600 mt-1">{errors.buttonText}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="blink">
              Destination URL <span className="text-burgundy">*</span>
            </label>
            <input
              id="blink"
              type="text"
              required
              value={form.buttonLink}
              onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
              placeholder="e.g. /shop/mens or /shop/tote-bags"
              className={`input ${errors.buttonLink ? 'input-error' : ''}`}
            />
            {errors.buttonLink && (
              <p className="text-xs text-red-600 mt-1">{errors.buttonLink}</p>
            )}
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-ink">Display & Visibility</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="border">
              Display Sequence Order
            </label>
            <input
              id="border"
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(e) =>
                setForm({ ...form, displayOrder: Math.max(0, parseInt(e.target.value) || 0) })
              }
              className="input"
            />
            <p className="text-xs text-ink-soft mt-1">
              Banners appear on the homepage carousel ordered from lowest to highest number.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <label className="label">Visibility Status</label>
            <label className="flex cursor-pointer items-center gap-3 mt-1">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative h-7 w-12 rounded-full transition ${
                  form.isActive ? 'bg-burgundy' : 'bg-ink/20'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.isActive ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-ink">
                {form.isActive ? (
                  <span className="text-emerald-700">Active (Visible on Homepage)</span>
                ) : (
                  <span className="text-ink-soft">Inactive (Hidden from Homepage)</span>
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Link to="/admin/banners" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className="btn-primary">
          <Save size={16} /> {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Publish Banner'}
        </button>
      </div>
    </form>
  );
}
