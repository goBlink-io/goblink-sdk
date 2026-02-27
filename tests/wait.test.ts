import { describe, it, expect, vi } from 'vitest';
import { waitForCompletion } from '../src/transfers/wait.js';
import { GoBlinkError } from '../src/errors.js';
import type { TransferStatus } from '../src/transfers/types.js';

function makeStatus(status: TransferStatus['status']): TransferStatus {
  return { status };
}

describe('waitForCompletion', () => {
  it('resolves when status is SUCCESS', async () => {
    const getStatus = vi.fn().mockResolvedValue(makeStatus('SUCCESS'));
    const result = await waitForCompletion('0xDEPOSIT', getStatus, {
      timeout: 5000,
      interval: 10,
    });
    expect(result.status).toBe('SUCCESS');
    expect(getStatus).toHaveBeenCalledTimes(1);
  });

  it('resolves when status is FAILED', async () => {
    const getStatus = vi.fn().mockResolvedValue(makeStatus('FAILED'));
    const result = await waitForCompletion('0xDEPOSIT', getStatus, {
      timeout: 5000,
      interval: 10,
    });
    expect(result.status).toBe('FAILED');
  });

  it('resolves when status is EXPIRED', async () => {
    const getStatus = vi.fn().mockResolvedValue(makeStatus('EXPIRED'));
    const result = await waitForCompletion('0xDEPOSIT', getStatus, {
      timeout: 5000,
      interval: 10,
    });
    expect(result.status).toBe('EXPIRED');
  });

  it('polls until terminal status', async () => {
    const getStatus = vi
      .fn()
      .mockResolvedValueOnce(makeStatus('PENDING'))
      .mockResolvedValueOnce(makeStatus('PROCESSING'))
      .mockResolvedValue(makeStatus('SUCCESS'));

    const result = await waitForCompletion('0xDEPOSIT', getStatus, {
      timeout: 10000,
      interval: 10,
    });
    expect(result.status).toBe('SUCCESS');
    expect(getStatus).toHaveBeenCalledTimes(3);
  });

  it('calls onStatusChange on status changes', async () => {
    const changes: string[] = [];
    const getStatus = vi
      .fn()
      .mockResolvedValueOnce(makeStatus('PENDING'))
      .mockResolvedValueOnce(makeStatus('PENDING')) // same — should not fire again
      .mockResolvedValue(makeStatus('SUCCESS'));

    await waitForCompletion('0xDEPOSIT', getStatus, {
      timeout: 10000,
      interval: 10,
      onStatusChange: (s) => changes.push(s.status),
    });
    expect(changes).toEqual(['PENDING', 'SUCCESS']);
  });

  it('throws GoBlinkError on timeout', async () => {
    const getStatus = vi.fn().mockResolvedValue(makeStatus('PENDING'));

    await expect(
      waitForCompletion('0xDEPOSIT', getStatus, {
        timeout: 50,
        interval: 10,
      }),
    ).rejects.toThrow(GoBlinkError);
  });
});
