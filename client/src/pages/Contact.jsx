import { useState } from 'react';
import { Clock, Instagram, Mail, MapPin, Send } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { openWhatsApp } from '../utils/whatsapp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name (at least 2 characters).';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters.';
  return e;
}

export default function Contact() {
  const { settings } = useStore();
  const toast = useToast();
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);

  const change = (k) => (e) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) return toast('Please fix the highlighted fields.', 'error');
    setSending(true);
    // Frontend-only: simulate a network request.
    setTimeout(() => {
      setSending(false);
      setValues({ name: '', email: '', message: '' });
      setTouched({});
      setErrors({});
      toast("Thank you! Your message has been sent — we'll reply soon.");
    }, 900);
  };

  const field = (k) => `input ${touched[k] && errors[k] ? 'input-error' : ''}`;
  const err = (k) => touched[k] && errors[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errors[k]}</p>;

  const info = [
    [MapPin, 'Visit us', settings.address],
    [Mail, 'Email', <a key="m" href={`mailto:${settings.email}`} className="hover:text-burgundy">{settings.email}</a>],
    [Instagram, 'Instagram', <a key="i" href={settings.instagram} target="_blank" rel="noreferrer" className="break-all hover:text-burgundy">@{settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '')}</a>],
    [Clock, 'Hours', settings.hours],
  ];

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-12 text-center">
        <p className="eyebrow mb-2">Get in touch</p>
        <h1 className="text-5xl font-semibold sm:text-6xl">We'd love to hear from you</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">Questions, custom print requests or bulk orders — message us any time.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-3xl bg-burgundy p-8 text-cream">
            <h2 className="text-3xl font-semibold">Chat with us on WhatsApp</h2>
            <p className="mt-2 text-sm text-cream/75">The fastest way to order, ask about sizes or discuss a custom design.</p>
            <button
              onClick={() => openWhatsApp(settings.whatsappNumber, `Hello ${settings.businessName}! I'd like to know more.`)}
              className="btn-whatsapp mt-6"
            >
              <WhatsAppIcon size={18} /> Message +91 9585123004
            </button>
          </div>
          <ul className="card divide-y divide-ink/5">
            {info.map(([Icon, label, value]) => (
              <li key={label} className="flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark"><Icon size={20} /></span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">{label}</p>
                  <p className="mt-0.5 text-sm">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} noValidate className="card p-6 sm:p-8">
          <h2 className="text-3xl font-semibold">Send us a message</h2>
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="label">Name</label>
              <input id="name" className={field('name')} value={values.name} onChange={change('name')} onBlur={blur('name')} placeholder="Your full name" />
              {err('name')}
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" className={field('email')} value={values.email} onChange={change('email')} onBlur={blur('email')} placeholder="you@example.com" />
              {err('email')}
            </div>
            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea id="message" rows={5} className={field('message')} value={values.message} onChange={change('message')} onBlur={blur('message')} placeholder="How can we help?" />
              {err('message')}
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" /> : <Send size={16} />}
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
