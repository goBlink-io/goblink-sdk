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
declare class IframeWidget {
    private iframe;
    private container;
    private messageHandler;
    private readonly options;
    onSuccess?: (transfer: Record<string, unknown>) => void;
    onError?: (error: {
        message: string;
        code?: string;
    }) => void;
    constructor(options: WidgetOptions);
    /** Build the iframe src URL from options */
    private buildUrl;
    /**
     * Mount the widget into a DOM element.
     *
     * @param target - CSS selector string or DOM Element
     */
    mount(target: string | Element): void;
    private handleMessage;
    /** Remove the iframe and clean up event listeners */
    unmount(): void;
}

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
declare const GoBlinkEmbed: {
    /**
     * Mount a goBlink payment widget into a DOM element.
     *
     * @param target - CSS selector or DOM Element
     * @param options - Widget configuration
     * @returns The IframeWidget instance (call .unmount() to remove)
     */
    mount(target: string | Element, options: WidgetOptions): IframeWidget;
};

export { GoBlinkEmbed, type GoBlinkWidgetProps, IframeWidget, type WidgetEvent, type WidgetOptions };
