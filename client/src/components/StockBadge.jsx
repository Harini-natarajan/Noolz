import { STATUS_LABEL } from '../utils/stock';

const STYLES = {
  in: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  low: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  out: 'bg-red-50 text-red-700 ring-red-600/20',
};
const DOT = { in: 'bg-emerald-500', low: 'bg-amber-500', out: 'bg-red-500' };

export default function StockBadge({ status, label, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
