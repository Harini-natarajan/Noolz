import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ImagePlus,
  Plus,
  Save,
  Star,
  Trash2,
  UploadCloud,
  X,
  Eye,
  ArrowLeft,
  ArrowRight,
  Palette,
} from 'lucide-react';
import { COLOR_PRESETS, CATEGORIES, SIZE_OPTIONS } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/ui';
import { fileToDataUrl } from '../../services/storage';
import api from '../../services/api';
import { DESIGN_KEYS, makeImages } from '../../utils/mockup';
import { variantKey } from '../../utils/stock';

const blank = () => ({
  name: '',
  category: 'men',
  subcategory: 'normal-fit',
  description: '',
  price: '',
  images: [],
  sizes: [...SIZE_OPTIONS.men],
  colors: [
    { ...COLOR_PRESETS[0], images: [] },
    { ...COLOR_PRESETS[1], images: [] },
  ],
  featured: false,
  lowStockThreshold: 5,
  stock: {},
  design: 'sunrise',
});

const normalizeProduct = (p) => {
  if (!p) return blank();
  const cloned = structuredClone(p);
  // Ensure each color has an images array
  cloned.colors = (cloned.colors || []).map((c, idx) => {
    if (Array.isArray(c.images) && c.images.length > 0) {
      return c;
    }
    // Backward compatibility: If no color has images, assign existing product.images to the first color
    if (idx === 0 && Array.isArray(cloned.images) && cloned.images.length > 0) {
      return { ...c, images: [...cloned.images] };
    }
    return { ...c, images: [] };
  });

  const allColorImages = cloned.colors.flatMap((c) => c.images || []);
  if (!cloned.images?.length && allColorImages.length) {
    cloned.images = allColorImages;
  }
  return cloned;
};

