import { ApiClient } from './internal/api-client.js';
import { GoBlinkApi } from './api/goblink-api.js';
import { AssetMapper } from './internal/asset-mapping.js';
import { TokenListProvider } from './tokens/list.js';
import { filterTokens } from './tokens/filter.js';
import { getQuote } from './quotes/get-quote.js';
import { calculateFee, DEFAULT_FEE_TIERS, DEFAULT_MIN_FEE_BPS } from './quotes/fees.js';
import type { FeeTier } from './quotes/fees.js';
import { createTransfer } from './transfers/create.js';
import { getTransferStatus } from './transfers/status.js';
import { waitForCompletion } from './transfers/wait.js';
import type { WaitForCompletionOptions } from './transfers/wait.js';
import { validateAddress } from './validation/address.js';
import { getAllChains } from './chains/config.js';
import { createPaymentLink, createBadge, shortenPaymentLink } from './links/payment-link.js';
import type { PaymentLinkOptions, BadgeOptions, ShortenOptions, ShortenResponse } from './links/types.js';
import { getTokenPrices } from './prices/get-prices.js';
import type { TokenPrice } from './prices/types.js';
import { getBalances } from './balances/get-balances.js';
import type { BalanceQuery, BalanceResponse } from './balances/types.js';
import { submitDeposit } from './deposits/submit.js';
import type { SubmitDepositResponse } from './deposits/types.js';
import { getPaymentStatus, completePayment, finalizePayment } from './payments/payment-status.js';
import type { PaymentStatus, CompletePaymentRequest, FinalizePaymentRequest, PaymentActionResponse } from './payments/types.js';
import { getTransactionHistory, getTransaction, createTransaction, syncTransaction } from './history/transactions.js';
import type { Transaction, TransactionHistoryQuery, CreateTransactionRequest } from './history/types.js';
import type { ChainId, ChainConfig } from './chains/types.js';
import type { Token, TokenFilterOptions } from './tokens/types.js';
import type { QuoteRequest, QuoteResponse, FeeInfo } from './quotes/types.js';
import type { TransferRequest, TransferResponse, TransferStatus } from './transfers/types.js';

/** Configuration options for the GoBlink client */
export interface GoBlinkOptions {
  /** Fee tiers (defaults to goBlink standard tiers) */
  fees?: FeeTier[];
  /** Minimum fee floor in basis points (default: 5) */
  minFee?: number;
  /** Fee recipient account (default: "goblink.near") */
  feeRecipient?: string;
  /** Protocol API base URL (for internal use / testing) */
  baseUrl?: string;
  /** goblink.io API base URL (default: "https://goblink.io") */
  goBlinkUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Token list cache TTL in milliseconds (default: 300000 = 5 min) */
  cacheTtl?: number;
}

/**
 * GoBlink SDK — cross-chain token transfers made simple.
 *
 * @example
 * ```typescript
 * const gb = new GoBlink();
 * const tokens = await gb.getTokens();
 * const quote = await gb.getQuote({
 *   from: { chain: 'ethereum', token: 'USDC' },
 *   to: { chain: 'solana', token: 'USDC' },
 *   amount: '100',
 *   recipient: '7xKp...3mNw',
 *   refundAddress: '0xABC...123',
 * });
 * ```
 */
export class GoBlink {
  private readonly apiClient: ApiClient;
  private readonly goBlinkApi: GoBlinkApi;
  private readonly mapper: AssetMapper;
  private readonly tokenList: TokenListProvider;
  private readonly feeTiers: FeeTier[];
  private readonly minFeeBps: number;
  private readonly feeRecipient: string;

  constructor(options: GoBlinkOptions = {}) {
    this.apiClient = new ApiClient({
      baseUrl: options.baseUrl,
      timeout: options.timeout,
    });
    this.goBlinkApi = new GoBlinkApi({
      baseUrl: options.goBlinkUrl,
      timeout: options.timeout,
    });
    this.mapper = new AssetMapper();
    this.tokenList = new TokenListProvider(
      this.apiClient,
      this.mapper,
      options.cacheTtl,
    );
    this.feeTiers = options.fees ?? DEFAULT_FEE_TIERS;
    this.minFeeBps = options.minFee ?? DEFAULT_MIN_FEE_BPS;
    this.feeRecipient = options.feeRecipient ?? 'goblink.near';
  }

  /**
   * Get all supported tokens, optionally filtered by chain or search query.
   * Results are cached for the configured TTL.
   *
   * @param options - Filter options
   * @returns Array of supported tokens
   */
  async getTokens(options?: TokenFilterOptions): Promise<Token[]> {
    const tokens = await this.tokenList.getTokens();
    return options ? filterTokens(tokens, options) : tokens;
  }

