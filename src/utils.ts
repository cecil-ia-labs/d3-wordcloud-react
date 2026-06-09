import { max, min, range } from 'd3-array';
import { scaleLinear, scaleLog, scaleOrdinal, scaleSqrt } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import type { FontScale, MinMaxPair, Scale, Word } from './types';

/**
 * Select a random item from an array.
 *
 * @typeParam T - The element type stored in the array.
 * @param array - The candidate values to choose from.
 * @param random - A random source that returns a floating-point number in the
 *   half-open interval `[0, 1)`.
 * @returns A randomly selected array item.
 */
export function choose<T>(array: readonly T[], random: () => number): T {
  const choice = array[Math.floor(random() * array.length)];

  if (choice === undefined) {
    throw new Error('Cannot choose a value from an empty array.');
  }

  return choice;
}

/**
 * Build the default categorical color palette.
 *
 * @returns Twenty deterministic color values derived from D3's Category10
 *   palette.
 */
export function getDefaultColors(): string[] {
  return range(20)
    .map(number => number.toString())
    .map(scaleOrdinal(schemeCategory10));
}

/**
 * Create the D3 scale used to translate word values into font sizes.
 *
 * @param words - The word collection used to determine the numeric domain.
 * @param fontSizes - The minimum and maximum font sizes to interpolate.
 * @param scale - The scale strategy to use.
 * @returns A callable D3 scale that maps word values to pixel sizes.
 */
export function getFontScale(
  words: readonly Word[],
  fontSizes: MinMaxPair,
  scale: Scale,
): FontScale {
  const minSize = min(words, word => Number(word.value)) ?? 0;
  const maxSize = max(words, word => Number(word.value)) ?? minSize;

  switch (scale) {
    case 'log':
      return scaleLog().domain([minSize, maxSize]).range(fontSizes);
    case 'sqrt':
      return scaleSqrt().domain([minSize, maxSize]).range(fontSizes);
    case 'linear':
    default:
      return scaleLinear().domain([minSize, maxSize]).range(fontSizes);
  }
}

/**
 * Convert a computed word size into a CSS font-size string.
 *
 * @param word - The computed word metadata.
 * @returns A CSS-compatible font-size value in pixels.
 */
export function getFontSize(word: { size?: number | undefined }): string {
  return `${word.size ?? 0}px`;
}

/**
 * Read the text value from a word object.
 *
 * @param word - The word to inspect.
 * @returns The text that should be rendered for the word.
 */
export function getText(word: { text?: string | undefined }): string {
  return word.text ?? '';
}

/**
 * Convert a laid out word into an SVG transform string.
 *
 * @param word - The computed word to transform.
 * @returns A `translate(...) rotate(...)` transform string.
 */
export function getTransform(
  word: { rotate?: number | undefined; x?: number | undefined; y?: number | undefined },
): string {
  const translate = `translate(${word.x ?? 0}, ${word.y ?? 0})`;
  const rotate =
    typeof word.rotate === 'number' ? `rotate(${word.rotate})` : '';
  return translate + rotate;
}

/**
 * Pick a rotation angle from the configured range.
 *
 * @param rotations - The number of evenly spaced angles to generate.
 * @param rotationAngles - The inclusive minimum and maximum angle values.
 * @param random - A random source used to select one angle from the list.
 * @returns A rotation angle in degrees.
 */
export function rotate(
  rotations: number,
  rotationAngles: MinMaxPair,
  random: () => number,
): number {
  if (rotations < 1) {
    return 0;
  }

  let angles: number[] = [];
  if (rotations === 1) {
    angles = [rotationAngles[0]];
  } else {
    angles = [...rotationAngles];
    const increment = (rotationAngles[1] - rotationAngles[0]) / (rotations - 1);
    let angle = rotationAngles[0] + increment;

    while (angle < rotationAngles[1]) {
      angles.push(angle);
      angle += increment;
    }
  }

  return choose(angles, random);
}