const Section = ({ title, children, hint }) => (
  <section className="card p-6">
    <h2 className="text-2xl font-semibold">{title}</h2>
    {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useStore();
  const toast = useToast();
  const existing = products.find((p) => p.id === id);

  const [form, setForm] = useState(() => normalizeProduct(existing));
  const [activeColorTab, setActiveColorTab] = useState(() => form.colors?.[0]?.name || COLOR_PRESETS[0].name);
  const [previewImage, setPreviewImage] = useState(null);
  const [defaultQty, setDefaultQty] = useState(10);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState({ name: '', hex: '#8A0B45' });

  useEffect(() => {
    const normalized = normalizeProduct(existing);
    setForm(normalized);
    setActiveColorTab(normalized.colors[0]?.name || '');
    setErrors({});
  }, [id, existing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep activeColorTab valid when colors change
  useEffect(() => {
    if (form.colors.length > 0 && !form.colors.some((c) => c.name === activeColorTab)) {
      setActiveColorTab(form.colors[0].name);
    }
  }, [form.colors, activeColorTab]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const qtyOf = (c, s) => form.stock[variantKey(c, s)] ?? 0;
  const setQty = (c, s, v) =>
    set({ stock: { ...form.stock, [variantKey(c, s)]: Math.max(0, Math.floor(Number(v) || 0)) } });

  const sizeChoices = useMemo(
    () => Array.from(new Set([...SIZE_OPTIONS[form.category], ...form.sizes])),
    [form.category, form.sizes]
  );

  const updateColorImages = (colorName, newImages) => {
    const updatedColors = form.colors.map((c) =>
      c.name === colorName ? { ...c, images: newImages } : c
    );
    const flatImages = updatedColors.flatMap((c) => c.images || []);
    set({ colors: updatedColors, images: flatImages });
  };

  const onColorFiles = async (colorName, e) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await api.products.uploadImages(files);
      if (res.success && res.images?.length) {
        const colorObj = form.colors.find((c) => c.name === colorName);
        const existingImgs = colorObj?.images || [];
        updateColorImages(colorName, [...existingImgs, ...res.images]);
        toast(`${res.images.length} image(s) uploaded for ${colorName}.`);
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback to data URL:', err);
      try {
        const urls = await Promise.all(files.map((f) => fileToDataUrl(f)));
        const colorObj = form.colors.find((c) => c.name === colorName);
        const existingImgs = colorObj?.images || [];
        updateColorImages(colorName, [...existingImgs, ...urls]);
        toast(`${urls.length} image(s) processed for ${colorName}.`);
      } catch {
        toast('One of the images could not be read.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const makeColorPrimary = (colorName, imgIndex) => {
    const colorObj = form.colors.find((c) => c.name === colorName);
    if (!colorObj || !colorObj.images) return;
    const imgs = colorObj.images;
    const reordered = [imgs[imgIndex], ...imgs.filter((_, i) => i !== imgIndex)];
    updateColorImages(colorName, reordered);
  };

  const moveColorImage = (colorName, fromIndex, toIndex) => {
    const colorObj = form.colors.find((c) => c.name === colorName);
    if (!colorObj || !colorObj.images) return;
    const imgs = [...colorObj.images];
    if (toIndex < 0 || toIndex >= imgs.length) return;
    const [moved] = imgs.splice(fromIndex, 1);
    imgs.splice(toIndex, 0, moved);
    updateColorImages(colorName, imgs);
  };

  const removeColorImg = (colorName, imgIndex) => {
    const colorObj = form.colors.find((c) => c.name === colorName);
    if (!colorObj || !colorObj.images) return;
    const updated = colorObj.images.filter((_, i) => i !== imgIndex);
    updateColorImages(colorName, updated);
  };

  const useSampleForColor = (colorName) => {
    const colorObj = form.colors.find((c) => c.name === colorName);
    if (!colorObj) return;
    const sampleImgs = makeImages({
      kind: form.category,
      color: colorObj.hex || '#FFFFFF',
      design: form.design,
    });
    updateColorImages(colorName, sampleImgs);
    toast(`Generated sample mockups for ${colorName}.`);
  };

  const useSampleForAllColors = () => {
    const updatedColors = form.colors.map((c) => ({
      ...c,
      images: makeImages({
        kind: form.category,
        color: c.hex || '#FFFFFF',
        design: form.design,
      }),
    }));
    const flatImages = updatedColors.flatMap((c) => c.images);
    set({ colors: updatedColors, images: flatImages });
    toast('Generated sample mockups for all colours.');
  };

  if (editing && !existing)
    return <EmptyState title="Product not found" message="It may have been deleted." action={<Link to="/admin/products" className="btn-primary">Back to products</Link>} />;

  const changeCategory = (category) => {
    const sub = CATEGORIES.find((c) => c.slug === category)?.subcategories?.[0]?.slug || null;
    if (editing) return set({ category, subcategory: sub });
    set({ category, subcategory: sub, sizes: [...SIZE_OPTIONS[category]], stock: {} });
  };

  const withDefaults = (colors, sizes, stock) => {
    const next = { ...stock };
    colors.forEach((c) => sizes.forEach((s) => {
      const k = variantKey(c.name, s);
      if (next[k] === undefined) next[k] = defaultQty;
    }));
    return next;
  };

  const toggleSize = (s) => {
    const sizes = form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s];
    set({ sizes, stock: withDefaults(form.colors, sizes, form.stock) });
  };
  const addCustomSize = () => {
    const v = customSize.trim();
    if (!v || form.sizes.includes(v)) return setCustomSize('');
    const sizes = [...form.sizes, v];
    set({ sizes, stock: withDefaults(form.colors, sizes, form.stock) });
    setCustomSize('');
  };
  const toggleColor = (c) => {
    const has = form.colors.some((x) => x.name === c.name);
    const colors = has
      ? form.colors.filter((x) => x.name !== c.name)
      : [...form.colors, { name: c.name, hex: c.hex, images: c.images || [] }];
    const flatImages = colors.flatMap((col) => col.images || []);
    set({ colors, images: flatImages, stock: withDefaults(colors, form.sizes, form.stock) });
    if (!has) setActiveColorTab(c.name);
  };
  const addCustomColor = () => {
    const name = customColor.name.trim();
    if (!name) return toast('Give the colour a name.', 'error');
    if (form.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return toast('That colour already exists.', 'error');
    const colors = [...form.colors, { name, hex: customColor.hex, images: [] }];
    const flatImages = colors.flatMap((col) => col.images || []);
    set({ colors, images: flatImages, stock: withDefaults(colors, form.sizes, form.stock) });
    setActiveColorTab(name);
    setCustomColor({ name: '', hex: '#8A0B45' });
  };

  const applyAll = () => {
    const stock = { ...form.stock };
    form.colors.forEach((c) => form.sizes.forEach((s) => (stock[variantKey(c.name, s)] = Math.max(0, Math.floor(Number(defaultQty) || 0)))));
    set({ stock });
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Enter a product name (min 3 characters).';
    if (form.description.trim().length < 10) e.description = 'Add a short description (min 10 characters).';
    if (!(Number(form.price) > 0)) e.price = 'Enter a price greater than 0.';
    const totalColorImages = (form.colors || []).reduce((sum, c) => sum + (c.images?.length || 0), 0);
    if (!totalColorImages && !form.images?.length) e.images = 'Upload at least one image for your colors (or generate sample mockups).';
    if (!form.sizes.length) e.sizes = 'Select at least one size.';
    if (!form.colors.length) e.colors = 'Select at least one colour.';
    if (!(Number(form.lowStockThreshold) >= 0)) e.threshold = 'Threshold must be 0 or more.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return toast('Please fix the highlighted fields.', 'error');

    // Only keep stock for current variants.
    const stock = {};
    form.colors.forEach((c) => form.sizes.forEach((s) => (stock[variantKey(c.name, s)] = qtyOf(c.name, s))));
    const flatImages = form.colors.flatMap((c) => c.images || []);
    const data = {
      ...form,
      images: flatImages.length ? flatImages : form.images,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      lowStockThreshold: Math.floor(Number(form.lowStockThreshold)),
      stock,
    };
    try {
      if (editing) {
        await updateProduct(id, data);
        toast(`"${data.name}" updated.`);
      } else {
        await addProduct(data);
        toast(`"${data.name}" added to the store.`);
      }
      navigate('/admin/products');
    } catch {
      // Error is surfaced by StoreContext toast
    }
  };

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errors[k]}</p>;
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;
  const activeColorObj = form.colors.find((c) => c.name === activeColorTab) || form.colors[0];
  const activeColorImages = activeColorObj?.images || [];

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-5xl space-y-6">
      <p className="text-sm text-ink-soft">{editing ? `Editing “${existing.name}”` : 'Fill in the details below to publish a new product.'}</p>

      <Section title="Basic information">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pname">Product name</label>
            <input id="pname" className={cls('name')} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Golden Hour Tee" />
            {err('name')}
          </div>
          <div>
            <label className="label" htmlFor="pcat">Category</label>
            <select id="pcat" className="input" value={form.category} onChange={(e) => changeCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          {CATEGORIES.find((c) => c.slug === form.category)?.subcategories?.length > 0 && (
            <div>
              <label className="label" htmlFor="psub">Subcategory / Fit</label>
              <select id="psub" className="input" value={form.subcategory || ''} onChange={(e) => set({ subcategory: e.target.value })}>
                {CATEGORIES.find((c) => c.slug === form.category).subcategories.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label" htmlFor="pprice">Price (₹)</label>
            <input id="pprice" type="number" min="0" className={cls('price')} value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="899" />
            {err('price')}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pdesc">Description</label>
            <textarea id="pdesc" rows={4} className={cls('description')} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Fabric, fit, print details…" />
            {err('description')}
          </div>
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <button type="button" role="switch" aria-checked={form.featured} onClick={() => set({ featured: !form.featured })}
              className={`relative h-7 w-12 rounded-full transition ${form.featured ? 'bg-burgundy' : 'bg-ink/20'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${form.featured ? 'left-6' : 'left-1'}`} />
            </button>
            <span className="text-sm font-medium">Featured product <span className="font-normal text-ink-soft">— shown on the homepage</span></span>
          </label>
        </div>
      </Section>

      <Section
        title="Color-Specific Images"
        hint="Upload and manage images separately for each colour variant. The first image in each colour is its cover."
      >
        {form.colors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 p-8 text-center">
            <Palette className="mx-auto text-ink-soft" size={32} />
            <p className="mt-2 text-sm text-ink-soft">
              Select or add at least one colour below in &ldquo;Sizes & colours&rdquo; to upload color-specific images.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Color Tabs */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Select colour to manage images
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {form.colors.map((c) => {
                  const isActive = activeColorObj?.name === c.name;
                  const count = c.images?.length || 0;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setActiveColorTab(c.name)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'border-burgundy bg-burgundy text-cream shadow-sm'
                          : 'border-ink/20 bg-white/80 text-ink hover:border-burgundy'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive ? 'bg-cream/20 text-cream' : 'bg-ink/10 text-ink-soft'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Color Image Management Panel */}
            {activeColorObj && (
              <div className="rounded-2xl border border-ink/10 bg-cream/40 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded-full border border-ink/20 shadow-sm"
                      style={{ backgroundColor: activeColorObj.hex }}
                    />
                    <h3 className="text-lg font-semibold text-ink">
                      {activeColorObj.name} Images
                    </h3>
                    <span className="text-xs text-ink-soft">
                      ({activeColorImages.length} image{activeColorImages.length === 1 ? '' : 's'})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => useSampleForColor(activeColorObj.name)}
                      className="btn-outline btn-sm text-xs"
                      title={`Generate mockups for ${activeColorObj.name}`}
                    >
                      <ImagePlus size={14} className="text-gold-dark" />
                      Sample for {activeColorObj.name}
                    </button>
                    <button
                      type="button"
                      onClick={useSampleForAllColors}
                      className="btn-outline btn-sm text-xs"
                      title="Generate mockups for all colors at once"
                    >
                      Sample for All Colours
                    </button>
                  </div>
                </div>

                {/* Upload Box for Active Color */}
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-7 text-center transition hover:border-burgundy hover:bg-cream-dark/50 ${
                    errors.images ? 'border-red-400' : 'border-ink/20'
                  }`}
                >
                  <UploadCloud size={28} className="text-burgundy" />
                  <span className="mt-2 text-sm font-medium">
                    {uploading ? 'Processing…' : `Click to upload images for ${activeColorObj.name}`}
                  </span>
                  <span className="text-xs text-ink-soft">
                    PNG, JPG, WEBP · multiple files allowed
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => onColorFiles(activeColorObj.name, e)}
                  />
                </label>

                {/* Active Color Thumbnails Grid */}
                {activeColorImages.length > 0 ? (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-soft">
                      {activeColorObj.name} Gallery ({activeColorImages.length}) — First image is the primary cover
                    </p>
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {activeColorImages.map((src, i) => (
                        <li
                          key={i}
                          className="group relative overflow-hidden rounded-xl border border-ink/10 bg-cream-dark shadow-sm"
                        >
                          <img
                            src={src}
                            alt={`${activeColorObj.name} ${i + 1}`}
                            className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          {i === 0 && (
                            <span className="absolute left-2 top-2 z-10 rounded-full bg-burgundy px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream shadow">
                              Cover
                            </span>
                          )}

                          {/* Quick action bar */}
                          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-ink/80 via-ink/50 to-transparent p-2 pt-6 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                            {/* Reorder Arrows */}
                            <div className="flex gap-1">
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveColorImage(activeColorObj.name, i, i - 1)}
                                  title="Move earlier"
                                  className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white"
                                >
                                  <ArrowLeft size={13} />
                                </button>
                              )}
                              {i < activeColorImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveColorImage(activeColorObj.name, i, i + 1)}
                                  title="Move later"
                                  className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white"
                                >
                                  <ArrowRight size={13} />
                                </button>
                              )}
                            </div>

                            {/* Cover, Preview, Delete */}
                            <div className="flex gap-1">
                              {i !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => makeColorPrimary(activeColorObj.name, i)}
                                  title="Set as cover for this color"
                                  className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white hover:text-burgundy"
                                >
                                  <Star size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setPreviewImage(src)}
                                title="Preview full image"
                                className="rounded-full bg-white/90 p-1.5 text-ink transition hover:bg-white"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeColorImg(activeColorObj.name, i)}
                                title="Remove image"
                                className="rounded-full bg-white/90 p-1.5 text-red-600 transition hover:bg-white"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-ink-soft">
                    No images uploaded for {activeColorObj.name} yet. Upload above or generate a sample mockup.
                  </p>
                )}
              </div>
            )}

            {/* All-Colors Overview Grid */}
            {form.colors.length > 1 && (
              <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  All Color Variants Overview
                </p>
                <div className="space-y-3">
                  {form.colors.map((c) => (
                    <div
                      key={c.name}
                      onClick={() => setActiveColorTab(c.name)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition hover:bg-cream-dark/50 ${
                        activeColorObj?.name === c.name ? 'bg-cream-dark/60 ring-1 ring-burgundy/30' : 'bg-cream/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-5 w-5 rounded-full border border-ink/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-sm font-medium text-ink">{c.name}</span>
                        <span className="text-xs text-ink-soft">
                          {c.images?.length || 0} image{(c.images?.length || 0) === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="flex max-w-[50%] items-center gap-1.5 overflow-x-auto py-1">
                        {(c.images || []).slice(0, 5).map((imgSrc, idx) => (
                          <img
                            key={idx}
                            src={imgSrc}
                            alt=""
                            className="h-10 w-8 rounded border border-ink/10 object-cover"
                          />
                        ))}
                        {(c.images?.length || 0) > 5 && (
                          <span className="text-xs font-semibold text-ink-soft">
                            +{(c.images?.length || 0) - 5}
                          </span>
                        )}
                        {(!c.images || c.images.length === 0) && (
                          <span className="text-xs italic text-red-500">No images</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Mockup Preset Selector */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-cream-dark/70 p-4 text-sm">
              <ImagePlus size={18} className="text-gold-dark" />
              <span className="text-ink-soft">Design preset for mockups:</span>
              <select
                className="input !w-auto !py-1.5"
                value={form.design}
                onChange={(e) => set({ design: e.target.value })}
                aria-label="Sample design"
              >
                {DESIGN_KEYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {err('images')}
          </div>
        )}
      </Section>

      <Section title="Sizes & colours" hint="Add or remove options. Stock rows below update automatically.">
        <p className="label">Available sizes</p>
        <div className="flex flex-wrap gap-2">
          {sizeChoices.map((s) => {
            const on = form.sizes.includes(s);
            return (
              <button type="button" key={s} onClick={() => toggleSize(s)} aria-pressed={on}
                className={`rounded-xl border px-4 py-2 text-sm transition ${on ? 'border-burgundy bg-burgundy text-cream' : 'border-ink/20 bg-white/70 hover:border-burgundy'}`}>
                {s}
              </button>
            );
          })}
          <div className="flex gap-2">
            <input className="input !w-28 !py-2" placeholder="Custom" value={customSize} onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())} aria-label="Custom size" />
            <button type="button" onClick={addCustomSize} className="btn-outline btn-sm" aria-label="Add size"><Plus size={14} /></button>
          </div>
        </div>
        {err('sizes')}

        <p className="label mt-6">Available colours</p>
        <div className="flex flex-wrap gap-2">
          {[...COLOR_PRESETS, ...form.colors.filter((c) => !COLOR_PRESETS.some((p) => p.name === c.name))].map((c) => {
            const on = form.colors.some((x) => x.name === c.name);
            return (
              <button type="button" key={c.name} onClick={() => toggleColor(c)} aria-pressed={on}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-4 text-sm transition ${on ? 'border-burgundy bg-burgundy/10 text-burgundy' : 'border-ink/20 bg-white/70 hover:border-burgundy'}`}>
                <span className="h-5 w-5 rounded-full border border-ink/20" style={{ background: c.hex }} />
                {c.name}
                {on && <X size={12} />}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="color" value={customColor.hex} onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-white p-1" aria-label="Pick colour" />
          <input className="input !w-44" placeholder="Custom colour name" value={customColor.name} onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())} />
          <button type="button" onClick={addCustomColor} className="btn-outline btn-sm"><Plus size={14} /> Add colour</button>
        </div>
        {err('colors')}
      </Section>

      <Section title="Stock" hint="Set the quantity for each colour and size combination.">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="dq">Stock quantity (per variant)</label>
            <input id="dq" type="number" min="0" className="input" value={defaultQty} onChange={(e) => setDefaultQty(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="thr">Low-stock threshold</label>
            <input id="thr" type="number" min="0" className={cls('threshold')} value={form.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: e.target.value })} />
            {err('threshold')}
          </div>
          <button type="button" onClick={applyAll} className="btn-outline">Apply to all variants</button>
        </div>

        {form.colors.length && form.sizes.length ? (
          <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-cream-dark/70 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Colour</th>
                  {form.sizes.map((s) => <th key={s} className="px-2 py-3 font-medium">{s}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {form.colors.map((c) => (
                  <tr key={c.name}>
                    <td className="px-4 py-2"><span className="flex items-center gap-2 whitespace-nowrap"><span className="h-4 w-4 rounded-full border border-ink/20" style={{ background: c.hex }} />{c.name}</span></td>
                    {form.sizes.map((s) => (
                      <td key={s} className="px-2 py-2">
                        <input type="number" min="0" aria-label={`${c.name} ${s} stock`} className="input !w-20 !px-2 !py-1.5 text-center" value={qtyOf(c.name, s)} onChange={(e) => setQty(c.name, s, e.target.value)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">Select at least one size and colour to manage stock.</p>
        )}
      </Section>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-ink/10 bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Link to="/admin/products" className="btn-outline">Cancel</Link>
        <button type="submit" className="btn-primary"><Save size={16} /> {editing ? 'Save Changes' : 'Save Product'}</button>
      </div>

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-xl overflow-hidden rounded-2xl bg-cream shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/90"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Full preview"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </form>
  );
}
