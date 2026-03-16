'use strict';

// src/widget/iframe-widget.ts
var WIDGET_BASE_URL = "https://goblink.io/embed";
var IframeWidget = class {
  iframe = null;
  container = null;
  messageHandler = null;
  options;
  onSuccess;
  onError;
  constructor(options) {
    this.options = {
      width: options.width ?? 400,
      height: options.height ?? 600,
      theme: options.theme ?? "light",
      ...options
    };
  }
  /** Build the iframe src URL from options */
  buildUrl() {
    const params = new URLSearchParams();
    params.set("to", this.options.recipient);
    params.set("chain", this.options.recipientChain);
    params.set("token", this.options.recipientToken);
    params.set("theme", this.options.theme);
    if (this.options.amount !== void 0) params.set("amount", this.options.amount);
    return `${WIDGET_BASE_URL}?${params.toString()}`;
  }
  /**
   * Mount the widget into a DOM element.
   *
   * @param target - CSS selector string or DOM Element
   */
  mount(target) {
    this.container = typeof target === "string" ? document.querySelector(target) : target;
    if (!this.container) {
      throw new Error(`GoBlinkWidget: mount target not found: ${target}`);
    }
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.buildUrl();
    this.iframe.width = String(this.options.width);
    this.iframe.height = String(this.options.height);
    this.iframe.style.border = "none";
    this.iframe.style.borderRadius = "12px";
    this.iframe.allow = "clipboard-write";
    this.iframe.title = "goBlink Payment Widget";
    const expectedOrigin = new URL(WIDGET_BASE_URL).origin;
    this.messageHandler = (event) => {
      if (!event.data || typeof event.data.type !== "string") return;
      if (event.origin !== expectedOrigin) return;
      if (this.iframe && event.source !== this.iframe.contentWindow) return;
      this.handleMessage(event.data);
    };
    window.addEventListener("message", this.messageHandler);
    this.container.appendChild(this.iframe);
  }
  handleMessage(event) {
    switch (event.type) {
      case "goblink:success":
        this.onSuccess?.(event.transfer);
        break;
      case "goblink:error":
        this.onError?.(event.error);
        break;
    }
  }
  /** Remove the iframe and clean up event listeners */
  unmount() {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    if (this.iframe && this.container) {
      this.container.removeChild(this.iframe);
      this.iframe = null;
    }
    this.container = null;
  }
};

// src/widget/embed.ts
var GoBlinkEmbed = {
  /**
   * Mount a goBlink payment widget into a DOM element.
   *
   * @param target - CSS selector or DOM Element
   * @param options - Widget configuration
   * @returns The IframeWidget instance (call .unmount() to remove)
   */
  mount(target, options) {
    const widget = new IframeWidget(options);
    widget.mount(target);
    return widget;
  }
};

exports.GoBlinkEmbed = GoBlinkEmbed;
exports.IframeWidget = IframeWidget;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map