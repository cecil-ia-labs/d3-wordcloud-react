import d3Cloud from 'd3-cloud';

import type { LayoutWord } from './types';

/**
 * A small compatibility wrapper that preserves the original optimized-cloud API
 * surface while delegating the heavy lifting to d3-cloud.
 *
 * The historical package exposed a `revive()` method that the layout pipeline
 * still calls when the optimization flag is enabled. The standard d3-cloud
 * layout already handles batching well enough for this package, so the wrapper
 * simply re-exposes the same chainable interface and keeps `revive()` as a
 * no-op.
 */
export interface OptimizedCloud extends ReturnType<typeof d3Cloud> {
  /** Reset any internal killed flag and return the layout instance. */
  revive(): OptimizedCloud;
}

/**
 * Create an optimized-cloud compatibility wrapper.
 *
 * @returns A d3-cloud instance with an additional `revive()` method.
 */
export default function Cloud(): OptimizedCloud {
  const cloud = d3Cloud<LayoutWord>() as unknown as OptimizedCloud;

  /**
   * Preserve the historical API without changing the underlying layout object.
   *
   * @returns The same chainable layout instance.
   */
  cloud.revive = function revive(): OptimizedCloud {
    return cloud;
  };

  return cloud;
}
