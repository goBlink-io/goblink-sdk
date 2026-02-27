/** Options for the embeddable goBlink widget */
export interface WidgetOptions {
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
export type WidgetEvent =
  | { type: 'goblink:success'; transfer: Record<string, unknown> }
  | { type: 'goblink:error'; error: { message: string; code?: string } }
  | { type: 'goblink:ready' }
  | { type: 'goblink:close' };

/** Props for the React GoBlinkWidget component */
export interface GoBlinkWidgetProps extends WidgetOptions {
  /** Called when the transfer succeeds */
  onSuccess?: (transfer: Record<string, unknown>) => void;
  /** Called when an error occurs */
  onError?: (error: { message: string; code?: string }) => void;
  /** Compact mode for small embeds */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
}
