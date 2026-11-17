import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/** Logo image has a white backdrop; multiply blends it into the cream background. */
export default function Logo({ className = 'h-12', to = '/', blend = true }) {
  const { settings } = useStore();
  return (
    <Link to={to} aria-label={`${settings.businessName} home`} className="inline-flex shrink-0 items-center">
      <img
        src={settings.logo || '/logo.png'}
        alt={settings.businessName}
        className={`${className} w-auto object-contain ${blend ? 'mix-blend-multiply' : ''}`}
      />
    </Link>
  );
}
