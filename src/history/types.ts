/** Transaction record from goblink.io */
export interface Transaction {
  id: string;
  wallet_address: string;
  wallet_chain: string;
  deposit_address?: string;
  from_chain: string;
  from_token: string;
  to_chain: string;
  to_token: string;
  amount_in: string;
  amount_out?: string;
  amount_usd?: string;
  recipient: string;
  refund_to?: string;
  status: string;
  deposit_tx_hash?: string;
  fee_bps?: number;
  fee_amount?: string;
  quote_id?: string;
  source?: string;
  payment_request_id?: string;
  created_at: string;
  updated_at: string;
}

/** Options for querying transaction history */
export interface TransactionHistoryQuery {
  /** Wallet address to query */
  walletAddress: string;
  /** Optional chain filter */
  chain?: string;
  /** Maximum number of results (default: 50) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/** Options for creating a transaction record */
export interface CreateTransactionRequest {
  walletAddress: string;
  walletChain: string;
  depositAddress?: string;
  fromChain: string;
  fromToken: string;
  toChain: string;
  toToken: string;
  amountIn: string;
  amountOut?: string;
  amountUsd?: string;
  recipient: string;
  refundTo?: string;
  status?: string;
  depositTxHash?: string;
  feeBps?: number;
  feeAmount?: string;
  quoteId?: string;
  source?: string;
  paymentRequestId?: string;
}
