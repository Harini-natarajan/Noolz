import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight, Instagram } from 'lucide-react';
import Logo from './Logo';
import WhatsAppIcon from './WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { openWhatsApp } from '../utils/whatsapp';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopExpand, setMobileShopExpand] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const { pathname } = useLocation();
  const { settings } = useStore();

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setShopDropdownOpen(false);
    setMobileShopExpand(false);
  }, [pathname]);

  // Scroll detection for sticky navbar blur and subtle border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile full-screen menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setShopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 180);
  };

  const isShopActive = pathname.startsWith('/shop');

  const navLinkStyle = (active) =>
    `relative py-2 text-xs md:text-[13px] lg:text-sm font-medium tracking-wide transition-all duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-burgundy after:transition-transform after:duration-300 ${
      active
        ? 'text-burgundy font-semibold after:scale-x-100'
        : 'text-ink/80 hover:text-burgundy after:scale-x-0 hover:after:scale-x-100'
    }`;

  const openWhatsAppChat = () => {
    openWhatsApp(settings.whatsappNumber, `Hello ${settings.businessName}! I'm interested in ordering custom printed apparel.`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
          scrolled
            ? 'border-ink/10 bg-cream/95 shadow-soft backdrop-blur-md'
            : 'border-ink/5 bg-cream'
        }`}
      >
        <div className="container-page flex h-[68px] sm:h-[72px] items-center justify-between gap-3 sm:gap-4">
          {/* Left: Business Logo */}
          <div className="flex shrink-0 items-center">
            <Logo className="h-11 sm:h-12 md:h-13 lg:h-14" />
          </div>

          {/* Center: Main Navigation (Tablet & Desktop: md:flex) */}
          <nav className="hidden md:flex items-center justify-center md:gap-5 lg:gap-8" aria-label="Main navigation">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) => navLinkStyle(isActive)}
            >
              Home
            </NavLink>

            {/* Shop with Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink
                to="/shop"
                className={() =>
                  `inline-flex items-center gap-1.5 py-2 text-xs md:text-[13px] lg:text-sm font-medium tracking-wide transition-all duration-300 ${
                    isShopActive
                      ? 'text-burgundy font-semibold'
                      : 'text-ink/80 hover:text-burgundy'
                  }`
                }
              >
                <span>Shop</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    shopDropdownOpen ? 'rotate-180 text-burgundy' : 'text-ink/60'
                  }`}
                />
              </NavLink>

              {/* Desktop Modern Minimalist Dropdown / Mega Menu */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-2.5 transition-all duration-300 ease-out ${
                  shopDropdownOpen
                    ? 'pointer-events-auto visible translate-y-0 opacity-100'
                    : 'pointer-events-none invisible -translate-y-2 opacity-0'
                }`}
              >
                <div className="w-[620px] rounded-2xl border border-ink/10 bg-[#FAF7F2] p-5 shadow-lift backdrop-blur-md">
                  {/* Top Action: VIEW ALL PRODUCTS */}
                  <div className="mb-3.5 flex items-center justify-end border-b border-ink/10 pb-2.5">
                    <NavLink
                      to="/shop"
                      onClick={() => setShopDropdownOpen(false)}
                      className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-burgundy"
                    >
                      <span>View All Products</span>
                      <ArrowRight size={12} className="text-burgundy transition-transform duration-200 group-hover:translate-x-1" />
                    </NavLink>
                  </div>

                  {/* 4 Balanced Columns */}
                  <div className="grid grid-cols-4 gap-6 px-1">
                    {/* 1. Men's */}
                    <div>
                      <NavLink
                        to="/shop/mens"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block font-serif text-lg font-semibold tracking-tight text-ink transition-colors hover:text-burgundy"
                      >
                        Men's
                      </NavLink>
                      <ul className="mt-3 space-y-2">
                        <li>
                          <NavLink
                            to="/shop/mens/normal-fit"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Normal Fit
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/shop/mens/oversized"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Oversized
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/shop/mens/plain-tees"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Plain Tees
                          </NavLink>
                        </li>
                      </ul>
                    </div>

                    {/* 2. Women's */}
                    <div>
                      <NavLink
                        to="/shop/womens"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block font-serif text-lg font-semibold tracking-tight text-ink transition-colors hover:text-burgundy"
                      >
                        Women's
                      </NavLink>
                      <ul className="mt-3 space-y-2">
                        <li>
                          <NavLink
                            to="/shop/womens/oversized"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Oversized Tees
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/shop/womens/crop-tops"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Crop Tops
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/shop/womens/normal-fit"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            Normal Fit
                          </NavLink>
                        </li>
                      </ul>
                    </div>

                    {/* 3. Kids' */}
                    <div>
                      <NavLink
                        to="/shop/kids"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block font-serif text-lg font-semibold tracking-tight text-ink transition-colors hover:text-burgundy"
                      >
                        Kids'
                      </NavLink>
                      <ul className="mt-3 space-y-2">
                        <li>
                          <NavLink
                            to="/shop/kids"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            All Kids' T-Shirts
                          </NavLink>
                        </li>
                      </ul>
                    </div>

                    {/* 4. Tote Bags */}
                    <div>
                      <NavLink
                        to="/shop/tote-bags"
                        onClick={() => setShopDropdownOpen(false)}
                        className="block font-serif text-lg font-semibold tracking-tight text-ink transition-colors hover:text-burgundy"
                      >
                        Tote Bags
                      </NavLink>
                      <ul className="mt-3 space-y-2">
                        <li>
                          <NavLink
                            to="/shop/tote-bags"
                            onClick={() => setShopDropdownOpen(false)}
                            className="block font-sans text-xs text-ink/75 transition-all duration-200 hover:translate-x-1 hover:text-burgundy"
                          >
                            All Tote Bags
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <NavLink
              to="/contact"
              className={({ isActive }) => navLinkStyle(isActive)}
            >
              Contact
            </NavLink>

            {/* About */}
            <NavLink
              to="/about"
              className={({ isActive }) => navLinkStyle(isActive)}
            >
              About
            </NavLink>
          </nav>

          {/* Right side: WhatsApp Button + Instagram Link + Mobile Menu toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Button with Softer Green styling */}
            <button
              onClick={openWhatsAppChat}
              className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#23864F]/30 bg-[#23864F]/10 px-3 py-1.5 text-xs font-medium text-[#1A6C3E] shadow-xs transition-all duration-300 hover:border-[#23864F] hover:bg-[#23864F] hover:text-white sm:px-4 sm:py-2 md:text-xs lg:text-sm"
              aria-label="Order or chat on WhatsApp"
              title="Chat with us on WhatsApp"
            >
              <WhatsAppIcon size={16} className="text-[#1A6C3E] transition-colors group-hover:text-white" />
              <span className="tracking-wide">WhatsApp</span>
            </button>

            {/* Instagram Button */}
            <a
              href={settings.instagram || 'https://instagram.com/noolz.co.in'}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#E1306C]/30 bg-[#E1306C]/10 px-2.5 py-1.5 text-xs font-medium text-[#C13584] shadow-xs transition-all duration-300 hover:border-[#E1306C] hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white sm:px-4 sm:py-2 md:text-xs lg:text-sm"
              aria-label="Follow us on Instagram @noolz.co.in"
              title="Instagram @noolz.co.in"
            >
              <Instagram size={16} className="text-[#C13584] transition-colors group-hover:text-white" />
              <span className="tracking-wide hidden xs:inline sm:inline">Instagram</span>
            </a>

            {/* Mobile hamburger button (< 768px: md:hidden) */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-cream-dark md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay (Mobile: < 768px) */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-cream transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-4'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Top Header Bar: Logo on left, Close button on right */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink/10 px-4 sm:px-6">
          <Logo className="h-11 sm:h-12" />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-cream-dark"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area: Vertically stacked links with compact spacing */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-4">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation Links">
            {/* Home */}
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center py-2 font-serif text-2xl sm:text-3xl transition-colors ${
                  isActive ? 'font-semibold text-burgundy' : 'text-ink hover:text-burgundy'
                }`
              }
            >
              Home
            </NavLink>

            {/* Shop Accordion */}
            <div className="border-t border-ink/8 pt-1">
              <div className="flex min-h-[46px] items-center justify-between py-2">
                <NavLink
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className={`font-serif text-2xl sm:text-3xl transition-colors ${
                    isShopActive ? 'font-semibold text-burgundy' : 'text-ink hover:text-burgundy'
                  }`}
                >
                  Shop
                </NavLink>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileShopExpand((prev) => !prev);
                  }}
                  aria-label="Toggle Shop categories"
                  aria-expanded={mobileShopExpand}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition hover:bg-cream-dark hover:text-burgundy"
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      mobileShopExpand ? 'rotate-180 text-burgundy' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Accordion Categories & Subcategories */}
              {mobileShopExpand && (
                <div className="mb-2 mt-1 space-y-3 rounded-2xl bg-white/70 p-4 shadow-soft">
                  {/* Men's */}
                  <div>
                    <NavLink
                      to="/shop/mens"
                      onClick={() => setMobileOpen(false)}
                      className="block font-serif text-base font-semibold text-ink hover:text-burgundy"
                    >
                      Men's
                    </NavLink>
                    <div className="ml-2.5 mt-1 flex flex-col space-y-1 border-l-2 border-gold/40 pl-2.5 text-xs text-ink/75">
                      <NavLink
                        to="/shop/mens/normal-fit"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Normal Fit
                      </NavLink>
                      <NavLink
                        to="/shop/mens/oversized"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Oversized
                      </NavLink>
                      <NavLink
                        to="/shop/mens/plain-tees"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Plain Tees
                      </NavLink>
                    </div>
                  </div>

                  {/* Women's */}
                  <div>
                    <NavLink
                      to="/shop/womens"
                      onClick={() => setMobileOpen(false)}
                      className="block font-serif text-base font-semibold text-ink hover:text-burgundy"
                    >
                      Women's
                    </NavLink>
                    <div className="ml-2.5 mt-1 flex flex-col space-y-1 border-l-2 border-gold/40 pl-2.5 text-xs text-ink/75">
                      <NavLink
                        to="/shop/womens/oversized"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Oversized Tees
                      </NavLink>
                      <NavLink
                        to="/shop/womens/crop-tops"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Crop Tops
                      </NavLink>
                      <NavLink
                        to="/shop/womens/normal-fit"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        Normal Fit
                      </NavLink>
                    </div>
                  </div>

                  {/* Kids' */}
                  <div>
                    <NavLink
                      to="/shop/kids"
                      onClick={() => setMobileOpen(false)}
                      className="block font-serif text-base font-semibold text-ink hover:text-burgundy"
                    >
                      Kids'
                    </NavLink>
                    <div className="ml-2.5 mt-1 flex flex-col space-y-1 border-l-2 border-gold/40 pl-2.5 text-xs text-ink/75">
                      <NavLink
                        to="/shop/kids"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        All Kids' T-Shirts
                      </NavLink>
                    </div>
                  </div>

                  {/* Tote Bags */}
                  <div>
                    <NavLink
                      to="/shop/tote-bags"
                      onClick={() => setMobileOpen(false)}
                      className="block font-serif text-base font-semibold text-ink hover:text-burgundy"
                    >
                      Tote Bags
                    </NavLink>
                    <div className="ml-2.5 mt-1 flex flex-col space-y-1 border-l-2 border-gold/40 pl-2.5 text-xs text-ink/75">
                      <NavLink
                        to="/shop/tote-bags"
                        onClick={() => setMobileOpen(false)}
                        className="py-1 hover:text-burgundy transition-colors"
                      >
                        All Tote Bags
                      </NavLink>
                    </div>
                  </div>

                  {/* View All Products */}
                  <div className="border-t border-ink/8 pt-2">
                    <NavLink
                      to="/shop"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-burgundy hover:underline"
                    >
                      <span>View All Products</span>
                      <ArrowRight size={12} />
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="border-t border-ink/8 pt-1">
              <NavLink
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center py-2 font-serif text-2xl sm:text-3xl transition-colors ${
                    isActive ? 'font-semibold text-burgundy' : 'text-ink hover:text-burgundy'
                  }`
                }
              >
                Contact
              </NavLink>
            </div>

            {/* About */}
            <div className="border-t border-ink/8 pt-1">
              <NavLink
                to="/about"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center py-2 font-serif text-2xl sm:text-3xl transition-colors ${
                    isActive ? 'font-semibold text-burgundy' : 'text-ink hover:text-burgundy'
                  }`
                }
              >
                About
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Bottom Area: Softer green WhatsApp CTA button & Instagram CTA button */}
        <div className="shrink-0 space-y-2.5 border-t border-ink/10 bg-cream px-5 sm:px-6 py-4">
          <button
            onClick={() => {
              setMobileOpen(false);
              openWhatsAppChat();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#23864F] py-3 text-sm font-medium text-white shadow-soft transition hover:bg-[#1A6C3E] active:scale-[0.99]"
          >
            <WhatsAppIcon size={18} />
            <span>Chat & Order on WhatsApp</span>
          </button>
          <a
            href={settings.instagram || 'https://instagram.com/noolz.co.in'}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E1306C]/30 bg-[#E1306C]/10 py-2.5 text-sm font-medium text-[#C13584] transition hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white active:scale-[0.99]"
          >
            <Instagram size={18} />
            <span>Follow on Instagram (@noolz.co.in)</span>
          </a>
        </div>
      </div>
    </>
  );
}
