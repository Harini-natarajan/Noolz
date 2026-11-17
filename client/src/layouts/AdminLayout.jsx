import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes, ExternalLink, History, Images, LayoutDashboard, LogOut, Menu, PackagePlus, Package, Settings, X,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: true },
  { to: '/admin/products/new', label: 'Add Product', icon: PackagePlus },
  { to: '/admin/banners', label: 'Hero Banners', icon: Images },
  { to: '/admin/stock', label: 'Stock Management', icon: Boxes },
  { to: '/admin/history', label: 'Stock History', icon: History },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const TITLES = [
  ['/admin/products/new', 'Add Product'],
  ['/admin/products/', 'Edit Product'],
  ['/admin/products', 'Products'],
  ['/admin/banners/new', 'Add Hero Banner'],
  ['/admin/banners/', 'Edit Hero Banner'],
  ['/admin/banners', 'Hero Banners'],
  ['/admin/stock', 'Stock Management'],
  ['/admin/history', 'Stock History'],
  ['/admin/settings', 'Settings'],
  ['/admin', 'Dashboard'],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useStore();
  const { admin, isAuthenticated, loading, logout: authLogout } = useAuth();
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? 'Admin';

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login', { replace: true, state: { from: pathname } });
    }
  }, [loading, isAuthenticated, navigate, pathname]);

  const logout = () => {
    authLogout();
    toast('Logged out of the admin dashboard.', 'info');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-burgundy border-t-transparent" />
          <p className="text-sm font-medium text-ink-soft">Verifying Admin Session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
      isActive ? 'bg-burgundy text-cream shadow-soft' : 'text-ink/75 hover:bg-cream-deep/60 hover:text-burgundy'
    }`;

  return (
    <div className="min-h-screen bg-cream">
      {open && <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-ink/10 bg-cream-dark transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-ink/10 px-5">
          <Logo to="/admin" className="h-12" />
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar"><X size={20} /></button>
        </div>
        <p className="px-6 pt-6 text-[11px] font-medium uppercase tracking-[0.25em] text-ink-soft">Admin</p>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={link}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-ink/10 p-4">
          <NavLink to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-ink/75 hover:bg-cream-deep/60">
            <ExternalLink size={18} /> View Website
          </NavLink>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-ink/10 bg-cream/90 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar">
              <Menu size={20} />
            </button>
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/" className="btn-outline btn-sm hidden sm:inline-flex"><ExternalLink size={14} /> View site</NavLink>
            <div className="flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-4 shadow-soft">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-sm font-semibold text-cream">
                {admin?.username ? admin.username.charAt(0).toUpperCase() : settings.businessName.charAt(0)}
              </span>
              <span className="hidden text-sm font-medium sm:block">{admin?.username || 'Store Admin'}</span>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
