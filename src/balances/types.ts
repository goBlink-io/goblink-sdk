/** Supported chain types for balance queries */
export type BalanceChainType = 'evm' | 'solana' | 'sui' | 'near';

/** Native balance result */
export interface NativeBalance {
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
export interface TokenBalance {
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
export interface BalanceQuery {
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
export interface BalanceResponse {
  /** Native token balance */
  native?: NativeBalance;
  /** Token balances (if includeTokens was true) */
  tokens?: TokenBalance[];
}
