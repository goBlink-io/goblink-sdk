/**
 * GoBlinkWidget — React wrapper for the goblink.io iframe widget.
 *
 * React is an optional peer dependency. Import this file only when React is available.
 *
 * @example
 * ```tsx
 * import { GoBlinkWidget } from '@goblink/sdk/widget';
 *
 * <GoBlinkWidget
 *   recipient="0xABC...123"
 *   recipientChain="ethereum"
 *   recipientToken="USDC"
 *   amount="50"
 *   theme="dark"
 *   onSuccess={(transfer) => console.log('done', transfer)}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
import React, { useEffect, useRef } from 'react';
import { IframeWidget } from './iframe-widget.js';
import type { GoBlinkWidgetProps } from './types.js';

export function GoBlinkWidget(props: GoBlinkWidgetProps): React.ReactElement {
  const {
    onSuccess,
    onError,
    compact = false,
    className,
    width,
    height,
    ...widgetOptions
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IframeWidget | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widget = new IframeWidget({
      ...widgetOptions,
      width: compact ? (width ?? 320) : (width ?? 400),
      height: compact ? (height ?? 400) : (height ?? 600),
    });

    widget.onSuccess = onSuccess;
    widget.onError = onError;
    widget.mount(containerRef.current);
    widgetRef.current = widget;

    return () => {
      widgetRef.current?.unmount();
      widgetRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    widgetOptions.recipient,
    widgetOptions.recipientChain,
    widgetOptions.recipientToken,
    widgetOptions.amount,
    widgetOptions.theme,
    compact,
    width,
    height,
  ]);

  // Update callbacks without remounting
  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.onSuccess = onSuccess;
      widgetRef.current.onError = onError;
    }
  }, [onSuccess, onError]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'inline-block',
        lineHeight: 0,
      }}
    />
  );
}

export default GoBlinkWidget;
