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
```

---

## API Reference

### `new GoBlink(options?)`

Create a new goBlink client.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fees` | `FeeTier[]` | Standard tiers | Custom fee tiers |
| `minFee` | `number` | `5` | Minimum fee floor (basis points) |
| `feeRecipient` | `string` | `"goblink.near"` | Fee recipient address |
| `goBlinkUrl` | `string` | `"https://goblink.io"` | goblink.io API base URL |
| `cacheTtl` | `number` | `300000` | Token list cache TTL (ms) |
| `timeout` | `number` | `30000` | Request timeout (ms) |

---

### Core Transfer Methods

#### `gb.getTokens(options?)`

Get all supported tokens, optionally filtered.

```typescript
const tokens = await gb.getTokens();
const ethTokens = await gb.getTokens({ chain: 'ethereum' });
const usdTokens = await gb.getTokens({ search: 'usd' });
```

#### `gb.getQuote(request)`

Get a quote for a cross-chain transfer (no funds committed).

```typescript
const quote = await gb.getQuote({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKp...3mNw',
  refundAddress: '0xABC...123',
});
// → { quoteId, depositAddress, amountIn, amountOut, fee, rate, estimatedTime, expiresAt }
```

#### `gb.createTransfer(request)`

Create a real transfer. Send the exact deposit amount to the returned address.

```typescript
const transfer = await gb.createTransfer({
  from: { chain: 'ethereum', token: 'USDC' },
  to: { chain: 'solana', token: 'USDC' },
  amount: '100',
  recipient: '7xKp...3mNw',
  refundAddress: '0xABC...123',
});
// → { id, depositAddress, depositAmount, expiresAt }
```

#### `gb.submitDeposit(txHash, depositAddress)`

Notify that a deposit tx has been sent on-chain. Speeds up tracking.

```typescript
await gb.submitDeposit('0xabc123...', transfer.depositAddress);
```

#### `gb.getTransferStatus(depositAddress)`

Check the current status of a transfer.

```typescript
const status = await gb.getTransferStatus(depositAddress);
// → { status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | ..., txHash?, explorerUrl? }
```

#### `gb.waitForCompletion(depositAddress, options?)`

Poll until a transfer reaches a terminal state.

```typescript
const finalStatus = await gb.waitForCompletion(depositAddress, {
  timeout: 600000,    // 10 min (default)
  interval: 5000,     // 5s poll interval (default)
  onStatusChange: (s) => console.log('Status:', s.status),
});
```

---

### Payment Links & Merchant Integration

#### `gb.createPaymentLink(options)`

Generate a payment link URL.

```typescript
const url = gb.createPaymentLink({
  recipient: '0xABC...123',
  chain: 'ethereum',
  token: 'USDC',
  amount: '50',
  message: 'Invoice #42',
});
// → "https://goblink.io/pay?to=0xABC...&chain=ethereum&token=USDC&amount=50&msg=Invoice+%2342"
```

#### `gb.shortenPaymentLink(options)`

Create a short payment link via the goblink.io API.

```typescript
const short = await gb.shortenPaymentLink({
  recipient: '0xABC...123',
  chain: 'ethereum',
  token: 'USDC',
  amount: '50',
  memo: 'Invoice #42',
});
// → { id: "AbC12xYz", url: "https://goblink.io/pay/AbC12xYz" }
```

#### `gb.getPaymentStatus(paymentId)`

Check if a payment request has been fulfilled.

```typescript
const status = await gb.getPaymentStatus('AbC12xYz');
// → { status: 'active' | 'processing' | 'paid' | 'failed' | 'expired', paid_at?, ... }
```

#### `gb.completePayment(request)`

Mark a payment as processing (payer signed the deposit tx).

```typescript
await gb.completePayment({
  paymentId: 'AbC12xYz',
  sendTxHash: '0xabc...',
  depositAddress: '0xdep...',
  payerAddress: '0xpayer...',
  payerChain: 'ethereum',
});
```

#### `gb.finalizePayment(request)`

Finalize a payment outcome after on-chain confirmation.

```typescript
await gb.finalizePayment({
  paymentId: 'AbC12xYz',
  fulfillmentTxHash: '0xfulfill...',
  outcome: 'paid', // or 'failed'
});
```

#### `gb.createBadge(options)`

Generate a Markdown badge for GitHub READMEs.

