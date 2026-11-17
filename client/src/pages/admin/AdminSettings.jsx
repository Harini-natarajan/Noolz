import { useRef, useState } from 'react';
import { RotateCcw, Save, Upload } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { fileToDataUrl } from '../../services/storage';

export default function AdminSettings() {
  const { settings, updateSettings, resetData } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required.';
    if (!/^\d{8,15}$/.test(form.whatsappNumber.replace(/\D/g, ''))) e.whatsappNumber = 'Enter a valid number with country code (8–15 digits).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!/^https?:\/\/.+/i.test(form.instagram)) e.instagram = 'Enter a full URL starting with https://';
    return e;
  };

  const save = (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return toast('Please fix the highlighted fields.', 'error');
    updateSettings({
      ...form,
      businessName: form.businessName.trim(),
      whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
    });
    toast('Settings saved. The website has been updated.');
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await fileToDataUrl(file, 600, 0.9);
      setForm((f) => ({ ...f, logo: url }));
    } catch {
      toast('Could not read that image.', 'error');
    }
  };

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errors[k]}</p>;
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;

  return (
    <form onSubmit={save} noValidate className="mx-auto max-w-3xl space-y-6">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Business logo</h2>
        <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex h-28 w-48 items-center justify-center rounded-2xl border border-ink/10 bg-cream p-3">
            <img src={form.logo || '/logo.png'} alt="Logo preview" className="max-h-full max-w-full object-contain mix-blend-multiply" />
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onLogo} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline btn-sm"><Upload size={14} /> Upload new logo</button>
            {form.logo !== '/logo.png' && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, logo: '/logo.png' }))} className="btn-outline btn-sm ml-2">Use default</button>
            )}
            <p className="text-xs text-ink-soft">PNG or JPG. Logos with a white background blend into the cream theme.</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Business details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="bn">Business name</label>
            <input id="bn" className={cls('businessName')} value={form.businessName} onChange={set('businessName')} />
            {err('businessName')}
          </div>
          <div>
            <label className="label" htmlFor="wa">WhatsApp number</label>
            <input id="wa" inputMode="numeric" className={cls('whatsappNumber')} value={form.whatsappNumber} onChange={set('whatsappNumber')} placeholder="919585123004" />
            <p className="mt-1 text-xs text-ink-soft">Country code + number, digits only. Used for all orders.</p>
            {err('whatsappNumber')}
          </div>
          <div>
            <label className="label" htmlFor="em">Contact email</label>
            <input id="em" type="email" className={cls('email')} value={form.email} onChange={set('email')} />
            {err('email')}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ig">Instagram URL</label>
            <input id="ig" className={cls('instagram')} value={form.instagram} onChange={set('instagram')} />
            {err('instagram')}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ad">Business address</label>
            <input id="ad" className="input" value={form.address} onChange={set('address')} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50">
          <RotateCcw size={14} /> Reset demo data
        </button>
        <button type="submit" className="btn-primary"><Save size={16} /> Save Settings</button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        message="Products, stock history and settings will be restored to the original sample data."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetData();
          setConfirmReset(false);
          toast('Demo data restored.', 'info');
          setTimeout(() => window.location.reload(), 400);
        }}
      />
    </form>
  );
}
