import type { PaymentLinkOptions, BadgeOptions } from './types.js';

const BASE_URL = 'https://goblink.io/pay';
const SHIELDS_URL = 'https://img.shields.io/badge';

/**
 * Build a goblink.io payment link from the given options.
 * All values are URL-encoded automatically.
 */
export function createPaymentLink(options: PaymentLinkOptions): string {
  const params = new URLSearchParams();
  params.set('to', options.recipient);
  params.set('chain', options.chain);
  params.set('token', options.token);
  if (options.amount !== undefined) params.set('amount', options.amount);
  if (options.message !== undefined) params.set('msg', options.message);
  if (options.redirect !== undefined) params.set('redirect', options.redirect);
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * Build a Markdown badge string for embedding in a GitHub README.
 *
 * @example
 * ```
 * [![Donate with goBlink](https://img.shields.io/badge/Donate-goBlink-blue)](https://goblink.io/pay?to=0x...)
 * ```
 */
export function createBadge(options: BadgeOptions): string {
  const label = options.label ?? 'Donate with goBlink';
  const color = options.color ?? 'blue';

  const payUrl = createPaymentLink({
    recipient: options.recipient,
    chain: options.chain,
    token: options.token,
    amount: options.amount,
  });

  // Shields.io format: label-message-color (encode hyphens in values)
  const shieldLabel = encodeURIComponent(label);
  const shieldMessage = 'goBlink';
  const imgUrl = `${SHIELDS_URL}/${shieldLabel}-${shieldMessage}-${color}`;

  return `[![${label}](${imgUrl})](${payUrl})`;
}