```typescript
const badge = gb.createBadge({
  recipient: '0xABC...123',
  chain: 'ethereum',
  token: 'USDC',
  label: 'Donate with goBlink',
});
// → "[![Donate with goBlink](https://img.shields.io/badge/...)](https://goblink.io/pay?to=...)"
```

---

### Prices & Balances

#### `gb.getTokenPrices()`

Get USD prices for all supported tokens.

```typescript
const prices = await gb.getTokenPrices();
// → [{ assetId: "...", priceUsd: "1.0001" }, ...]
```

#### `gb.getBalances(query)`

Query wallet balances across chains.

```typescript
const bal = await gb.getBalances({
  chainType: 'evm',
  chain: 'ethereum',
  address: '0xABC...123',
  includeTokens: true,
});
console.log(bal.native?.balance);  // "1.234"
console.log(bal.tokens);           // [{ symbol: 'USDC', balance: '500.00', ... }]
```

Supported chain types: `'evm'`, `'solana'`, `'sui'`, `'near'`

---

### Transaction History

#### `gb.getTransactionHistory(query)`

Fetch past transfers for a wallet.

```typescript
const history = await gb.getTransactionHistory({
  walletAddress: '0xABC...123',
  limit: 20,
});
```

#### `gb.getTransaction(id)`

Get a single transaction by ID.

```typescript
const tx = await gb.getTransaction('tx_123');
```

#### `gb.createTransactionRecord(request)`

Log a transfer for history tracking.

```typescript
const tx = await gb.createTransactionRecord({
  walletAddress: '0xABC...123',
  walletChain: 'ethereum',
  fromChain: 'ethereum',
  fromToken: 'USDC',
  toChain: 'solana',
  toToken: 'USDC',
  amountIn: '100',
  recipient: '7xKp...3mNw',
});
```

#### `gb.syncTransaction(id)`

Refresh a transaction's status from on-chain data.

```typescript
const updated = await gb.syncTransaction('tx_123');
```

---

### Utility Methods

#### `gb.validateAddress(chain, address)`

```typescript
gb.validateAddress('solana', '7xKp...3mNw'); // true
gb.validateAddress('ethereum', 'invalid');    // false
```

#### `gb.getChains()`

```typescript
const chains = gb.getChains();
// → [{ id: 'ethereum', name: 'Ethereum', type: 'evm', explorer, nativeToken }, ...]
```

#### `gb.calculateFee(amountUsd)`

```typescript
gb.calculateFee(1000);   // { bps: 35, percent: '0.35', tier: 'Standard' }
gb.calculateFee(10000);  // { bps: 10, percent: '0.10', tier: 'Pro' }
gb.calculateFee(100000); // { bps: 5, percent: '0.05', tier: 'Whale' }
```

---

### Embeddable Widget

Drop a goBlink payment widget into any website — no React required.

#### Vanilla JS (iframe-based)

```html
<div id="goblink-widget"></div>
<script type="module">
  import { GoBlinkEmbed } from '@goblink/sdk/widget';
  
  GoBlinkEmbed.mount('#goblink-widget', {
    recipient: '0xABC...123',
    recipientChain: 'solana',
    recipientToken: 'USDC',
    amount: '50',
    theme: 'dark',
    onSuccess: (event) => console.log('Paid!', event),
    onError: (event) => console.error('Failed', event),
  });
</script>
```

#### React Component

```tsx
import { GoBlinkWidget } from '@goblink/sdk/widget';

<GoBlinkWidget
  recipient="0xABC...123"
  recipientChain="solana"
  recipientToken="USDC"
  amount="50"
  theme="dark"
  onSuccess={(e) => console.log('Paid!', e)}
/>
```

---

## Merchant Integration Example (WooCommerce/Shopify)

Complete payment flow for e-commerce:

```typescript
import { GoBlink } from '@goblink/sdk';

const gb = new GoBlink();

// 1. Create a payment link for the order
const payment = await gb.shortenPaymentLink({
  recipient: 'merchant-wallet.near',
  chain: 'near',
  token: 'USDC',
  amount: '49.99',
  memo: 'Order #1234',
});
// → Redirect customer to payment.url

// 2. Poll for payment status
const status = await gb.waitForCompletion(payment.id, {
  // ... or poll getPaymentStatus() manually
});

// 3. Or check status on webhook/callback
const paymentStatus = await gb.getPaymentStatus(payment.id);
if (paymentStatus.status === 'paid') {
  // Mark order as fulfilled
}
```

---

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

## License

MIT
