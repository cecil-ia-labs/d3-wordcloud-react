import { select } from 'd3-selection';
import { useEffect, useRef, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import type {
  AttributeMap,
  MinMaxPair,
  ResponsiveContainerRef,
  WordGroupSelection,
} from './types';

/**
 * Create a responsive SVG wrapper that mirrors the size of its parent.
 *
 * @param minSize - The minimum `[width, height]` allowed for the SVG.
 * @param initialSize - An optional explicit starting size.
 * @param svgAttributes - Optional attributes applied to the `<svg>` element.
 * @returns A tuple containing the wrapper ref, the inner SVG group selection,
 *   and the current size.
 */
export function useResponsiveSvgSelection(
  minSize: MinMaxPair,
  initialSize: MinMaxPair | undefined,
  svgAttributes: AttributeMap | undefined,
): [ResponsiveContainerRef, WordGroupSelection | null, MinMaxPair] {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<MinMaxPair>(initialSize ?? minSize);
  const [selection, setSelection] = useState<WordGroupSelection | null>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    // Set svg selection.
    let svg = select(element)
      .append('svg')
      .style('display', 'block'); // Native inline SVG leaves undesired white space.

    if (svgAttributes && typeof svgAttributes === 'object') {
      Object.keys(svgAttributes).forEach(key => {
        const attributeValue = svgAttributes[key];

        if (attributeValue !== null && attributeValue !== undefined) {
          svg = svg.attr(key, attributeValue);
        }
      });
    }

    const innerSelection = svg.append('g');
    setSelection(innerSelection);

    /** Update the SVG dimensions and recenter the inner group. */
    function updateSize(width: number, height: number): void {
      svg.attr('height', height).attr('width', width);
      innerSelection.attr('transform', `translate(${width / 2}, ${height / 2})`);
      setSize([width, height]);
    }

    let width = 0;
    let height = 0;
    if (initialSize === undefined) {
      // Use parent node size if a fixed size was not provided.
      width = element.parentElement?.offsetWidth ?? minSize[0];
      height = element.parentElement?.offsetHeight ?? minSize[1];
    } else {
      // Use the provided initial size when the consumer opts out of resizing.
      [width, height] = initialSize;
    }

    width = Math.max(width, minSize[0]);
    height = Math.max(height, minSize[1]);
    updateSize(width, height);

    // Update size whenever the wrapper changes.
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) {
        return;
      }

      if (initialSize === undefined) {
        const { width: nextWidth, height: nextHeight } = entries[0].contentRect;
        updateSize(nextWidth, nextHeight);
      }
    });

    resizeObserver.observe(element);

    // Cleanup.
    return () => {
      resizeObserver.unobserve(element);
      select(element)
        .selectAll('*')
        .remove();
    };
  }, [initialSize, minSize, svgAttributes]);

  return [elementRef, selection, size];
}
