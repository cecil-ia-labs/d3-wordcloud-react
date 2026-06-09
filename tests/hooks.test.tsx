import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('resize-observer-polyfill', () => {
  return {
    default: class ResizeObserverMock {
      observe = vi.fn();

      unobserve = vi.fn();
    },
  };
});

import { useResponsiveSvgSelection } from '../src/hooks';

const MIN_SIZE: [number, number] = [120, 80];
const INITIAL_SIZE: [number, number] = [320, 240];
const SVG_ATTRIBUTES = { role: 'img' };

/**
 * Mount a tiny component so the hook can create and size its SVG container.
 */
function HookHarness() {
  const [ref, selection, size] = useResponsiveSvgSelection(
    MIN_SIZE,
    INITIAL_SIZE,
    SVG_ATTRIBUTES,
  );

  return (
    <div>
      <div ref={ref} data-testid="target">
        <span data-testid="size">{size.join('x')}</span>
        {selection ? <span data-testid="selection">ready</span> : null}
      </div>
    </div>
  );
}

/**
 * Cover the responsive SVG hook end-to-end inside a jsdom environment.
 */
describe('useResponsiveSvgSelection', () => {
  it('creates a sized svg and centers its inner group', async () => {
    const { container } = render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('selection')).toBeInTheDocument();
    });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('width', '320');
    expect(svg).toHaveAttribute('height', '240');
    expect(screen.getByTestId('size')).toHaveTextContent('320x240');
  });
});
