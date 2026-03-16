/** Supported chain identifiers */
type ChainId = 'ethereum' | 'base' | 'arbitrum' | 'bnb' | 'polygon' | 'optimism' | 'avalanche' | 'gnosis' | 'berachain' | 'monad' | 'aurora' | 'xlayer' | 'near' | 'solana' | 'sui' | 'bitcoin' | 'litecoin' | 'dogecoin' | 'bitcoincash' | 'tron' | 'ton' | 'stellar' | 'xrp' | 'starknet' | 'cardano' | 'aptos' | 'aleo' | 'zcash';
/** Chain network type */
type ChainType = 'evm' | 'utxo' | 'account' | 'move';
/** Chain configuration */
interface ChainConfig {
    /** Unique chain identifier */
    id: ChainId;
    /** Human-readable chain name */
    name: string;
    /** Network type */
    type: ChainType;
    /** Numeric chain ID (EVM only) */
    chainId?: number;
    /** Block explorer base URL */
    explorer: string;
    /** Transaction path template (use {hash} placeholder) */
    explorerTxPath: string;
    /** Native token symbol */
    nativeToken: string;
}

/** Asset reference used in quote/transfer requests */
interface AssetReference {
    /** Chain identifier */
    chain: ChainId;
    /** Token symbol (e.g., "USDC", "ETH") */
    token: string;
}
/** Request parameters for getting a quote */
interface QuoteRequest {
    /** Source asset */
    from: AssetReference;
    /** Destination asset */
    to: AssetReference;
    /** Human-readable amount to send (e.g., "100.5") */
    amount: string;
    /** Recipient address on the destination chain */
    recipient: string;
    /** Refund address on the source chain */
    refundAddress: string;
    /** Slippage tolerance in basis points (default: 100 = 1%) */
    slippage?: number;
    /**
     * Webhook URL for quote/transfer status notifications.
     * Reserved for forward compatibility — delivery is a planned feature.
     */
    webhookUrl?: string;
}
/** Quote response returned to the user */
interface QuoteResponse {
    /** Unique quote identifier */
    quoteId: string;
    /** Address to deposit funds to */
    depositAddress: string;
    /** Amount the user needs to send (human-readable) */
    amountIn: string;
    /** Amount the recipient will receive (human-readable) */
    amountOut: string;
    /** Amount in USD */
    amountInUsd?: string;
    /** Amount out USD */
    amountOutUsd?: string;
    /** Fee applied */
    fee: FeeInfo;
    /** Exchange rate (destination per source) */
    rate: string;
    /** Estimated processing time in seconds */
    estimatedTime: number;
    /** Quote expiration time */
    expiresAt: string;
    /** Signature for submitting the quote */
    signature?: string;
    /** Timestamp of the quote */
    timestamp?: string;
}
/** Fee information included in quotes */
interface FeeInfo {
    /** Fee in basis points */
    bps: number;
    /** Fee as percentage string (e.g., "0.35") */
    percent: string;
    /** Fee tier label */
    tier: string;
}

/** A fee tier defining the rate for a given amount range */
interface FeeTier {
    /** Maximum USD amount for this tier (null = unlimited) */
    maxAmountUsd: number | null;
    /** Fee in basis points */
    bps: number;
}

