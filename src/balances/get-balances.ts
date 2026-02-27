import type { GoBlinkApi } from '../api/goblink-api.js';
import type { BalanceQuery, BalanceResponse, NativeBalance, TokenBalance } from './types.js';

/**
 * Query wallet balances via the goblink.io balance proxy.
 * Supports EVM, Solana, Sui, and NEAR chains.
 */
export async function getBalances(
  api: GoBlinkApi,
  query: BalanceQuery,
): Promise<BalanceResponse> {
  const { chainType, chain, address, includeTokens } = query;
  const result: BalanceResponse = {};

  switch (chainType) {
    case 'evm': {
      const evmChain = chain ?? 'ethereum';
      result.native = await api.get<NativeBalance>(
        `/api/balances/evm/${encodeURIComponent(evmChain)}/${encodeURIComponent(address)}`,
      );
      if (includeTokens) {
        result.tokens = await api.get<TokenBalance[]>(
          `/api/balances/evm-token/${encodeURIComponent(evmChain)}/${encodeURIComponent(address)}`,
        ).catch(() => []);
      }
      break;
    }
    case 'solana': {
      result.native = await api.get<NativeBalance>(
        `/api/balances/solana/${encodeURIComponent(address)}`,
      );
      if (includeTokens) {
        result.tokens = await api.get<TokenBalance[]>(
          `/api/balances/solana-token/${encodeURIComponent(address)}`,
        ).catch(() => []);
      }
      break;
    }
    case 'sui': {
      result.native = await api.get<NativeBalance>(
        `/api/balances/sui/${encodeURIComponent(address)}`,
      );
      if (includeTokens) {
        result.tokens = await api.get<TokenBalance[]>(
          `/api/balances/sui-tokens/${encodeURIComponent(address)}`,
        ).catch(() => []);
      }
      break;
    }
    case 'near': {
      result.native = await api.get<NativeBalance>(
        `/api/balances/near/${encodeURIComponent(address)}`,
      );
      if (includeTokens) {
        result.tokens = await api.get<TokenBalance[]>(
          `/api/balances/near-token/${encodeURIComponent(address)}`,
        ).catch(() => []);
      }
      break;
    }
  }

  return result;
}
