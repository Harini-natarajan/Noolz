export const STATUS = {
  IN: 'in',
  LOW: 'low',
  OUT: 'out',
};

export const STATUS_LABEL = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };

export const getStatus = (qty, threshold = 5) => {
  if (qty <= 0) return STATUS.OUT;
  if (qty <= threshold) return STATUS.LOW;
  return STATUS.IN;
};

export const variantKey = (color, size) => `${color}|${size}`;

export const getVariantQty = (product, color, size) => product.stock?.[variantKey(color, size)] ?? 0;

export const totalStock = (product) =>
  Object.entries(product.stock ?? {}).reduce((sum, [key, qty]) => {
    const [color, size] = key.split('|');
    const valid = product.colors.some((c) => c.name === color) && product.sizes.includes(size);
    return valid ? sum + qty : sum;
  }, 0);

export const productStatus = (product) => getStatus(totalStock(product), product.lowStockThreshold);

/** A product is "low" if its total is at/below the threshold. Variant-level statuses are also available. */
export const variantRows = (product) =>
  product.colors.flatMap((c) =>
    product.sizes.map((s) => {
      const qty = getVariantQty(product, c.name, s);
      const colorImg = (Array.isArray(c.images) && c.images[0]) || product.images?.[0] || '';
      return {
        productId: product.id,
        product,
        color: c.name,
        hex: c.hex,
        image: colorImg,
        size: s,
        qty,
        status: getStatus(qty, product.lowStockThreshold),
      };
    })
  );

export const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
