import { describe, expect, it } from 'vitest';

import {
  choose,
  getDefaultColors,
  getFontScale,
  getFontSize,
  getText,
  getTransform,
  rotate,
} from '../src/utils';

/**
 * Exercise the pure utility helpers that power layout and rendering.
 */
describe('utility helpers', () => {
  it('returns the default palette and deterministic random choices', () => {
    const colors = getDefaultColors();

    expect(colors).toHaveLength(20);
    expect(colors.every(color => typeof color === 'string')).toBe(true);
    expect(choose(['alpha', 'beta'], () => 0)).toBe('alpha');
    expect(choose(['alpha', 'beta'], () => 0.999)).toBe('beta');
  });

  it('scales values and formats word metadata', () => {
    const scale = getFontScale(
      [
        { text: 'small', value: 1 },
        { text: 'large', value: 10 },
      ],
      [12, 36],
      'linear',
    );

    expect(scale(1)).toBe(12);
    expect(scale(10)).toBe(36);
    expect(getFontSize({ size: 18 })).toBe('18px');
    expect(getText({ text: 'hello' })).toBe('hello');
    expect(getTransform({ rotate: 30, x: 12, y: -4 })).toBe(
      'translate(12, -4)rotate(30)',
    );
  });

  it('chooses rotation angles from the configured range', () => {
    expect(rotate(0, [-90, 90], () => 0.5)).toBe(0);
    expect(rotate(1, [-90, 90], () => 0.5)).toBe(-90);
  });
});
