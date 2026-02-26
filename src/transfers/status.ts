import type { ApiClient } from '../internal/api-client.js';
import type { TransferStatus, TransferStatusValue } from './types.js';
import type { ChainId } from '../chains/types.js';

/** Known status values from the upstream API */
const STATUS_MAP: Record<string, TransferStatusValue> = {
  PENDING: 'PENDING',
  PENDING_DEPOSIT: 'PENDING',
  KNOWN_DEPOSIT_TX: 'PROCESSING',
  INCOMPLETE_DEPOSIT: 'PROCESSING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'SUCCESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
};

/**
 * Get the current status of a transfer by its deposit address
 */
export async function getTransferStatus(
  depositAddress: string,
  apiClient: ApiClient,
  _destinationChain?: ChainId,
): Promise<TransferStatus> {
  const result = await apiClient.getExecutionStatus(depositAddress);

  const status: TransferStatusValue = STATUS_MAP[result.status.toUpperCase()] ?? 'PROCESSING';

  // Extract tx hashes and explorer URLs from swap details
  const details = result.swapDetails;
  let txHash: string | undefined;
  let explorerUrl: string | undefined;

  if (details?.destinationChainTxHashes?.length) {
    const destTx = details.destinationChainTxHashes[0]!;
    txHash = destTx.hash;
    explorerUrl = destTx.explorerUrl || undefined;
  } else if (details?.originChainTxHashes?.length) {
    const srcTx = details.originChainTxHashes[0]!;
    txHash = srcTx.hash;
    explorerUrl = srcTx.explorerUrl || undefined;
  }

  return {
    status,
    txHash,
    explorerUrl,
    amountOut: details?.amountOutFormatted,
    amountOutUsd: details?.amountOutUsd,
  };
}
