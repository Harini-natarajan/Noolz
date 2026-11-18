import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const FALLBACK_SLIDES = [
  {
    id: 'men',
    category: "Men's Collection",
    eyebrow: 'Men’s Collection',
    headline: 'Express Your Style.',
    subtitle: 'Everyday comfort. Extraordinary prints.',
    buttonText: "Explore Men's Collection",
    link: '/shop/mens',
    image: '/categories/men.jpg',
    fallbackImage: '/hero/slide-men.svg',
  },
  {
    id: 'women',
    category: "Women's Collection",
    eyebrow: 'Women’s Collection',
    headline: 'Style That Speaks.',
    subtitle: 'Discover prints that match your personality.',
    buttonText: "Explore Women's Collection",
    link: '/shop/womens',
    image: '/categories/women.jpg',
    fallbackImage: '/hero/slide-women.svg',
  },
  {
    id: 'kids',
    category: "Kids' Collection",
    eyebrow: 'Kids’ Collection',
    headline: 'Little Styles, Big Smiles.',
    subtitle: 'Comfortable prints for little personalities.',
    buttonText: "Explore Kids' Collection",
    link: '/shop/kids',
    image: '/categories/kids.jpg',
    fallbackImage: '/hero/slide-kids.svg',
  },
  {
    id: 'tote',
    category: 'Tote Bags',
    eyebrow: 'Tote Bags',
    headline: 'Carry Your Style.',
    subtitle: 'Everyday essentials with a creative touch.',
    buttonText: 'Explore Tote Bags',
    link: '/shop/tote-bags',
    image: '/categories/tote.jpg',
    fallbackImage: '/hero/slide-tote.svg',
  },
];

const AUTOPLAY_INTERVAL = 5000; // 5 seconds

export default function HeroCarousel() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  // Fetch active banners from backend API; fallback to original slides if empty/offline
  useEffect(() => {
    let isMounted = true;
    async function loadActiveBanners() {
      try {
        const res = await api.heroBanners.getActive();
        if (isMounted && res.success && Array.isArray(res.banners) && res.banners.length > 0) {
          const mapped = res.banners.map((b) => ({
            id: b.id || b._id,
            category: b.eyebrow || b.title,
            eyebrow: b.eyebrow || "Collection",
            headline: b.title,
            subtitle: b.subtitle,
            buttonText: b.buttonText || 'Explore Collection',
            link: b.buttonLink || '/shop',
            image: b.imageUrl,
            fallbackImage: b.fallbackImage || '/hero/slide-men.svg',
          }));
          setSlides(mapped);
        }
      } catch (err) {
        console.warn('[HeroCarousel] Using fallback hero banners:', err.message);
      }
    }
    loadActiveBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = slides.length || 1;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [current, isPaused, total]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  return (
    <section
      className="w-full bg-cream py-2 sm:py-2.5 md:py-3"
      aria-label="Promotional collections hero banner"
    >
      {/* Centered Inset Container */}
      <div className="mx-auto w-full max-w-[1600px] px-3.5 sm:px-6 md:px-8">
        {/* Floating Fashion Campaign Card */}
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[2.25rem] border border-ink/10 bg-[#140F12] shadow-lift transition-all duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
        >
          {/* Horizontal Slides Track */}
          <div
            className="flex w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${(current % total) * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const isActive = index === (current % total);

              return (
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${total}: ${slide.category}`}
                  aria-hidden={!isActive}
                  className="relative min-h-[480px] w-full shrink-0 sm:min-h-[520px] md:min-h-[560px] lg:min-h-[590px]"
                >
                  {/* Full-Bleed High-Resolution Fashion Photography */}
                  <img
                    src={slide.image}
                    alt=""
                    aria-hidden="true"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      if (e.currentTarget.src !== slide.fallbackImage && slide.fallbackImage) {
                        e.currentTarget.src = slide.fallbackImage;
                      }
                    }}
                    className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                  />

                  {/* Clean Cinematic Dark Studio Gradient (Crisp neutral contrast, no red/purple tint) */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent sm:to-black/10"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
                    aria-hidden="true"
                  />

                  {/* Slide Content Box: Vertically Centered with Editorial Balance */}
                  <div className="relative z-10 flex h-full min-h-[480px] sm:min-h-[520px] md:min-h-[560px] lg:min-h-[590px] flex-col justify-center px-6 py-14 sm:px-12 sm:py-16 md:px-16 md:py-20 lg:px-20 xl:px-24">
                    <div
                      className={`max-w-xl lg:max-w-2xl transition-all duration-700 ease-out ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      {/* Eyebrow */}
                      {slide.eyebrow && (
                        <div className="mb-3.5 flex items-center gap-2.5">
                          <span className="h-px w-8 bg-gold" aria-hidden="true" />
                          <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.25em] text-gold-light">
                            {slide.eyebrow}
                          </span>
                        </div>
                      )}

                      {/* Elegant Serif Headline */}
                      <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#FAF6EE] leading-[1.06]">
                        {slide.headline}
                      </h1>

                      {/* Clean Sans-Serif Supporting Text */}
                      {slide.subtitle && (
                        <p className="mt-4 max-w-lg font-sans text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-[#FAF6EE]/85">
                          {slide.subtitle}
                        </p>
                      )}

                      {/* Warm Gold CTA Button */}
                      <div className="mt-8 sm:mt-9">
                        <Link
                          to={slide.link || '/shop'}
                          className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3 sm:px-8 sm:py-3.5 md:px-9 md:py-4 text-xs sm:text-sm md:text-base font-semibold tracking-wide text-ink shadow-soft transition-all duration-300 hover:bg-gold-dark hover:text-white hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
                        >
                          <span>{slide.buttonText || 'Explore Collection'}</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Previous / Next Arrow Controls */}
          {total > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="group absolute left-3 sm:left-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-ink/35 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-cream hover:text-ink shadow-soft"
              >
                <ChevronLeft size={22} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>

              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="group absolute right-3 sm:right-6 top-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-ink/35 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-cream hover:text-ink shadow-soft"
              >
                <ChevronRight size={22} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Centered Pagination Dots */}
          {total > 1 && (
            <div className="absolute inset-x-0 bottom-5 sm:bottom-6 z-20 flex items-center justify-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === (current % total) ? 'true' : 'false'}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === (current % total) ? 'w-8 bg-gold' : 'w-2 bg-cream/40 hover:bg-cream/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
