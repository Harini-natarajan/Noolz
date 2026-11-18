import { useEffect, useState } from 'react';
import { X, Ruler, Sparkles, Shirt, CheckCircle2, Image as ImageIcon, Table as TableIcon } from 'lucide-react';

export const SIZE_CHARTS = {
  oversized: {
    id: 'oversized',
    name: 'Oversized Fit',
    badge: 'Streetwear',
    title: 'OVERSIZED T-SHIRT',
    subtitle: 'Built for comfort. Designed to stand out.',
    image: '/size-charts/oversized-tshirt.jpg',
    measureNotice: 'All measurements are in inches. Slight variation of ±0.5 inch is normal.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Length' },
      { key: 'shoulder', label: 'Shoulder' },
      { key: 'sleeve', label: 'Sleeve' },
    ],
    measurements: [
      { size: 'S', colorBg: 'bg-emerald-500', colorText: 'text-white', chest: 40, length: 26, shoulder: 20, sleeve: 9, fitName: 'Urban Fit', fitDesc: 'Slim body / fitted look' },
      { size: 'M', colorBg: 'bg-sky-500', colorText: 'text-white', chest: 42, length: 27, shoulder: 21, sleeve: 9.5, fitName: 'Classic Fit', fitDesc: 'Regular daily wear' },
      { size: 'L', colorBg: 'bg-amber-400', colorText: 'text-ink', chest: 44, length: 28, shoulder: 22, sleeve: 10, fitName: 'Relaxed Fit', fitDesc: 'Comfortable loose fit' },
      { size: 'XL', colorBg: 'bg-rose-500', colorText: 'text-white', chest: 46, length: 29, shoulder: 23, sleeve: 10.5, fitName: 'Street Fit', fitDesc: 'Oversized trendy look' },
      { size: 'XXL', colorBg: 'bg-purple-600', colorText: 'text-white', chest: 48, length: 30, shoulder: 24, sleeve: 11, fitName: 'King Fit', fitDesc: 'Extra loose & bold' },
    ],
  },
  polo: {
    id: 'polo',
    name: 'Polo Collar',
    badge: 'Classic Pique',
    title: 'POLO COLLAR T-SHIRT',
    subtitle: 'Built for comfort. Designed to stand out.',
    image: '/size-charts/polo-collar.jpg',
    measureNotice: 'All measurements are in inches. Slight variation of ±0.5 inch is normal.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Length' },
      { key: 'shoulder', label: 'Shoulder Full Length' },
    ],
    measurements: [
      { size: 'M', colorBg: 'bg-[#5F82A4]', colorText: 'text-white', chest: 21, length: 26, shoulder: 14, fitName: 'Classic Fit', fitDesc: 'Regular daily wear' },
      { size: 'L', colorBg: 'bg-[#F8E387]', colorText: 'text-ink font-semibold', chest: 21.5, length: 27, shoulder: 14.5, fitName: 'Relaxed Fit', fitDesc: 'Comfortable loose fit' },
      { size: 'XL', colorBg: 'bg-[#F8A88E]', colorText: 'text-white', chest: 22, length: 28, shoulder: 15, fitName: 'Street Fit', fitDesc: 'Oversized trendy look' },
      { size: 'XXL', colorBg: 'bg-[#CCAEE8]', colorText: 'text-ink font-semibold', chest: 22.5, length: 29, shoulder: 15.5, fitName: 'King Fit', fitDesc: 'Extra loose & bold' },
      { size: '3XL', colorBg: 'bg-[#D6DCE2]', colorText: 'text-ink font-semibold', chest: 23.5, length: 30, shoulder: 15.5, fitName: 'Mega Fit', fitDesc: 'Massive loose fit' },
    ],
  },
  regular: {
    id: 'regular',
    name: 'Regular / Normal Fit',
    badge: 'Half Sleeve',
    title: 'HALF SLEEVE T-SHIRT',
    subtitle: 'Built for comfort. Designed to stand out.',
    image: '/size-charts/regular-fit.jpg',
    measureNotice: 'All measurements are in inches. Slight variation of ±0.5 inch is normal.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'chest', label: 'Chest' },
      { key: 'length', label: 'Length' },
      { key: 'shoulder', label: 'Shoulder' },
      { key: 'sleeve', label: 'Sleeve' },
    ],
    measurements: [
      { size: 'S', colorBg: 'bg-[#8B5CF6]', colorText: 'text-white', chest: 36, length: 27, shoulder: 17, sleeve: 8, fitName: 'Urban Fit', fitDesc: 'Slim body / fitted look' },
      { size: 'M', colorBg: 'bg-[#A78BFA]', colorText: 'text-white', chest: 38, length: 28, shoulder: 18, sleeve: 8.25, fitName: 'Classic Fit', fitDesc: 'Regular daily wear' },
      { size: 'L', colorBg: 'bg-[#C4B5FD]', colorText: 'text-ink font-semibold', chest: 40, length: 29, shoulder: 19, sleeve: 8.75, fitName: 'Relaxed Fit', fitDesc: 'Comfortable loose fit' },
      { size: 'XL', colorBg: 'bg-[#DDD6FE]', colorText: 'text-ink font-semibold', chest: 42, length: 29.5, shoulder: 20, sleeve: 9, fitName: 'Street Fit', fitDesc: 'Oversized trendy look' },
      { size: 'XXL', colorBg: 'bg-[#EDE9FE]', colorText: 'text-ink font-semibold', chest: 44, length: 30, shoulder: 21, sleeve: 9.5, fitName: 'King Fit', fitDesc: 'Extra loose & bold' },
    ],
  },
};

