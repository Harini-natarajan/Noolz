import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Clock } from 'lucide-react';
import Logo from './Logo';
import WhatsAppIcon from './WhatsAppIcon';
import { CATEGORIES, categoryPath } from '../config/site';
import { useStore } from '../context/StoreContext';
import { whatsappUrl } from '../utils/whatsapp';

export default function Footer() {
  const { settings } = useStore();
  const col = 'mb-4 text-xs font-medium uppercase tracking-[0.25em] text-gold';
  const link = 'text-sm text-cream/70 transition hover:text-gold';

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-cream px-3 py-1">
            <Logo className="h-14" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/70">
            Custom printed T-shirts and tote bags, designed with care and stitched for you. Comfort you can wear, art you
            can carry.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 transition hover:border-gold hover:text-gold">
              <Instagram size={18} />
            </a>
            <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 transition hover:border-gold hover:text-gold">
              <WhatsAppIcon size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className={col}>Quick Links</h4>
          <ul className="space-y-2.5">
            {[['Home', '/'], ['Shop', '/shop'], ['About', '/about'], ['Contact', '/contact']].map(([l, t]) => (
              <li key={l}><Link to={t} className={link}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={col}>Categories</h4>
          <ul className="space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link to={categoryPath(c.slug)} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={col}>Get in Touch</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" />{settings.address}</li>
            <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href={`mailto:${settings.email}`} className="hover:text-gold">{settings.email}</a></li>
            <li className="flex gap-2.5"><WhatsAppIcon size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noreferrer" className="hover:text-gold">
                +91 9585123004</a></li>
            <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0 text-gold" />{settings.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <p className="font-serif text-base italic text-gold/80">stitched for you</p>
        </div>
      </div>
    </footer>
  );
}
