import {
  buildOrderMessage,
  whatsappUrl,
  sanitizeWhatsAppNumber,
} from '../client/src/utils/whatsapp.js';

const runWhatsAppTests = () => {
  console.log('\n======================================================');
  console.log('NOOLZ WhatsApp Order Integration Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASSED: ${title}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${title}`);
      failed++;
    }
  };

  const adminNumber = '919585123004';

  // Sample Products representing all four categories
  const mensTee = {
    id: 'p-men-1',
    name: 'Golden Hour Tee',
    category: 'men',
    price: 899,
    discountPrice: null,
  };

  const womensTee = {
    id: 'p-women-2',
    name: 'Dream Big Cropped Tee',
    category: 'women',
    price: 799,
    discountPrice: 699, // With discount
  };

  const kidsTee = {
    id: 'p-kids-1',
    name: 'Blast Off Kids Tee',
    category: 'kids',
    price: 599,
    discountPrice: null,
  };

  const toteBag = {
    id: 'p-tote-1',
    name: 'Wander More Canvas Tote',
    category: 'tote',
    price: 499,
    discountPrice: null,
  };

  // ----------------------------------------------------
  // Scenario 1: Order a men's T-shirt
  // ----------------------------------------------------
  console.log('--- Scenario 1: Order a Men\'s T-shirt ---');
  const msg1 = buildOrderMessage({
    product: mensTee,
    color: 'Black',
    size: 'L',
    quantity: 1,
    productUrl: 'https://noolz.in/product/p-men-1',
  });
  assert(msg1.includes('• Product: "Golden Hour Tee"'), 'Contains exact product name in quotes');
  assert(msg1.includes('• Colorway: Black'), 'Contains selected color');
  assert(msg1.includes('• Size: L'), 'Contains selected size');
  assert(msg1.includes('• Quantity: 1'), 'Contains selected quantity');
  assert(msg1.includes('• Total Price: ₹ 899'), 'Calculates total price correctly');
  assert(msg1.includes('• Product Link: https://noolz.in/product/p-men-1'), 'Contains product link');

  // ----------------------------------------------------
  // Scenario 2: Order a women's T-shirt (with discount price)
  // ----------------------------------------------------
  console.log('\n--- Scenario 2: Order a Women\'s T-shirt (with discount) ---');
  const msg2 = buildOrderMessage({
    product: womensTee,
    color: 'Off White',
    size: 'M',
    quantity: 2,
    productUrl: 'https://noolz.in/product/p-women-2',
  });
  assert(msg2.includes('• Product: "Dream Big Cropped Tee"'), 'Contains women tee name');
  assert(msg2.includes('• Colorway: Off White'), 'Contains Off White colorway');
  assert(msg2.includes('• Size: M'), 'Contains size M');
  assert(msg2.includes('• Quantity: 2'), 'Contains quantity 2');
  // 699 * 2 = 1,398
  assert(msg2.includes('• Total Price: ₹ 1,398'), 'Applies discount price for total calculation (699 * 2 = 1,398)');

  // ----------------------------------------------------
  // Scenario 3: Order a kids' T-shirt
  // ----------------------------------------------------
  console.log('\n--- Scenario 3: Order a Kids\' T-shirt ---');
  const msg3 = buildOrderMessage({
    product: kidsTee,
    color: 'Navy',
    size: '4-5Y',
    quantity: 1,
    productUrl: 'https://noolz.in/product/p-kids-1',
  });
  assert(msg3.includes('• Product: "Blast Off Kids Tee"'), 'Contains kids tee name');
  assert(msg3.includes('• Size: 4-5Y'), 'Contains kids size format (4-5Y)');
  assert(msg3.includes('• Total Price: ₹ 599'), 'Calculates kids tee total');

  // ----------------------------------------------------
  // Scenario 4: Order a tote bag
  // ----------------------------------------------------
  console.log('\n--- Scenario 4: Order a Tote Bag ---');
  const msg4 = buildOrderMessage({
    product: toteBag,
    color: 'Natural',
    size: 'One Size',
    quantity: 3,
    productUrl: 'https://noolz.in/product/p-tote-1',
  });
  assert(msg4.includes('• Product: "Wander More Canvas Tote"'), 'Contains tote bag name');
  assert(msg4.includes('• Size: One Size'), 'Handles One Size correctly');
  assert(msg4.includes('• Quantity: 3'), 'Quantity is 3');
  // 499 * 3 = 1,497
  assert(msg4.includes('• Total Price: ₹ 1,497'), 'Total price is 499 * 3 = 1,497');

  // ----------------------------------------------------
  // Scenario 5: Change size and color before ordering
  // ----------------------------------------------------
  console.log('\n--- Scenario 5: Dynamic updates when changing size and color ---');
  const msg5a = buildOrderMessage({
    product: mensTee,
    color: 'White',
    size: 'S',
    quantity: 1,
    productUrl: 'https://noolz.in/product/p-men-1',
  });
  const msg5b = buildOrderMessage({
    product: mensTee,
    color: 'Navy',
    size: 'XXL',
    quantity: 1,
    productUrl: 'https://noolz.in/product/p-men-1',
  });
  assert(msg5a.includes('• Colorway: White') && msg5a.includes('• Size: S'), 'Reflects initial variant (White / S)');
  assert(msg5b.includes('• Colorway: Navy') && msg5b.includes('• Size: XXL'), 'Reflects changed variant (Navy / XXL)');

  // ----------------------------------------------------
  // Scenario 6: Change quantity and verify total price
  // ----------------------------------------------------
  console.log('\n--- Scenario 6: Change quantity and verify total price calculation ---');
  const msg6_qty1 = buildOrderMessage({
    product: mensTee,
    color: 'Black',
    size: 'L',
    quantity: 1,
    productUrl: 'https://noolz.in/product/p-men-1',
  });
  const msg6_qty5 = buildOrderMessage({
    product: mensTee,
    color: 'Black',
    size: 'L',
    quantity: 5,
    productUrl: 'https://noolz.in/product/p-men-1',
  });
  assert(msg6_qty1.includes('• Total Price: ₹ 899'), 'Total for 1 item: ₹ 899');
  assert(msg6_qty5.includes('• Total Price: ₹ 4,495'), 'Total for 5 items: ₹ 4,495 (899 * 5)');

  // ----------------------------------------------------
  // Scenario 7: Validation guards
  // ----------------------------------------------------
  console.log('\n--- Scenario 7: Validation handling ---');
  const emptyProduct = buildOrderMessage({ product: null });
  assert(emptyProduct === '', 'Returns empty string if no product is passed');

  // ----------------------------------------------------
  // Scenario 8: Verify exact WhatsApp message template structure
  // ----------------------------------------------------
  console.log('\n--- Scenario 8: Exact professional template format ---');
  const expectedFormat = [
    'Hello NOOLZ,',
    '',
    'I would like to order this piece from your catalogue:',
    '',
    '• Product: "Golden Hour Tee"',
    '• Colorway: Black',
    '• Size: L',
    '• Quantity: 1',
    '• Total Price: ₹ 899',
    '• Product Link: https://noolz.in/product/p-men-1',
    '',
    'Please confirm availability and payment/delivery details.',
    '',
    'Thank you!',
  ].join('\n');

  assert(msg1 === expectedFormat, 'Generated message strictly matches the 14-line specification');

  // ----------------------------------------------------
  // Scenario 9: Verify message opens to NOOLZ admin WhatsApp number
  // ----------------------------------------------------
  console.log('\n--- Scenario 9: Admin WhatsApp URL generation ---');
  const targetUrl = whatsappUrl(adminNumber, msg1);
  assert(targetUrl.startsWith('https://wa.me/919585123004?text='), 'Target number is 919585123004 without +, spaces or hyphens');
  assert(targetUrl.includes(encodeURIComponent('• Product: "Golden Hour Tee"')), 'Message is percent-encoded via encodeURIComponent');

  // Test sanitizer with various input formats:
  assert(sanitizeWhatsAppNumber('+91 9585123004') === '919585123004', 'Strips + and spaces');
  assert(sanitizeWhatsAppNumber('91-95851-23004') === '919585123004', 'Strips hyphens');

  // ----------------------------------------------------
  // Scenario 10: Verify product link is present and valid
  // ----------------------------------------------------
  console.log('\n--- Scenario 10: Deployed product link validation ---');
  const sampleUrl = 'https://noolz.in/product/p-men-1';
  assert(targetUrl.includes(encodeURIComponent(sampleUrl)), 'Encoded WhatsApp URL carries complete deployed product link');

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runWhatsAppTests();