/** Request parameters for creating a transfer */
interface TransferRequest {
    /** Source asset */
    from: AssetReference;
    /** Destination asset */
    to: AssetReference;
    /** Human-readable amount to send (e.g., "100.5") */
    amount: string;
    /** Recipient address on the destination chain */
    recipient: string;
    /** Refund address on the source chain */
    refundAddress: string;
    /** Slippage tolerance in basis points (default: 100 = 1%) */
    slippage?: number;
    /**
     * Webhook URL for transfer status notifications.
     * Reserved for forward compatibility — delivery is a planned feature.
     */
    webhookUrl?: string;
}
/** Transfer creation response */
interface TransferResponse {
    /** Transfer identifier */
    id: string;
    /** Address to deposit funds to */
    depositAddress: string;
    /** Exact amount to deposit (human-readable) */
    depositAmount: string;
    /** Transfer expiration time */
    expiresAt: string;
}
/** Transfer status values */
type TransferStatusValue = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
/** Transfer status response */
interface TransferStatus {
    /** Current status of the transfer */
    status: TransferStatusValue;
    /** Transaction hash on the destination chain (if available) */
    txHash?: string;
    /** Block explorer URL for the transaction (if available) */
    explorerUrl?: string;
    /** Amount received (human-readable) */
    amountOut?: string;
    /** Amount received in USD */
    amountOutUsd?: string;
}

/** Options for waitForCompletion */
interface WaitForCompletionOptions {
    /** Maximum time to wait in milliseconds (default: 600000 = 10 min) */
    timeout?: number;
    /** Poll interval in milliseconds (default: 5000 = 5s) */
    interval?: number;
    /** Called whenever the status changes */
    onStatusChange?: (status: TransferStatus) => void;
}

/** Options for creating a payment link */
interface PaymentLinkOptions {
    /** Recipient wallet address */
    recipient: string;
    /** Destination chain identifier */
    chain: string;
    /** Token symbol (e.g., "USDC") */
    token: string;
    /** Fixed amount — if omitted, payer chooses */
    amount?: string;
    /** Optional message (e.g., "Invoice #42") */
    message?: string;
    /** Redirect URL after payment */
    redirect?: string;
}
/** Options for creating a short payment link */
interface ShortenOptions {
    /** Recipient wallet address */
    recipient: string;
    /** Destination chain identifier */
    chain: string;
    /** Token symbol (e.g., "USDC") */
    token: string;
    /** Payment amount */
    amount: string;
    /** Optional memo/message */
    memo?: string;
    /** Requester display name */
    name?: string;
}
/** Response from the shorten endpoint */
interface ShortenResponse {
    /** Short link ID */
    id: string;
    /** Full short URL (e.g., "https://goblink.io/pay/AbC12xYz") */
    url: string;
}
/** Options for creating a README badge */
interface BadgeOptions {
    /** Recipient wallet address */
    recipient: string;
    /** Destination chain identifier */
    chain: string;
    /** Token symbol (e.g., "USDC") */
    token: string;
    /** Badge label text (default: "Donate with goBlink") */
    label?: string;
    /** Fixed amount — if omitted, payer chooses */
    amount?: string;
    /** Badge color (default: "blue") */
    color?: string;
}

/** Token price entry from the goblink.io API */
interface TokenPrice {
    /** Protocol asset ID */
    assetId: string;
    /** USD price as string (e.g., "1.0001") */
    priceUsd?: string;
}

/** Supported chain types for balance queries */
type BalanceChainType = 'evm' | 'solana' | 'sui' | 'near';
/** Native balance result */
interface NativeBalance {
    /** Balance in human-readable format */
    balance: string;
    /** Token symbol */
    symbol: string;
    /** Token decimals */
    decimals: number;
    /** Raw/atomic balance */
    raw?: string;
}
/** Token balance entry */
interface TokenBalance {
    /** Contract address or token identifier */
    contractAddress: string;
    /** Token symbol */
    symbol: string;
    /** Balance in human-readable format */
    balance: string;
    /** Token decimals */
    decimals: number;
    /** Raw/atomic balance */
    raw?: string;
}
/** Balance query options */
interface BalanceQuery {
    /** Chain type */
    chainType: BalanceChainType;
    /** Specific chain ID for EVM (e.g., 'ethereum', 'base', 'arbitrum') */
    chain?: string;
    /** Wallet address */
    address: string;
    /** Query token balances as well (default: false) */
    includeTokens?: boolean;
}
/** Balance response */
interface BalanceResponse {
    /** Native token balance */
    native?: NativeBalance;
    /** Token balances (if includeTokens was true) */
    tokens?: TokenBalance[];
}