  /**
   * Get a quote for a cross-chain transfer.
   * This is a dry run — no funds are committed.
   *
   * @param request - Quote request parameters
   * @returns Quote with deposit address, amounts, fee, and estimated time
   */
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    await this.tokenList.ensureInitialized();
    return getQuote(request, this.apiClient, this.mapper, {
      feeRecipient: this.feeRecipient,
      feeTiers: this.feeTiers,
      minFeeBps: this.minFeeBps,
    });
  }

  /**
   * Create a real cross-chain transfer.
   * After calling this, send the exact deposit amount to the returned deposit address.
   *
   * @param request - Transfer request parameters
   * @returns Transfer details including deposit address
   */
  async createTransfer(request: TransferRequest): Promise<TransferResponse> {
    await this.tokenList.ensureInitialized();
    return createTransfer(request, this.apiClient, this.mapper, {
      feeRecipient: this.feeRecipient,
      feeTiers: this.feeTiers,
      minFeeBps: this.minFeeBps,
    });
  }

  /**
   * Check the status of a transfer by its deposit address.
   *
   * @param depositAddress - The deposit address returned from createTransfer
   * @returns Current transfer status
   */
  async getTransferStatus(depositAddress: string): Promise<TransferStatus> {
    return getTransferStatus(depositAddress, this.apiClient);
  }

  /**
   * Validate an address for a specific chain.
   *
   * @param chain - Chain identifier
   * @param address - Address to validate
   * @returns true if the address is valid
   */
  validateAddress(chain: ChainId, address: string): boolean {
    return validateAddress(chain, address);
  }

  /**
   * Get all supported chains with their configurations.
   *
   * @returns Array of chain configurations
   */
  getChains(): ChainConfig[] {
    return getAllChains();
  }

  /**
   * Calculate the fee for a given USD amount.
   *
   * @param amountUsd - Transaction amount in USD
   * @returns Fee information including BPS, percentage, and tier
   */
  calculateFee(amountUsd: number): FeeInfo {
    return calculateFee(amountUsd, this.feeTiers, this.minFeeBps);
  }

  /**
   * Clear the cached token list, forcing a fresh fetch on next call.
   */
  clearCache(): void {
    this.tokenList.clearCache();
  }

  /**
   * Generate a shareable goblink.io payment link.
   *
   * @param options - Payment link options (recipient, chain, token, optional amount/message/redirect)
   * @returns Full payment URL string
   *
   * @example
   * ```typescript
   * const url = gb.createPaymentLink({
   *   recipient: '0xABC...123',
   *   chain: 'ethereum',
   *   token: 'USDC',
   *   amount: '50',
   *   message: 'Invoice #42',
   * });
   * ```
   */
  createPaymentLink(options: PaymentLinkOptions): string {
    return createPaymentLink(options);
  }

  /**
   * Generate a Markdown badge for embedding in a GitHub README.
   *
   * @param options - Badge options (recipient, chain, token, optional label/color/amount)
   * @returns Markdown badge string
   *
   * @example
   * ```typescript
   * const badge = gb.createBadge({
   *   recipient: '0xABC...123',
   *   chain: 'ethereum',
   *   token: 'USDC',
   *   label: 'Donate with goBlink',
   * });
   * ```
   */
  createBadge(options: BadgeOptions): string {
    return createBadge(options);
  }

  /**
   * Create a short payment link via the goblink.io API.
   * Returns a short URL like `https://goblink.io/pay/AbC12xYz` instead of a long query string.
   *
   * @param options - Payment link options (recipient, chain, token, amount required)
   * @returns Short link ID and URL
   *
   * @example
   * ```typescript
   * const short = await gb.shortenPaymentLink({
   *   recipient: '0xABC...123',
   *   chain: 'ethereum',
   *   token: 'USDC',
   *   amount: '50',
   *   memo: 'Invoice #42',
   * });
   * console.log(short.url); // "https://goblink.io/pay/AbC12xYz"
   * ```
   */
  async shortenPaymentLink(options: ShortenOptions): Promise<ShortenResponse> {
    return shortenPaymentLink(options, this.apiClient['timeout']);
  }

  /**
   * Poll a transfer until it reaches a terminal state (SUCCESS, FAILED, REFUNDED, EXPIRED).
   *
   * @param depositAddress - The deposit address returned from createTransfer
   * @param options - Polling options (timeout, interval, onStatusChange)
   * @returns The final transfer status
   * @throws GoBlinkError on timeout
   *
   * @example
   * ```typescript
   * const finalStatus = await gb.waitForCompletion(depositAddress, {
   *   timeout: 600000,
   *   interval: 5000,
   *   onStatusChange: (s) => console.log('Status:', s.status),
   * });
   * ```
   */
  async waitForCompletion(
    depositAddress: string,
    options?: WaitForCompletionOptions,
  ): Promise<TransferStatus> {
    return waitForCompletion(
      depositAddress,
      (addr) => this.getTransferStatus(addr),
      options,
    );
  }

  // ── goblink.io API methods ──────────────────────────────────────────────

  /**
   * Notify goblink.io that a deposit transaction has been sent on-chain.
   * Speeds up transfer tracking instead of waiting for automatic detection.
   *
   * @param txHash - On-chain transaction hash of the deposit
   * @param depositAddress - Deposit address returned from createTransfer
   * @returns Confirmation response
   *
   * @example
   * ```typescript
   * await gb.submitDeposit(
   *   '0xabc123...', // tx hash from wallet signing
   *   transfer.depositAddress,
   * );
   * ```
   */
  async submitDeposit(txHash: string, depositAddress: string): Promise<SubmitDepositResponse> {
    return submitDeposit(this.goBlinkApi, { txHash, depositAddress });
  }

  /**
   * Get USD prices for all supported tokens.
   * Cached server-side for 2 minutes.
   *
   * @returns Array of token prices
   *
   * @example
   * ```typescript
   * const prices = await gb.getTokenPrices();
   * const usdcPrice = prices.find(p => p.assetId.includes('usdc'));
   * ```
   */
  async getTokenPrices(): Promise<TokenPrice[]> {
    return getTokenPrices(this.goBlinkApi);
  }

  /**
   * Query wallet balances via the goblink.io balance proxy.
   * Supports EVM, Solana, Sui, and NEAR chains.
   *
   * @param query - Balance query options
   * @returns Balance response with native and optional token balances
   *
   * @example
   * ```typescript
   * const bal = await gb.getBalances({
   *   chainType: 'evm',
   *   chain: 'ethereum',
   *   address: '0xABC...123',
   *   includeTokens: true,
   * });
   * console.log(bal.native?.balance); // "1.234"
   * ```
   */
  async getBalances(query: BalanceQuery): Promise<BalanceResponse> {
    return getBalances(this.goBlinkApi, query);
  }

  /**
   * Get transaction history for a wallet address.
   *
   * @param query - Query options (walletAddress required)
   * @returns Array of transaction records
   *
   * @example
   * ```typescript
   * const history = await gb.getTransactionHistory({
   *   walletAddress: '0xABC...123',
   *   limit: 20,
   * });
   * ```
   */
  async getTransactionHistory(query: TransactionHistoryQuery): Promise<Transaction[]> {
    return getTransactionHistory(this.goBlinkApi, query);
  }

  /**
   * Get a single transaction by ID.
   *
   * @param transactionId - Transaction ID
   * @returns Transaction record
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    return getTransaction(this.goBlinkApi, transactionId);
  }

  /**
   * Create a transaction record on goblink.io for history tracking.
   *
   * @param request - Transaction details
   * @returns Created transaction record
   */
  async createTransactionRecord(request: CreateTransactionRequest): Promise<Transaction> {
    return createTransaction(this.goBlinkApi, request);
  }

  /**
   * Sync/refresh a transaction's status from on-chain data.
   *
   * @param transactionId - Transaction ID to sync
   * @returns Updated transaction record
   */
  async syncTransaction(transactionId: string): Promise<Transaction> {
    return syncTransaction(this.goBlinkApi, transactionId);
  }

  /**
   * Check the status of a payment request (created via shortenPaymentLink).
   *
   * @param paymentId - Short payment link ID (e.g., "AbC12xYz")
   * @returns Payment status including paid_at, tx hashes, payer info
   *
   * @example
   * ```typescript
   * const status = await gb.getPaymentStatus('AbC12xYz');
   * if (status.status === 'paid') {
   *   console.log('Payment received at:', status.paid_at);
   * }
   * ```
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return getPaymentStatus(this.goBlinkApi, paymentId);
  }

  /**
   * Mark a payment as processing — call when the payer signs the deposit transaction.
   *
   * @param request - Payment completion details
   * @returns Confirmation response
   *
   * @example
   * ```typescript
   * await gb.completePayment({
   *   paymentId: 'AbC12xYz',
   *   sendTxHash: '0xabc...',
   *   depositAddress: '0xdep...',
   *   payerAddress: '0xpayer...',
   *   payerChain: 'ethereum',
   * });
   * ```
   */
  async completePayment(request: CompletePaymentRequest): Promise<PaymentActionResponse> {
    return completePayment(this.goBlinkApi, request);
  }

  /**
   * Finalize a payment outcome — promotes from 'processing' to 'paid' or 'failed'.
   *
   * @param request - Finalization details
   * @returns Confirmation response
   */
  async finalizePayment(request: FinalizePaymentRequest): Promise<PaymentActionResponse> {
    return finalizePayment(this.goBlinkApi, request);
  }
}
