import { GoBlinkError } from '../errors.js';
import type { TransferStatus, TransferStatusValue } from './types.js';

/** Terminal states — polling stops when one of these is reached */
const TERMINAL_STATUSES: ReadonlySet<TransferStatusValue> = new Set([
  'SUCCESS',
  'FAILED',
  'REFUNDED',
  'EXPIRED',
]);

/** Options for waitForCompletion */
export interface WaitForCompletionOptions {
  /** Maximum time to wait in milliseconds (default: 600000 = 10 min) */
  timeout?: number;
  /** Poll interval in milliseconds (default: 5000 = 5s) */
  interval?: number;
  /** Called whenever the status changes */
  onStatusChange?: (status: TransferStatus) => void;
}

/**
 * Poll getTransferStatus() until a terminal state is reached or the timeout expires.
 *
 * @param depositAddress - The deposit address returned from createTransfer
 * @param getStatus - Function that fetches the current status
 * @param options - Polling configuration
 * @returns The final transfer status
 * @throws GoBlinkError on timeout
 */
export async function waitForCompletion(
  depositAddress: string,
  getStatus: (depositAddress: string) => Promise<TransferStatus>,
  options: WaitForCompletionOptions = {},
): Promise<TransferStatus> {
  const timeout = options.timeout ?? 600_000;
  const interval = options.interval ?? 5_000;
  const { onStatusChange } = options;

  const deadline = Date.now() + timeout;
  let lastStatus: TransferStatusValue | undefined;

  while (Date.now() < deadline) {
    const status = await getStatus(depositAddress);

    if (status.status !== lastStatus) {
      lastStatus = status.status;
      onStatusChange?.(status);
    }

    if (TERMINAL_STATUSES.has(status.status)) {
      return status;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    await sleep(Math.min(interval, remaining));
  }

  throw new GoBlinkError(
    `waitForCompletion timed out after ${timeout}ms for deposit address: ${depositAddress}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
