/** Token price entry from the goblink.io API */
export interface TokenPrice {
  /** Protocol asset ID */
  assetId: string;
  /** USD price as string (e.g., "1.0001") */
  priceUsd?: string;
}
