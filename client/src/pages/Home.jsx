import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brush, Feather, Heart } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryMarquee from '../components/CategoryMarquee';
import ProductCard from '../components/ProductCard';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { ProductSkeleton, SectionHeading } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { openWhatsApp } from '../utils/whatsapp';

export default function Home() {
  const { products, loading, settings } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 8);

  // Static, high-resolution authentic NOOLZ photoshoot images for the About section
  const aboutImages = [
    {
      src: '/about/about-1.jpg',
      alt: 'NOOLZ Handcrafted Apparel',
      id: 'about-static-1',
    },
    {
      src: '/about/about-2.jpg',
      alt: 'NOOLZ Printed Canvas Tote Bag',
      id: 'about-static-2',
    },
  ];

  return (
    <>
      {/* Full-Width Auto-Scrolling Hero Carousel */}
      <HeroCarousel />

      <div id="collections" />
      <CategoryMarquee />

      <section className="container-page pt-20">
        <SectionHeading
          eyebrow="Featured"
          title="Pieces we're loving"
          subtitle="Hand-picked prints from this season's collection."
          action={
            <Link to="/shop" className="btn-outline btn-sm self-center">
              View all products <ArrowRight size={14} />
            </Link>
          }
        />
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Promotions */}
      <section className="container-page pt-24">
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-3xl bg-burgundy p-8 text-cream sm:p-12 lg:col-span-3">
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full border-[28px] border-gold/25" aria-hidden />
            <p className="eyebrow !text-gold-light">Custom printed designs</p>
            <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">Your idea. Our print. One of a kind.</h2>
            <p className="mt-4 max-w-md text-cream/75">
              Have a design, a logo or a message in mind? Bring it to us — we'll print it on tees and totes for gifts, teams
              and events.
            </p>
            <button
              onClick={() => openWhatsApp(settings.whatsappNumber, `Hello ${settings.businessName}! I'd like a custom printed design.`)}
              className="btn-gold mt-8"
            >
              <WhatsAppIcon size={16} /> Request a custom print
            </button>
          </div>
          <div className="grid gap-5 lg:col-span-2">
            <Link to="/shop/tote-bags" className="group relative overflow-hidden rounded-3xl bg-gold p-8 transition-transform duration-500 hover:-translate-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink/60">Carry the art</p>
              <h3 className="mt-2 text-3xl font-semibold">Printed Tote Bags</h3>
              <p className="mt-2 max-w-[16rem] text-sm text-ink/70">Heavy canvas, roomy and made for everyday.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                Shop totes <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link to="/shop/kids" className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-cream-dark p-8 transition-transform duration-500 hover:-translate-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-dark">Little ones</p>
              <h3 className="mt-2 text-3xl font-semibold">Kids' Collection</h3>
              <p className="mt-2 max-w-[16rem] text-sm text-ink-soft">Playful prints on gentle, skin-friendly cotton.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-burgundy">
                Shop kids <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container-page pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] w-full rounded-3xl bg-cream-dark animate-pulse shadow-soft" />
              <div className="aspect-[4/5] w-full rounded-3xl bg-cream-dark animate-pulse shadow-soft mt-10" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {aboutImages.map((img, i) => (
                <div key={img.id || i} className={`relative overflow-hidden rounded-3xl bg-cream-dark shadow-soft ${i ? 'mt-10' : ''}`}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="eyebrow mb-3">About our brand</p>
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">Stitched for you, one print at a time.</h2>
            <p className="mt-5 text-ink-soft">
              NOOLZ began with a simple belief: what you wear should feel like you. We design original prints, choose
              soft, breathable fabrics and finish every piece with care — so each tee and tote feels personal.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                [Brush, 'Creativity', 'Original, in-house illustrations printed in small batches.'],
                [Feather, 'Comfort', 'Combed cotton and gentle inks that feel soft from day one.'],
                [Heart, 'Personalised', 'Custom printed merchandise for gifts, teams and events.'],
              ].map(([Icon, t, d]) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold">{t}</h3>
                    <p className="text-sm text-ink-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </>
  );
}
