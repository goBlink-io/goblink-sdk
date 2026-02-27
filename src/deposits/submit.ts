import type { GoBlinkApi } from '../api/goblink-api.js';
import type { SubmitDepositRequest, SubmitDepositResponse } from './types.js';
import { GoBlinkValidationError } from '../errors.js';

/**
 * Notify goblink.io that a deposit transaction has been sent on-chain.
 * This speeds up transfer tracking — the system doesn't have to wait for
 * automatic detection.
 *
 * @param api - GoBlinkApi instance
 * @param request - Deposit details (txHash + depositAddress)
 * @returns Confirmation response
 */
export async function submitDeposit(
  api: GoBlinkApi,
  request: SubmitDepositRequest,
): Promise<SubmitDepositResponse> {
  if (!request.txHash || request.txHash.length < 10) {
    throw new GoBlinkValidationError('Invalid transaction hash', 'txHash');
  }
  if (!request.depositAddress || request.depositAddress.length < 10) {
    throw new GoBlinkValidationError('Invalid deposit address', 'depositAddress');
  }

  return api.post<SubmitDepositResponse>('/api/deposit/submit', {
    txHash: request.txHash,
    depositAddress: request.depositAddress,
  });
}
