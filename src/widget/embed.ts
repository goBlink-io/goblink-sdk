import { IframeWidget } from './iframe-widget.js';
import type { WidgetOptions } from './types.js';

/**
 * GoBlinkEmbed — drop-in vanilla JS widget for any website.
 *
 * @example
 * ```html
 * <div id="goblink-container"></div>
 * <script>
 *   GoBlinkEmbed.mount('#goblink-container', {
 *     recipient: '0xABC...123',
 *     recipientChain: 'ethereum',
 *     recipientToken: 'USDC',
 *     theme: 'dark',
 *   });
 * </script>
 * ```
 */
export const GoBlinkEmbed = {
  /**
   * Mount a goBlink payment widget into a DOM element.
   *
   * @param target - CSS selector or DOM Element
   * @param options - Widget configuration
   * @returns The IframeWidget instance (call .unmount() to remove)
   */
  mount(target: string | Element, options: WidgetOptions): IframeWidget {
    const widget = new IframeWidget(options);
    widget.mount(target);
    return widget;
  },
};
