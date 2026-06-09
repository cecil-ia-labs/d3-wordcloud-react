import { debounce } from 'lodash';
import React, { useEffect, useRef } from 'react';

import { useResponsiveSvgSelection } from './hooks';
import { layout } from './layout';
import { getDefaultColors } from './utils';
import type { DebouncedFunc } from 'lodash';
import type {
  Callbacks,
  LayoutArgs,
  MinMaxPair,
  Options,
  ReactWordCloudProps,
} from './types';

/**
 * Format the default tooltip text for a word.
 *
 * @param word - The word displayed in the cloud.
 * @returns A human-friendly tooltip label.
 */
function getDefaultWordTooltip({ text, value }: { text: string; value: number }): string {
  return `${text} (${value})`;
}

/**
 * Default callback implementations used when the consumer does not supply any.
 */
export const defaultCallbacks: Callbacks = {
  getWordTooltip: getDefaultWordTooltip,
};

/**
 * Default rendering options used by the component.
 */
export const defaultOptions: Options = {
  colors: getDefaultColors(),
  deterministic: false,
  enableOptimizations: false,
  enableTooltip: true,
  fontFamily: 'times new roman',
  fontSizes: [4, 32],
  fontStyle: 'normal',
  fontWeight: 'normal',
  padding: 1,
  rotationAngles: [-90, 90],
  scale: 'sqrt',
  spiral: 'rectangular',
  svgAttributes: {},
  textAttributes: {},
  tooltipOptions: {},
  transitionDuration: 600,
};

const defaultMinSize: MinMaxPair = [300, 300];

/**
 * Render a responsive D3 word cloud.
 *
 * @param props - Component props controlling layout, callbacks, and sizing.
 * @returns A wrapper div that hosts the generated SVG.
 */
export function ReactWordCloud({
  callbacks = defaultCallbacks,
  maxWords = 100,
  minSize = defaultMinSize,
  options = defaultOptions,
  size: initialSize,
  words,
  ...rest
}: ReactWordCloudProps): React.ReactElement {
  const svgAttributes = options?.svgAttributes;
  const [ref, selection, size] = useResponsiveSvgSelection(
    minSize,
    initialSize,
    svgAttributes,
  );

  const render = useRef<DebouncedFunc<(args: LayoutArgs) => void>>(
    debounce(layout, 100),
  );

  useEffect(() => {
    const currentRender = render.current;

    return () => {
      currentRender.cancel();
    };
  }, []);

  useEffect(() => {
    if (selection) {
      const mergedCallbacks: Callbacks = { ...defaultCallbacks, ...callbacks };
      const mergedOptions: Options = { ...defaultOptions, ...options };

      render.current({
        callbacks: mergedCallbacks,
        maxWords,
        options: mergedOptions,
        selection,
        size,
        words,
      });
    }
  }, [callbacks, maxWords, options, selection, size, words]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} {...rest} />;
}

/**
 * Backwards-compatible alias that preserves the original package casing.
 */
export const ReactWordcloud = ReactWordCloud;

export default ReactWordCloud;
