# @goblink/sdk

**Move value anywhere, instantly.**

Cross-chain token transfers across 26+ blockchains and 65+ tokens. One SDK, every chain.

## Install

```bash
npm install @goblink/sdk
```

## Quick Start

```typescript
import { GoBlink } from '@goblink/sdk';

const gb = new GoBlink();

// Get supported tokens
const tokens = await gb.getTokens();

// Get a quote
const quote = await gb.getQuote({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKpfrBykARtSFm4CPp5xPDt5gTbch3YQFaMGePGgm3N',
  refundAddress: '0x1234567890abcdef1234567890abcdef12345678',
});

console.log(`Send ${quote.amountIn} → Receive ${quote.amountOut}`);
console.log(`Fee: ${quote.fee.percent}% (${quote.fee.tier} tier)`);
console.log(`Deposit to: ${quote.depositAddress}`);

// Create a real transfer
const transfer = await gb.createTransfer({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKpfrBykARtSFm4CPp5xPDt5gTbch3YQFaMGePGgm3N',
  refundAddress: '0x1234567890abcdef1234567890abcdef12345678',
});

// Check transfer status
const status = await gb.getTransferStatus(transfer.depositAddress);
console.log(`Status: ${status.status}`);
```

## API Reference

### `new GoBlink(options?)`

Create a new goBlink client.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fees` | `FeeTier[]` | Standard tiers | Custom fee tiers |
| `minFee` | `number` | `5` | Minimum fee floor (basis points) |
| `feeRecipient` | `string` | `"goblink.near"` | Fee recipient address |
| `cacheTtl` | `number` | `300000` | Token list cache TTL (ms) |
| `timeout` | `number` | `30000` | Request timeout (ms) |

### `gb.getTokens(options?)`

Get all supported tokens, optionally filtered.

```typescript
// All tokens
const tokens = await gb.getTokens();

// Filter by chain
const ethTokens = await gb.getTokens({ chain: 'ethereum' });

// Search by name or symbol
const usdTokens = await gb.getTokens({ search: 'usd' });
```

### `gb.getQuote(request)`

Get a quote for a cross-chain transfer (no funds committed).

```typescript
const quote = await gb.getQuote({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKp...3mNw',
  refundAddress: '0xABC...123',
});
// Returns: { quoteId, depositAddress, amountIn, amountOut, fee, rate, estimatedTime, expiresAt }
```

### `gb.createTransfer(request)`

Create a real transfer. Send the exact deposit amount to the returned address.

```typescript
const transfer = await gb.createTransfer({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKp...3mNw',
  refundAddress: '0xABC...123',
});
// Returns: { id, depositAddress, depositAmount, expiresAt }
```

### `gb.getTransferStatus(depositAddress)`

Check the current status of a transfer.

```typescript
const status = await gb.getTransferStatus(depositAddress);
// Returns: { status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | ..., txHash?, explorerUrl? }
```

### `gb.validateAddress(chain, address)`

Validate an address for a specific chain.

```typescript
gb.validateAddress('solana', '7xKp...3mNw'); // true
gb.validateAddress('ethereum', 'invalid');    // false
```

### `gb.getChains()`

Get all supported chains with their configurations.

```typescript
const chains = gb.getChains();
// [{ id: 'ethereum', name: 'Ethereum', type: 'evm', explorer, nativeToken }, ...]
```

### `gb.calculateFee(amountUsd)`

Calculate the fee for a given USD amount.

```typescript
gb.calculateFee(1000);  // { bps: 35, percent: '0.35', tier: 'Standard' }
gb.calculateFee(10000); // { bps: 10, percent: '0.10', tier: 'Pro' }
gb.calculateFee(100000); // { bps: 5, percent: '0.05', tier: 'Whale' }
```

## Supported Chains

### EVM
Ethereum, Base, Arbitrum, BNB Chain, Polygon, Optimism, Avalanche, Gnosis, Berachain, Monad, Aurora, X Layer

### Non-EVM
Solana, Sui, Bitcoin, Litecoin, Dogecoin, Bitcoin Cash, Tron, TON, Stellar, XRP Ledger, Starknet, Cardano, Aptos, Aleo

## Fee Structure

| Amount | Fee | Tier |
|--------|-----|------|
| Under $5,000 | 0.35% | Standard |
| $5,000 - $50,000 | 0.10% | Pro |
| Over $50,000 | 0.05% | Whale |

Fees are fully customizable. Partners can set their own tiers and recipient addresses.

## Error Handling

```typescript
import { GoBlinkError, GoBlinkApiError, GoBlinkNetworkError } from '@goblink/sdk';

try {
  const quote = await gb.getQuote(request);
} catch (error) {
  if (error instanceof GoBlinkNetworkError) {
    console.error('Network issue:', error.message);
  } else if (error instanceof GoBlinkApiError) {
    console.error(`API error ${error.statusCode}:`, error.responseBody);
  } else if (error instanceof GoBlinkError) {
    console.error('SDK error:', error.message);
  }
}
```

---

## New in v0.2.0

### Payment Link Generator

Generate shareable payment links and GitHub README badges.

```typescript
// Create a payment link
const url = gb.createPaymentLink({
  recipient: '0xABC...123',
  chain: 'ethereum',
  token: 'USDC',
  amount: '50',           // optional — omit to let payer choose
  message: 'Invoice #42', // optional
  redirect: 'https://merchant.com/success', // optional
});
// → "https://goblink.io/pay?to=0xABC...123&chain=ethereum&token=USDC&amount=50&..."

// Create a GitHub README badge
const badge = gb.createBadge({
  recipient: '0xABC...123',
  chain: 'ethereum',
  token: 'USDC',
  label: 'Donate with goBlink', // optional
});
// → "[![Donate with goBlink](https://img.shields.io/badge/...)](https://goblink.io/pay?...)"
```

### Status Polling Helper

Poll a transfer until it reaches a terminal state.

```typescript
const finalStatus = await gb.waitForCompletion(transfer.depositAddress, {
  timeout: 600000,   // 10 min (default)
  interval: 5000,    // 5s poll interval (default)
  onStatusChange: (status) => console.log('Status:', status.status),
});
// Throws GoBlinkError on timeout
```

### Webhook URL (Forward Compatibility)

Both `TransferRequest` and `QuoteRequest` now accept an optional `webhookUrl` field.
This field is reserved for forward compatibility — webhook delivery is a planned feature.

```typescript
const transfer = await gb.createTransfer({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKp...3mNw',
  refundAddress: '0xABC...123',
  webhookUrl: 'https://merchant.com/api/goblink-webhook', // reserved
});
```

### Embeddable Widget

Drop a goBlink payment widget into any website with zero config.

#### Vanilla JS (works everywhere)

```html
<div id="goblink-container"></div>
<script type="module">
  import { GoBlinkEmbed } from '@goblink/sdk/widget';

  GoBlinkEmbed.mount('#goblink-container', {
    recipient: '0xABC...123',
    recipientChain: 'ethereum',
    recipientToken: 'USDC',
    amount: '50',
    theme: 'dark',
  });
</script>
```

#### React

```tsx
import { GoBlinkWidget } from '@goblink/sdk/widget/react';

<GoBlinkWidget
  recipient="0xABC...123"
  recipientChain="ethereum"
  recipientToken="USDC"
  amount="50"
  theme="dark"
  onSuccess={(transfer) => console.log('done', transfer)}
  onError={(error) => console.error(error)}
  compact={false}
/>
```

The widget renders as a lightweight iframe pointing to `goblink.io/widget`.
No React dependency required for vanilla JS usage. Communication uses `postMessage`.

---

## License

MIT
