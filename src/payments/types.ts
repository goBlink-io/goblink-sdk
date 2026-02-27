/** Payment request status */
export interface PaymentStatus {
  /** Current status: 'active' | 'processing' | 'paid' | 'failed' | 'expired' | 'invalid' */
  status: string;
  /** When the payment was completed (ISO string) */
  paid_at?: string | null;
  /** Payer's on-chain tx hash */
  send_tx_hash?: string | null;
  /** Fulfillment tx hash on destination chain */
  fulfillment_tx_hash?: string | null;
  /** Payer's wallet address */
  payer_address?: string | null;
  /** Payer's chain */
  payer_chain?: string | null;
  /** Deposit address used */
  deposit_address?: string | null;
  /** Expiry timestamp (ISO string) */
  expiresAt?: string;
  /** Expiry timestamp if expired */
  expiredAt?: string;
}

/** Request to mark a payment as processing/completed */
export interface CompletePaymentRequest {
  /** Payment link ID */
  paymentId: string;
  /** On-chain transaction hash from the sender */
  sendTxHash?: string;
  /** Deposit address from the quote */
  depositAddress?: string;
  /** Payer's wallet address */
  payerAddress?: string;
  /** Payer's chain */
  payerChain?: string;
}

/** Request to finalize a payment outcome */
export interface FinalizePaymentRequest {
  /** Payment link ID */
  paymentId: string;
  /** Fulfillment tx hash on destination chain */
  fulfillmentTxHash?: string;
  /** Outcome: 'paid' or 'failed' */
  outcome: 'paid' | 'failed';
}

/** Simple OK response */
export interface PaymentActionResponse {
  ok: boolean;
  status: string;
}