/** Request to submit a deposit transaction notification */
interface SubmitDepositRequest {
    /** On-chain transaction hash of the deposit */
    txHash: string;
    /** Deposit address returned from createTransfer */
    depositAddress: string;
}
/** Response from submitting a deposit */
interface SubmitDepositResponse {
    /** Confirmation message */
    message: string;
    /** Echoed transaction hash */
    txHash: string;
    /** Echoed deposit address */
    depositAddress: string;
}

/** Payment request status */
interface PaymentStatus {
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
interface CompletePaymentRequest {
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
interface FinalizePaymentRequest {
    /** Payment link ID */
    paymentId: string;
    /** Fulfillment tx hash on destination chain */
    fulfillmentTxHash?: string;
    /** Outcome: 'paid' or 'failed' */
    outcome: 'paid' | 'failed';
}
/** Simple OK response */
interface PaymentActionResponse {
    ok: boolean;
    status: string;
}

/** Transaction record from goblink.io */
interface Transaction {
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
interface TransactionHistoryQuery {
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
interface CreateTransactionRequest {
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

/** goBlink asset identifier (e.g., "ethereum:usdc", "solana:native") */
type AssetId = `${ChainId}:${string}`;
/** A supported token */
interface Token {
    /** goBlink asset ID */
    assetId: AssetId;
    /** Token symbol (e.g., "USDC") */
    symbol: string;
    /** Full token name (e.g., "USD Coin") */
    name: string;
    /** Chain this token lives on */
    chain: ChainId;
    /** Number of decimals */
    decimals: number;
    /** Contract address (if applicable) */
    address?: string;
    /** Icon URL */
    icon?: string;
    /** Current price in USD */
    price?: number;
}
/** Options for filtering tokens */
interface TokenFilterOptions {
    /** Filter by chain */
    chain?: ChainId;
    /** Search by symbol or name (case-insensitive) */
    search?: string;
}

/** Configuration options for the GoBlink client */
interface GoBlinkOptions {
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
declare class GoBlink {
    private readonly apiClient;
    private readonly goBlinkApi;
    private readonly mapper;
    private readonly tokenList;
    private readonly feeTiers;
    private readonly minFeeBps;
    private readonly feeRecipient;
    constructor(options?: GoBlinkOptions);
    /**
     * Get all supported tokens, optionally filtered by chain or search query.
     * Results are cached for the configured TTL.
     *
     * @param options - Filter options
     * @returns Array of supported tokens
     */
    getTokens(options?: TokenFilterOptions): Promise<Token[]>;
    /**
     * Get a quote for a cross-chain transfer.
     * This is a dry run — no funds are committed.
     *
     * @param request - Quote request parameters
     * @returns Quote with deposit address, amounts, fee, and estimated time
     */
    getQuote(request: QuoteRequest): Promise<QuoteResponse>;
    /**
     * Create a real cross-chain transfer.
     * After calling this, send the exact deposit amount to the returned deposit address.
     *
     * @param request - Transfer request parameters
     * @returns Transfer details including deposit address
     */
    createTransfer(request: TransferRequest): Promise<TransferResponse>;
    /**
     * Check the status of a transfer by its deposit address.
     *
     * @param depositAddress - The deposit address returned from createTransfer
     * @returns Current transfer status
     */
    getTransferStatus(depositAddress: string): Promise<TransferStatus>;
    /**
     * Validate an address for a specific chain.
     *
     * @param chain - Chain identifier
     * @param address - Address to validate
     * @returns true if the address is valid
     */
    validateAddress(chain: ChainId, address: string): boolean;
    /**
     * Get all supported chains with their configurations.
     *
     * @returns Array of chain configurations
     */
    getChains(): ChainConfig[];
    /**
     * Calculate the fee for a given USD amount.
     *
     * @param amountUsd - Transaction amount in USD
     * @returns Fee information including BPS, percentage, and tier
     */
    calculateFee(amountUsd: number): FeeInfo;
    /**
     * Clear the cached token list, forcing a fresh fetch on next call.
     */
    clearCache(): void;
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
    createPaymentLink(options: PaymentLinkOptions): string;
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
    createBadge(options: BadgeOptions): string;
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
    shortenPaymentLink(options: ShortenOptions): Promise<ShortenResponse>;
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
    waitForCompletion(depositAddress: string, options?: WaitForCompletionOptions): Promise<TransferStatus>;
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
    submitDeposit(txHash: string, depositAddress: string): Promise<SubmitDepositResponse>;
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
    getTokenPrices(): Promise<TokenPrice[]>;
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
    getBalances(query: BalanceQuery): Promise<BalanceResponse>;
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
    getTransactionHistory(query: TransactionHistoryQuery): Promise<Transaction[]>;
    /**
     * Get a single transaction by ID.
     *
     * @param transactionId - Transaction ID
     * @returns Transaction record
     */
    getTransaction(transactionId: string): Promise<Transaction>;
    /**
     * Create a transaction record on goblink.io for history tracking.
     *
     * @param request - Transaction details
     * @returns Created transaction record
     */
    createTransactionRecord(request: CreateTransactionRequest): Promise<Transaction>;
    /**
     * Sync/refresh a transaction's status from on-chain data.
     *
     * @param transactionId - Transaction ID to sync
     * @returns Updated transaction record
     */
    syncTransaction(transactionId: string): Promise<Transaction>;
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
    getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
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
    completePayment(request: CompletePaymentRequest): Promise<PaymentActionResponse>;
    /**
     * Finalize a payment outcome — promotes from 'processing' to 'paid' or 'failed'.
     *
     * @param request - Finalization details
     * @returns Confirmation response
     */
    finalizePayment(request: FinalizePaymentRequest): Promise<PaymentActionResponse>;
}

/** Base error class for all goBlink SDK errors */
declare class GoBlinkError extends Error {
    constructor(message: string);
}
/** Error from the upstream API (non-2xx response) */
declare class GoBlinkApiError extends GoBlinkError {
    readonly statusCode: number;
    readonly responseBody: string | undefined;
    readonly url: string;
    constructor(statusCode: number, responseBody: string | undefined, url: string);
}
/** Network-level error (timeout, DNS failure, etc.) */
declare class GoBlinkNetworkError extends GoBlinkError {
    readonly url: string;
    constructor(message: string, url: string);
}
/** Validation error (invalid address, amount, etc.) */
declare class GoBlinkValidationError extends GoBlinkError {
    readonly field: string;
    constructor(message: string, field: string);
}
/** Asset not found error */
declare class GoBlinkAssetNotFoundError extends GoBlinkError {
    readonly assetId: string;
    constructor(assetId: string);
}

/**
 * Validate an address for a specific chain
 * @param chain - Chain identifier
 * @param address - Address to validate
 * @returns true if the address is valid for the given chain
 */
declare function validateAddress(chain: ChainId, address: string): boolean;

/**
 * Convert a human-readable amount to atomic (integer) representation
 * @param amount - Human-readable amount (e.g., "1.5")
 * @param decimals - Number of decimal places for the token
 * @returns Atomic amount as string (e.g., "1500000" for 1.5 with 6 decimals)
 */
declare function toAtomicAmount(amount: string, decimals: number): string;
/**
 * Convert an atomic amount to human-readable representation
 * @param atomicAmount - Atomic amount as string (e.g., "1500000")
 * @param decimals - Number of decimal places for the token
 * @returns Human-readable amount (e.g., "1.5")
 */
declare function fromAtomicAmount(atomicAmount: string, decimals: number): string;
/**
 * Truncate an address for display
 * @param address - Full address string
 * @param startChars - Number of characters to keep at start (default: 6)
 * @param endChars - Number of characters to keep at end (default: 4)
 */
declare function truncateAddress(address: string, startChars?: number, endChars?: number): string;
/**
 * Format a USD amount for display
 * @param amount - Amount in USD
 */
declare function formatUsd(amount: number): string;

/**
 * Build a goblink.io payment link from the given options.
 * All values are URL-encoded automatically.
 */
declare function createPaymentLink(options: PaymentLinkOptions): string;
/**
 * Build a Markdown badge string for embedding in a GitHub README.
 *
 * @example
 * ```
 * [![Donate with goBlink](https://img.shields.io/badge/Donate-goBlink-blue)](https://goblink.io/pay?to=0x...)
 * ```
 */
declare function createBadge(options: BadgeOptions): string;
/**
 * Create a short payment link via the goblink.io API.
 * Returns a short URL like `https://goblink.io/pay/AbC12xYz`.
 *
 * @example
 * ```typescript
 * const short = await shortenPaymentLink({
 *   recipient: '0xABC...123',
 *   chain: 'ethereum',
 *   token: 'USDC',
 *   amount: '50',
 *   memo: 'Invoice #42',
 * });
 * console.log(short.url); // "https://goblink.io/pay/AbC12xYz"
 * ```
 */
declare function shortenPaymentLink(options: ShortenOptions, timeout?: number): Promise<ShortenResponse>;

/** Options for the embeddable goBlink widget */
interface WidgetOptions {
    /** Recipient wallet address */
    recipient: string;
    /** Destination chain identifier */
    recipientChain: string;
    /** Destination token symbol */
    recipientToken: string;
    /** Pre-filled amount (optional — payer can change) */
    amount?: string;
    /** Visual theme (default: 'light') */
    theme?: 'dark' | 'light';
    /** Widget width in pixels (default: 400) */
    width?: number;
    /** Widget height in pixels (default: 600) */
    height?: number;
}
/** Events emitted by the widget via postMessage */
type WidgetEvent = {
    type: 'goblink:success';
    transfer: Record<string, unknown>;
} | {
    type: 'goblink:error';
    error: {
        message: string;
        code?: string;
    };
} | {
    type: 'goblink:ready';
} | {
    type: 'goblink:close';
};
/** Props for the React GoBlinkWidget component */
interface GoBlinkWidgetProps extends WidgetOptions {
    /** Called when the transfer succeeds */
    onSuccess?: (transfer: Record<string, unknown>) => void;
    /** Called when an error occurs */
    onError?: (error: {
        message: string;
        code?: string;
    }) => void;
    /** Compact mode for small embeds */
    compact?: boolean;
    /** Additional CSS class name */
    className?: string;
}

export { type AssetId, type AssetReference, type BadgeOptions, type BalanceChainType, type BalanceQuery, type BalanceResponse, type ChainConfig, type ChainId, type ChainType, type CompletePaymentRequest, type CreateTransactionRequest, type FeeInfo, type FeeTier, type FinalizePaymentRequest, GoBlink, GoBlinkApiError, GoBlinkAssetNotFoundError, GoBlinkError, GoBlinkNetworkError, type GoBlinkOptions, GoBlinkValidationError, type GoBlinkWidgetProps, type NativeBalance, type PaymentActionResponse, type PaymentLinkOptions, type PaymentStatus, type QuoteRequest, type QuoteResponse, type ShortenOptions, type ShortenResponse, type SubmitDepositRequest, type SubmitDepositResponse, type Token, type TokenBalance, type TokenFilterOptions, type TokenPrice, type Transaction, type TransactionHistoryQuery, type TransferRequest, type TransferResponse, type TransferStatus, type TransferStatusValue, type WaitForCompletionOptions, type WidgetEvent, type WidgetOptions, createBadge, createPaymentLink, formatUsd, fromAtomicAmount, shortenPaymentLink, toAtomicAmount, truncateAddress, validateAddress };
