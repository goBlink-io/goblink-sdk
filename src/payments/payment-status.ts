import type { GoBlinkApi } from '../api/goblink-api.js';
import type {
  PaymentStatus,
  CompletePaymentRequest,
  FinalizePaymentRequest,
  PaymentActionResponse,
} from './types.js';

/**
 * Check the status of a payment request (created via shortenPaymentLink).
 *
 * @param api - GoBlinkApi instance
 * @param paymentId - The short payment link ID (e.g., "AbC12xYz")
 * @returns Payment status including paid_at, tx hashes, payer info
 */
export async function getPaymentStatus(
  api: GoBlinkApi,
  paymentId: string,
): Promise<PaymentStatus> {
  return api.get<PaymentStatus>(`/api/pay/${encodeURIComponent(paymentId)}/status`);
}

/**
 * Mark a payment as processing — called when the payer signs the deposit transaction.
 * This is an intermediate state before on-chain confirmation.
 *
 * @param api - GoBlinkApi instance
 * @param request - Payment completion details
 * @returns Confirmation response
 */
export async function completePayment(
  api: GoBlinkApi,
  request: CompletePaymentRequest,
): Promise<PaymentActionResponse> {
  return api.post<PaymentActionResponse>(
    `/api/pay/${encodeURIComponent(request.paymentId)}/complete`,
    {
      sendTxHash: request.sendTxHash,
      depositAddress: request.depositAddress,
      payerAddress: request.payerAddress,
      payerChain: request.payerChain,
    },
  );
}

/**
 * Finalize a payment outcome — promotes from 'processing' to 'paid' or 'failed'.
 * Called after on-chain confirmation.
 *
 * @param api - GoBlinkApi instance
 * @param request - Finalization details
 * @returns Confirmation response
 */
export async function finalizePayment(
  api: GoBlinkApi,
  request: FinalizePaymentRequest,
): Promise<PaymentActionResponse> {
  return api.patch<PaymentActionResponse>(
    `/api/pay/${encodeURIComponent(request.paymentId)}/complete`,
    {
      fulfillmentTxHash: request.fulfillmentTxHash,
      outcome: request.outcome,
    },
  );
}
