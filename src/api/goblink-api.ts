/**
 * INTERNAL — HTTP client for the goblink.io REST API.
 * Used for features that go through goblink.io (payments, prices, balances, history)
 * rather than directly to the underlying swap protocol.
 */

import { GoBlinkApiError, GoBlinkNetworkError } from '../errors.js';

const DEFAULT_GOBLINK_URL = 'https://goblink.io';

export interface GoBlinkApiOptions {
  baseUrl?: string;
  timeout?: number;
}

export class GoBlinkApi {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: GoBlinkApiOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_GOBLINK_URL).replace(/\/$/, '');
    this.timeout = options.timeout ?? 30_000;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GoBlinkNetworkError(`Request timed out after ${this.timeout}ms`, url);
      }
      throw new GoBlinkNetworkError(
        error instanceof Error ? error.message : 'Network request failed',
        url,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorBody: string | undefined;
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new GoBlinkApiError(response.status, errorBody, url);
    }

    return response.json() as Promise<T>;
  }
}
