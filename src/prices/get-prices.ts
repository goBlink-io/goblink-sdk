import type { GoBlinkApi } from '../api/goblink-api.js';
import type { TokenPrice } from './types.js';

/**
 * Fetch USD prices for all supported tokens.
 * Prices are sourced from the underlying protocol and cached server-side for 2 minutes.
 */
export async function getTokenPrices(api: GoBlinkApi): Promise<TokenPrice[]> {
  return api.get<TokenPrice[]>('/api/tokens/prices');
}