export default function SizeChartModal({ isOpen, onClose, selectedSize, initialType = 'oversized' }) {
  const [activeType, setActiveType] = useState(initialType);
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  // Sync initial type when opening
  useEffect(() => {
    if (isOpen) {
      if (initialType && SIZE_CHARTS[initialType]) {
        setActiveType(initialType);
      }
    }
  }, [isOpen, initialType]);

  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const chart = SIZE_CHARTS[activeType] || SIZE_CHARTS.oversized;

  const toUnit = (valInches) => {
    if (valInches === undefined || valInches === null) return '—';
    if (unit === 'in') return `${valInches}"`;
    return `${(Number(valInches) * 2.54).toFixed(1)} cm`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream shadow-lift">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-ink/10 bg-cream-dark/60 px-5 py-4 sm:px-8 sm:py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-burgundy">
              <Ruler size={15} />
              <span>NOOLZ Size & Fit Guide</span>
            </div>
            <h2 id="size-chart-title" className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {chart.title}
            </h2>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-ink-soft sm:text-sm">
              {chart.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close size chart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream transition hover:bg-burgundy hover:text-cream"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fit Category Tabs (Oversized, Polo, Regular) */}
        <div className="flex overflow-x-auto border-b border-ink/10 bg-cream-dark/30 px-5 sm:px-8 py-2 gap-2 no-scrollbar">
          {Object.values(SIZE_CHARTS).map((c) => {
            const isActive = c.id === activeType;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveType(c.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-burgundy text-cream shadow-xs'
                    : 'bg-white/80 text-ink/70 hover:bg-white hover:text-burgundy border border-ink/10'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-cream/20 text-cream' : 'bg-ink/5 text-ink-soft'
                  }`}
                >
                  {c.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Switcher & Unit Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white/70 px-5 py-2.5 sm:px-8">
          {/* View toggle (Interactive Table vs Graphic) */}
          <div className="flex rounded-lg border border-ink/10 bg-cream p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                viewMode === 'table' ? 'bg-burgundy text-cream shadow-xs' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <TableIcon size={14} /> Measurement Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                viewMode === 'chart' ? 'bg-burgundy text-cream shadow-xs' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <ImageIcon size={14} /> Original Graphic
            </button>
          </div>

          {/* Unit Toggle */}
          {viewMode === 'table' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-ink-soft">Units:</span>
              <div className="flex rounded-lg border border-ink/15 bg-cream p-0.5 font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`rounded-md px-2.5 py-1 transition ${
                    unit === 'in' ? 'bg-burgundy text-cream' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`rounded-md px-2.5 py-1 transition ${
                    unit === 'cm' ? 'bg-burgundy text-cream' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {viewMode === 'chart' ? (
            /* Original Image View */
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
              <img
                src={chart.image}
                alt={`${chart.title} Size Chart`}
                className="w-full object-contain"
              />
            </div>
          ) : (
            /* Interactive Table View */
            <>
              {/* Table 1: Garment Measurements */}
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-center text-sm">
                    <thead>
                      <tr className="border-b border-ink/15 bg-ink text-cream">
                        {chart.columns.map((col) => (
                          <th key={col.key} className="py-3 px-3 font-semibold uppercase tracking-wider text-xs">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {chart.measurements.map((row) => {
                        const isCurrent = selectedSize === row.size;
                        return (
                          <tr
                            key={row.size}
                            className={`transition hover:bg-cream/50 ${
                              isCurrent ? 'bg-burgundy/10 font-semibold text-burgundy' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex h-8 w-14 items-center justify-center rounded-lg font-bold text-sm ${row.colorBg} ${row.colorText} shadow-xs`}
                              >
                                {row.size}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-medium text-ink">{toUnit(row.chest)}</td>
                            <td className="py-3 px-3 font-medium text-ink">{toUnit(row.length)}</td>
                            <td className="py-3 px-3 font-medium text-ink">{toUnit(row.shoulder)}</td>
                            {row.sleeve !== undefined && (
                              <td className="py-3 px-3 font-medium text-ink">{toUnit(row.sleeve)}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Fit Style Guide & Measurement Diagram */}
              <div className="grid gap-6 sm:grid-cols-2 items-center">
                {/* Fit Guide */}
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
                  <div className="border-b border-ink/10 bg-cream-dark/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink">
                    Fit & Silhouette Guide
                  </div>
                  <div className="divide-y divide-ink/10 text-xs sm:text-sm">
                    {chart.measurements.map((row) => (
                      <div
                        key={row.size}
                        className={`flex items-center justify-between p-3 ${
                          selectedSize === row.size ? 'bg-burgundy/10 text-burgundy font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-5 w-8 items-center justify-center rounded text-[11px] font-bold ${row.colorBg} ${row.colorText}`}>
                            {row.size}
                          </span>
                          <span className="font-semibold text-ink">{row.fitName}</span>
                        </div>
                        <span className="text-ink-soft text-right">{row.fitDesc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Measurement Tips Card */}
                <div className="rounded-2xl border border-ink/10 bg-cream-dark/40 p-4 sm:p-5 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-burgundy">
                    <Sparkles size={15} />
                    <span>How to Measure</span>
                  </div>
                  <ul className="space-y-2 text-ink-soft leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span><strong>Chest:</strong> Lay your favorite well-fitting tee flat. Measure armpit to armpit across the chest.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span><strong>Length:</strong> Measure from the highest point of the shoulder down to the bottom hem.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span><strong>Shoulder:</strong> Measure straight across the back from shoulder seam to shoulder seam.</span>
                    </li>
                  </ul>
                  <div className="pt-1 text-[11px] text-ink/60 border-t border-ink/10 italic">
                    💡 For best accuracy, compare with a garment you already own rather than measuring your body directly.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer note */}
          <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs text-ink/80 flex items-center justify-between flex-wrap gap-2">
            <span>📏 <strong>Pro Tip:</strong> {chart.measureNotice}</span>
            <span className="font-serif italic text-burgundy font-medium">Style that speaks. Quality that lasts.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
