import { describe, it, expect } from 'vitest';
import { createPaymentLink, createBadge } from '../src/links/payment-link.js';

describe('createPaymentLink', () => {
  it('builds a basic payment link', () => {
    const url = createPaymentLink({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
    });
    expect(url).toContain('https://goblink.io/pay?');
    expect(url).toContain('to=0xABC123');
    expect(url).toContain('chain=ethereum');
    expect(url).toContain('token=USDC');
    expect(url).not.toContain('amount=');
  });

  it('includes optional amount', () => {
    const url = createPaymentLink({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
      amount: '50',
    });
    expect(url).toContain('amount=50');
  });

  it('encodes special characters in message', () => {
    const url = createPaymentLink({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
      message: 'Invoice #42',
    });
    expect(url).toContain('msg=');
    expect(url).toContain('Invoice');
  });

  it('includes redirect URL', () => {
    const url = createPaymentLink({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
      redirect: 'https://merchant.com/success',
    });
    expect(url).toContain('redirect=');
    expect(url).toContain('merchant.com');
  });
});

describe('createBadge', () => {
  it('returns markdown badge string', () => {
    const badge = createBadge({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
    });
    expect(badge).toMatch(/^\[!\[/);
    expect(badge).toContain('shields.io');
    expect(badge).toContain('goblink.io/pay');
  });

  it('uses custom label', () => {
    const badge = createBadge({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
      label: 'Support Me',
    });
    expect(badge).toContain('Support Me');
  });

  it('defaults label to "Donate with goBlink"', () => {
    const badge = createBadge({
      recipient: '0xABC123',
      chain: 'ethereum',
      token: 'USDC',
    });
    expect(badge).toContain('Donate with goBlink');
  });
});
