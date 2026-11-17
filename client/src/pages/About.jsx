import { Link } from 'react-router-dom';
import { ArrowRight, Brush, Feather, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { openWhatsApp } from '../utils/whatsapp';

export default function About() {
  const { settings } = useStore();

  return (
    <div className="container-page pb-16 pt-6 sm:pb-24 sm:pt-10">
      {/* Header */}
      <header className="mx-auto mb-14 max-w-3xl text-center">
        <p className="eyebrow mb-3">Our Story</p>
        <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
          Crafted with passion, <em className="text-burgundy">stitched</em> for you.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
          At NOOLZ, we create premium printed apparel and canvas tote bags that blend modern aesthetics with
          everyday comfort. Every thread, color, and print is thoughtfully designed in small batches.
        </p>
      </header>

      {/* Hero Visual Banner */}
      <div className="relative mb-20 overflow-hidden rounded-3xl bg-burgundy p-8 text-cream sm:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[32px] border-gold/20" aria-hidden />
        <div className="relative z-10 max-w-2xl">
          <span className="eyebrow !text-gold-light">The Philosophy</span>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Clothes that tell your story without shouting.
          </h2>
          <p className="mt-4 text-cream/80 leading-relaxed">
            We believe premium quality shouldn’t feel stiff. We select high-GSM combed cotton jersey, breathable
            eco-friendly inks, and reinforced tailoring so your favorite tees look and feel extraordinary—from day
            one to year five.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-gold">
              Explore The Shop <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => openWhatsApp(settings.whatsappNumber, `Hello ${settings.businessName}! I'd like to ask about custom printed merchandise.`)}
              className="btn border border-cream/30 text-cream hover:bg-cream/10"
            >
              <WhatsAppIcon size={16} /> Custom Orders
            </button>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <section className="mb-20">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">What sets us apart</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Our Core Principles</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Feather,
              title: 'Pure Combed Cotton',
              desc: 'Ultra-soft, breathable cotton that stays durable and keeps its shape after every wash.',
            },
            {
              icon: Brush,
              title: 'Artisan Screen Prints',
              desc: 'High-detail original artwork printed with non-cracking, skin-safe, fade-resistant inks.',
            },
            {
              icon: Sparkles,
              title: 'Small Batch Care',
              desc: 'Crafted in limited collections to ensure flawless stitching, zero overproduction, and exclusivity.',
            },
            {
              icon: ShieldCheck,
              title: 'Personalized Touch',
              desc: 'Direct, friendly WhatsApp order assistance with custom prints tailored for gifts, teams, and events.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy/10 text-burgundy">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workshop / Process Note */}
      <section className="grid items-center gap-10 rounded-3xl border border-ink/5 bg-cream-dark/60 p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow mb-2">From sketch to stitch</span>
          <h2 className="text-3xl font-semibold sm:text-4xl">Designed for life, made for comfort.</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Each graphic starts with hand-drawn concept sketches inspired by retro geometry, nature, and minimalist typography.
            Our cuts are carefully measured for standard, oversized, and cropped fits so everyone finds their perfect silhouette.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link to="/contact" className="btn-primary">
              Get in Touch
            </Link>
            <Link to="/shop" className="btn-outline">
              Shop Collections
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-serif text-3xl font-semibold text-burgundy">100%</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">Quality Inspected</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-serif text-3xl font-semibold text-gold-dark">0%</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">Payment Friction</p>
            </div>
          </div>
          <div className="space-y-4 pt-6">
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="font-serif text-3xl font-semibold text-ink">4+</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-soft">Curated Categories</p>
            </div>
            <div className="rounded-2xl bg-burgundy p-6 text-cream shadow-soft">
              <p className="font-serif text-3xl font-semibold text-gold-light">Direct</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-cream/80">WhatsApp Assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
