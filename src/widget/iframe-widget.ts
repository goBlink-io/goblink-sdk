import type { WidgetOptions, WidgetEvent } from './types.js';

const WIDGET_BASE_URL = 'https://goblink.io/embed';

/**
 * IframeWidget — creates and manages a goblink.io widget iframe.
 *
 * Communicates with the host page via the postMessage API.
 *
 * @example
 * ```typescript
 * const widget = new IframeWidget({
 *   recipient: '0xABC...123',
 *   recipientChain: 'ethereum',
 *   recipientToken: 'USDC',
 *   theme: 'dark',
 * });
 * widget.mount('#goblink-container');
 * ```
 */
export class IframeWidget {
  private iframe: HTMLIFrameElement | null = null;
  private container: Element | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private readonly options: Required<Pick<WidgetOptions, 'width' | 'height' | 'theme'>> &
    WidgetOptions;

  onSuccess?: (transfer: Record<string, unknown>) => void;
  onError?: (error: { message: string; code?: string }) => void;

  constructor(options: WidgetOptions) {
    this.options = {
      width: options.width ?? 400,
      height: options.height ?? 600,
      theme: options.theme ?? 'light',
      ...options,
    };
  }

  /** Build the iframe src URL from options */
  private buildUrl(): string {
    const params = new URLSearchParams();
    params.set('to', this.options.recipient);
    params.set('chain', this.options.recipientChain);
    params.set('token', this.options.recipientToken);
    params.set('theme', this.options.theme);
    if (this.options.amount !== undefined) params.set('amount', this.options.amount);
    return `${WIDGET_BASE_URL}?${params.toString()}`;
  }

  /**
   * Mount the widget into a DOM element.
   *
   * @param target - CSS selector string or DOM Element
   */
  mount(target: string | Element): void {
    this.container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.container) {
      throw new Error(`GoBlinkWidget: mount target not found: ${target}`);
    }

    this.iframe = document.createElement('iframe');
    this.iframe.src = this.buildUrl();
    this.iframe.width = String(this.options.width);
    this.iframe.height = String(this.options.height);
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = '12px';
    this.iframe.allow = 'clipboard-write';
    this.iframe.title = 'goBlink Payment Widget';

    this.messageHandler = (event: MessageEvent) => {
      if (!event.data || typeof event.data.type !== 'string') return;
      // Only handle events from the widget iframe
      if (this.iframe && event.source !== this.iframe.contentWindow) return;
      this.handleMessage(event.data as WidgetEvent);
    };

    window.addEventListener('message', this.messageHandler);
    this.container.appendChild(this.iframe);
  }

  private handleMessage(event: WidgetEvent): void {
    switch (event.type) {
      case 'goblink:success':
        this.onSuccess?.(event.transfer);
        break;
      case 'goblink:error':
        this.onError?.(event.error);
        break;
    }
  }

  /** Remove the iframe and clean up event listeners */
  unmount(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    if (this.iframe && this.container) {
      this.container.removeChild(this.iframe);
      this.iframe = null;
    }
    this.container = null;
  }
}
