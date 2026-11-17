import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Plus, Save, Star, Trash2, UploadCloud, X } from 'lucide-react';
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
  colors: [COLOR_PRESETS[0], COLOR_PRESETS[1]],
  featured: false,
  lowStockThreshold: 5,
  stock: {},
  design: 'sunrise',
});

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

  const [form, setForm] = useState(() => (existing ? structuredClone(existing) : blank()));
  const [defaultQty, setDefaultQty] = useState(10);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState({ name: '', hex: '#8A0B45' });

  useEffect(() => {
    setForm(existing ? structuredClone(existing) : blank());
    setErrors({});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const qtyOf = (c, s) => form.stock[variantKey(c, s)] ?? 0;
  const setQty = (c, s, v) =>
    set({ stock: { ...form.stock, [variantKey(c, s)]: Math.max(0, Math.floor(Number(v) || 0)) } });

  const sizeChoices = useMemo(
    () => Array.from(new Set([...SIZE_OPTIONS[form.category], ...form.sizes])),
    [form.category, form.sizes]
  );

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
    const colors = has ? form.colors.filter((x) => x.name !== c.name) : [...form.colors, c];
    set({ colors, stock: withDefaults(colors, form.sizes, form.stock) });
  };
  const addCustomColor = () => {
    const name = customColor.name.trim();
    if (!name) return toast('Give the colour a name.', 'error');
    if (form.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return toast('That colour already exists.', 'error');
    const colors = [...form.colors, { name, hex: customColor.hex }];
    set({ colors, stock: withDefaults(colors, form.sizes, form.stock) });
    setCustomColor({ name: '', hex: '#8A0B45' });
  };

  const applyAll = () => {
    const stock = { ...form.stock };
    form.colors.forEach((c) => form.sizes.forEach((s) => (stock[variantKey(c.name, s)] = Math.max(0, Math.floor(Number(defaultQty) || 0)))));
    set({ stock });
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await api.products.uploadImages(files);
      if (res.success && res.images?.length) {
        set({ images: [...form.images, ...res.images] });
        toast(`${res.images.length} image(s) uploaded to Cloudinary.`);
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback to data URL:', err);
      try {
        const urls = await Promise.all(files.map((f) => fileToDataUrl(f)));
        set({ images: [...form.images, ...urls] });
      } catch {
        toast('One of the images could not be read.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };
  const makeCover = (i) => set({ images: [form.images[i], ...form.images.filter((_, j) => j !== i)] });
  const removeImg = (i) => set({ images: form.images.filter((_, j) => j !== i) });
  const useSample = () =>
    set({ images: makeImages({ kind: form.category, color: form.colors[0]?.hex ?? '#FFFFFF', design: form.design }) });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Enter a product name (min 3 characters).';
    if (form.description.trim().length < 10) e.description = 'Add a short description (min 10 characters).';
    if (!(Number(form.price) > 0)) e.price = 'Enter a price greater than 0.';
    if (!form.images.length) e.images = 'Upload at least one image (or use a sample mockup).';
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
    const data = {
      ...form,
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

      <Section title="Images" hint="The first image is the cover. Large portrait images (4:5) look best.">
        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition hover:border-burgundy hover:bg-cream-dark/50 ${errors.images ? 'border-red-400' : 'border-ink/20'}`}>
          <UploadCloud size={30} className="text-burgundy" />
          <span className="mt-2 text-sm font-medium">{uploading ? 'Processing…' : 'Click to upload images'}</span>
          <span className="text-xs text-ink-soft">PNG or JPG · multiple files allowed</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
        </label>
        {err('images')}
        {form.images.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {form.images.map((src, i) => (
              <li key={i} className="group relative overflow-hidden rounded-xl border border-ink/10 bg-cream-dark">
                <img src={src} alt={`Preview ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-burgundy px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream">Cover</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/70 to-transparent p-2 pt-6 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  {i !== 0 && <button type="button" onClick={() => makeCover(i)} title="Make cover" className="rounded-full bg-white/90 p-1.5 hover:bg-white"><Star size={14} /></button>}
                  <button type="button" onClick={() => removeImg(i)} title="Remove" className="rounded-full bg-white/90 p-1.5 text-red-600 hover:bg-white"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-cream-dark/70 p-4 text-sm">
          <ImagePlus size={18} className="text-gold-dark" />
          <span className="text-ink-soft">No photos yet? Generate sample mockups:</span>
          <select className="input !w-auto !py-1.5" value={form.design} onChange={(e) => set({ design: e.target.value })} aria-label="Sample design">
            {DESIGN_KEYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button type="button" onClick={useSample} className="btn-outline btn-sm">Use sample images</button>
        </div>
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
    </form>
  );
}
