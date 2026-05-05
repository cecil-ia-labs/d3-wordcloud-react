import _ from 'lodash';
import React, { useEffect, useRef } from 'react';

import { useResponsiveSvgSelection } from './hooks';
import { layout } from './layout';
import { getDefaultColors } from './utils';

export const defaultCallbacks = {
  getWordTooltip: ({ text, value }) => `${text} (${value})`,
};

export const defaultOptions = {
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
  tooltipOptions: {},
  transitionDuration: 600,
};

const defaultMinSize = [300, 300];

export function ReactWordCloud({
  callbacks = defaultCallbacks,
  maxWords = 100,
  minSize = defaultMinSize,
  options = defaultOptions,
  size: initialSize,
  words,
  ...rest
}) {
  const [ref, selection, size] = useResponsiveSvgSelection(
    minSize,
    initialSize,
    options.svgAttributes,
  );

  const render = useRef(_.debounce(layout, 100));

  useEffect(() => {
    if (selection) {
      const mergedCallbacks = { ...defaultCallbacks, ...callbacks };
      const mergedOptions = { ...defaultOptions, ...options };

      render.current({
        callbacks: mergedCallbacks,
        maxWords,
        options: mergedOptions,
        selection,
        size,
        words,
      });
    }
  }, [maxWords, callbacks, options, selection, size, words]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} {...rest} />;
}

// Backward-compatible alias with the original package API.
export const ReactWordcloud = ReactWordCloud;

export default ReactWordCloud;
