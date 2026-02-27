import { describe, it, expect } from 'vitest';
import { GoBlinkEmbed } from '../src/widget/embed.js';
import { IframeWidget } from '../src/widget/iframe-widget.js';

// These tests run in Node — DOM is not available.
// We test that the module exports are correct and classes instantiate properly.

describe('widget exports', () => {
  it('exports GoBlinkEmbed', () => {
    expect(typeof GoBlinkEmbed).toBe('object');
    expect(typeof GoBlinkEmbed.mount).toBe('function');
  });

  it('exports IframeWidget class', () => {
    expect(typeof IframeWidget).toBe('function');
  });

  it('IframeWidget instantiates with valid options', () => {
    const widget = new IframeWidget({
      recipient: '0xABC123',
      recipientChain: 'ethereum',
      recipientToken: 'USDC',
      theme: 'dark',
    });
    expect(widget).toBeInstanceOf(IframeWidget);
  });

  it('IframeWidget throws when mounted without DOM', () => {
    const widget = new IframeWidget({
      recipient: '0xABC123',
      recipientChain: 'ethereum',
      recipientToken: 'USDC',
    });
    // In Node (no DOM), document is not defined
    expect(() => widget.mount('#container')).toThrow();
  });
});
