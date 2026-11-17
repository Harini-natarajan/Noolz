import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const redirectPath = location.state?.from?.pathname || '/admin';

  // Prevent logged-in admins from accessing the login page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      return toast('Please enter your username/email and password.', 'error');
    }

    setSubmitting(true);
    try {
      await login(cleanId, password);
      toast('Welcome back! Logged in to Admin.', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast(err.message || 'Invalid username/email or password.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-burgundy border-t-transparent" />
          <p className="text-sm font-medium text-ink-soft">Loading Admin Portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Logo to="/" className="h-16" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-semibold text-ink">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in with administrative privileges to manage NOOLZ
          </p>
        </div>

        <div className="card p-8 shadow-soft">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="label" htmlFor="identifier">
                Username or Email
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-soft">
                  <User size={18} />
                </span>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Hellonoolz.in@gmail.com"
                  className="input !pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-soft">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input !pl-10 !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-soft hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center !py-3 text-base font-medium disabled:opacity-60"
              >
                {submitting ? 'Verifying Credentials…' : 'Sign in to Dashboard'}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-medium text-ink-soft hover:text-burgundy transition"
          >
            ← Return to public storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
