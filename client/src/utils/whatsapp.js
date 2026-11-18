import { sanitizeWhatsAppNumber, getAdminWhatsAppNumber } from '../config/site.js';

export { sanitizeWhatsAppNumber, getAdminWhatsAppNumber };

/**
 * Builds a professional pre-filled WhatsApp order message matching NOOLZ specifications
 *
 * Format:
 * Hello NOOLZ,
 *
 * I would like to order this piece from your catalogue:
 *
 * • Product: "PRODUCT_NAME"
 * • Colorway: SELECTED_COLOR
 * • Size: SELECTED_SIZE
 * • Quantity: SELECTED_QUANTITY
 * • Total Price: ₹ SELECTED_TOTAL_PRICE
 * • Product Link: PRODUCT_PAGE_URL
 *
 * Please confirm availability and payment/delivery details.
 *
 * Thank you!
 */
export function buildOrderMessage({ product, color, size, quantity = 1, productUrl }) {
  if (!product) return '';

  const unitPrice =
    product.discountPrice && Number(product.discountPrice) < Number(product.price)
      ? Number(product.discountPrice)
      : Number(product.price);

  const total = unitPrice * Number(quantity);
  const formattedTotal = Number(total).toLocaleString('en-IN');

  const defaultUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/product/${product.id || product._id}`
      : '';

  let url = productUrl || defaultUrl;
  if (color && !url.includes('color=')) {
    url += `${url.includes('?') ? '&' : '?'}color=${encodeURIComponent(color)}`;
  }

  return [
    'Hello NOOLZ,',
    '',
    'I would like to order this piece from your catalogue:',
    '',
    `• Product: "${product.name}"`,
    `• Colorway: ${color}`,
    `• Size: ${size}`,
    `• Quantity: ${quantity}`,
    `• Total Price: ₹${formattedTotal}`,
    `• Product Link: ${url}`,
    '',
    'Please confirm availability and payment/delivery details.',
    '',
    'Thank you!',
  ].join('\n');
}

/**
 * Builds the WhatsApp click-to-chat URL with proper encoding
 */
export const whatsappUrl = (number, message) => {
  const cleanNumber = sanitizeWhatsAppNumber(number);
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
};

/**
 * Opens WhatsApp in a new tab supporting both Desktop Web and Mobile App
 */
export const openWhatsApp = (number, message) => {
  const url = whatsappUrl(number, message);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
};

/**
 * Quick order from catalog card — pre-fills an enquiry message
 */
export const buildQuickMessage = ({ product, productUrl }) => {
  if (!product) return '';

  const price =
    product.discountPrice && Number(product.discountPrice) < Number(product.price)
      ? Number(product.discountPrice)
      : Number(product.price);

  const defaultUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/product/${product.id || product._id}`
      : '';

  const url = productUrl || defaultUrl;

  return [
    'Hello NOOLZ,',
    '',
    'I would like to enquire about this piece from your catalogue:',
    '',
    `• Product: "${product.name}"`,
    `• Price: ₹ ${Number(price).toLocaleString('en-IN')}`,
    `• Product Link: ${url}`,
    '',
    'Could you please share the available sizes, colors, and order details?',
    '',
    'Thank you!',
  ].join('\n');
};
