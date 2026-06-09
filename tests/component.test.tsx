import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LayoutArgs, LayoutWord } from '../src/types';

const mocks = vi.hoisted(() => ({
  hookRef: { current: null } as { current: null },
  hookSelection: {},
  hookSize: [420, 260] as [number, number],
  layoutMock: vi.fn((args: LayoutArgs) => args),
}));

vi.mock('../src/hooks', () => ({
  useResponsiveSvgSelection: vi.fn(() => [
    mocks.hookRef,
    mocks.hookSelection,
    mocks.hookSize,
  ]),
}));

vi.mock('../src/layout', () => ({
  layout: mocks.layoutMock,
}));

import {
  ReactWordCloud,
  ReactWordcloud,
  defaultCallbacks,
  defaultOptions,
} from '../src';

/**
 * Verify the component merges defaults, forwards props, and keeps the alias.
 */
describe('ReactWordCloud', () => {
  afterEach(() => {
    mocks.layoutMock.mockClear();
  });

  it('renders a wrapper div and passes merged layout data', async () => {
    render(
      <ReactWordCloud
        aria-label="word cloud"
        callbacks={{
          getWordColor: () => '#123456',
        }}
        options={{
          fontFamily: 'Inter',
        }}
        words={[{ text: 'Alpha', value: 3 }]}
      />,
    );

    expect(screen.getByLabelText('word cloud')).toBeInTheDocument();
    expect(ReactWordcloud).toBe(ReactWordCloud);

    await waitFor(() => {
      expect(mocks.layoutMock).toHaveBeenCalledTimes(1);
    });

    const [payload] = mocks.layoutMock.mock.calls[0];
    const sampleWord = { text: 'Alpha', value: 3 } as LayoutWord;

    expect(payload.size).toEqual(mocks.hookSize);
    expect(payload.selection).toBe(mocks.hookSelection);
    expect(payload.callbacks.getWordColor?.(sampleWord)).toBe('#123456');
    expect(payload.callbacks.getWordTooltip(sampleWord)).toBe('Alpha (3)');
    expect(payload.options.fontFamily).toBe('Inter');
    expect(payload.options.enableTooltip).toBe(true);
    expect(payload.options.colors).toHaveLength(defaultOptions.colors.length);
    expect(defaultCallbacks.getWordTooltip({ text: 'Beta', value: 5 } as LayoutWord)).toBe(
      'Beta (5)',
    );
  });
});
