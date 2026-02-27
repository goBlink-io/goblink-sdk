import type { GoBlinkApi } from '../api/goblink-api.js';
import type { Transaction, TransactionHistoryQuery, CreateTransactionRequest } from './types.js';

/**
 * Fetch transaction history for a wallet address.
 *
 * @param api - GoBlinkApi instance
 * @param query - Query options (walletAddress required)
 * @returns Array of transaction records
 */
export async function getTransactionHistory(
  api: GoBlinkApi,
  query: TransactionHistoryQuery,
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  params.set('walletAddress', query.walletAddress);
  if (query.chain) params.set('chain', query.chain);
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));

  return api.get<Transaction[]>(`/api/transactions?${params.toString()}`);
}

/**
 * Get a single transaction by ID.
 *
 * @param api - GoBlinkApi instance
 * @param transactionId - Transaction ID
 * @returns Transaction record
 */
export async function getTransaction(
  api: GoBlinkApi,
  transactionId: string,
): Promise<Transaction> {
  return api.get<Transaction>(`/api/transactions/${encodeURIComponent(transactionId)}`);
}

/**
 * Create a transaction record on goblink.io.
 * Used to log a transfer initiated via the SDK for history tracking.
 *
 * @param api - GoBlinkApi instance
 * @param request - Transaction details
 * @returns Created transaction record
 */
export async function createTransaction(
  api: GoBlinkApi,
  request: CreateTransactionRequest,
): Promise<Transaction> {
  return api.post<Transaction>('/api/transactions', request);
}

/**
 * Sync/refresh the status of a transaction from on-chain data.
 *
 * @param api - GoBlinkApi instance
 * @param transactionId - Transaction ID to sync
 * @returns Updated transaction record
 */
export async function syncTransaction(
  api: GoBlinkApi,
  transactionId: string,
): Promise<Transaction> {
  return api.post<Transaction>(
    `/api/transactions/${encodeURIComponent(transactionId)}/sync`,
    {},
  );
}
