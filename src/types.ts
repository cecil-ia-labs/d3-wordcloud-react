import type { HTMLAttributes, MutableRefObject } from 'react';
import type { Selection } from 'd3-selection';
import type { Props as TippyProps } from 'tippy.js';

/**
 * A two-value tuple used for width/height and min/max pairs.
 */
export type MinMaxPair = [number, number];

/**
 * Supported scaling strategies for font sizes.
 */
export type Scale = 'linear' | 'log' | 'sqrt';

/**
 * Supported spiral algorithms used by the word layout engine.
 */
export type Spiral = 'archimedean' | 'rectangular';

/**
 * Primitive values accepted by custom SVG/text attribute maps.
 */
export type AttributePrimitive = string | number | boolean | null;

/**
 * Function-based attribute values receive the current datum and can return a
 * primitive SVG attribute value.
 *
 * @typeParam TDatum - The datum type passed to the callback.
 */
export type AttributeValueCallback<TDatum = unknown> = (
  datum: TDatum,
  index: number,
) => AttributePrimitive;

/**
 * Custom attribute values accepted by `svgAttributes` and `textAttributes`.
 *
 * @typeParam TDatum - The datum type passed to function-valued attributes.
 */
export type AttributeValue<TDatum = unknown> =
  | AttributePrimitive
  | AttributeValueCallback<TDatum>;

/**
 * A reusable dictionary of SVG or text attributes.
 *
 * @typeParam TDatum - The datum type passed to function-valued attributes.
 */
export type AttributeMap<TDatum = unknown> = Record<string, AttributeValue<TDatum>>;

/**
 * The minimal word input required by the component.
 */
export interface Word {
  /**
   * Visible text rendered for the word.
   */
  text: string;

  /**
   * Numeric weight used to size and rank the word.
   */
  value: number;

  /**
   * Additional metadata that should stay attached to the word object.
   */
  [key: string]: unknown;
}

/**
 * A word after the layout engine has calculated render coordinates.
 */
export interface LayoutWord extends Word {
  /**
   * Computed font size in pixels.
   */
  size: number;

  /**
   * Font family selected for the word.
   */
  font: string;

  /**
   * CSS font style applied during layout.
   */
  style: string;

  /**
   * CSS font weight applied during layout.
   */
  weight: string | number;

  /**
   * Final rotation angle in degrees.
   */
  rotate: number;

  /**
   * Extra padding around the rendered word.
   */
  padding: number;

  /**
   * X coordinate relative to the layout center.
   */
  x: number;

  /**
   * Y coordinate relative to the layout center.
   */
  y: number;

  /**
   * Left-most collision bound.
   */
  x0: number;

  /**
   * Top-most collision bound.
   */
  y0: number;

  /**
   * Right-most collision bound.
   */
  x1: number;

  /**
   * Bottom-most collision bound.
   */
  y1: number;

  /**
   * Full text width used by the collision detector.
   */
  width: number;

  /**
   * Full text height used by the collision detector.
   */
  height: number;

  /**
   * X offset inside the sprite bitmap.
   */
  xoff: number;

  /**
   * Y offset inside the sprite bitmap.
   */
  yoff: number;

  /**
   * Flag used by the collision engine to mark words that have rendered text.
   */
  hasText: boolean;

  /**
   * Cached bitmap sprite used by the optimized collision engine.
   */
  sprite?: Uint32Array | number[];
}

/**
 * Callback hooks for customizing colors, tooltips, and mouse interactions.
 */
export interface Callbacks {
  /**
   * Return the fill color for a given word.
   */
  getWordColor?: (word: LayoutWord) => string;

  /**
   * Return the tooltip content for a given word.
   */
  getWordTooltip: (word: LayoutWord) => string;

  /**
   * Handle a word click event.
   */
  onWordClick?: (word: LayoutWord, event: MouseEvent) => void;

  /**
   * Handle a word mouse-out event.
   */
  onWordMouseOut?: (word: LayoutWord, event: MouseEvent) => void;

  /**
   * Handle a word mouse-over event.
   */
  onWordMouseOver?: (word: LayoutWord, event: MouseEvent) => void;
}

/**
 * Optional callbacks accepted by the component.
 */
export type CallbacksProp = Partial<Callbacks>;

/**
 * Layout and rendering options accepted by the component.
 */
export interface Options {
  /**
   * Palette used when `getWordColor` is not provided.
   */
  colors: string[];

  /**
   * Produce the same output for the same input by seeding randomness.
   */
  deterministic: boolean;

  /**
   * Use the batched optimized layout implementation.
   */
  enableOptimizations: boolean;

  /**
   * Enable Tippy.js tooltips.
   */
  enableTooltip: boolean;

  /**
   * Font family applied to the rendered words.
   */
  fontFamily: string;

  /**
   * Minimum and maximum font size used by the scale function.
   */
  fontSizes: MinMaxPair;

  /**
   * CSS font style used for all words.
   */
  fontStyle: string;

  /**
   * CSS font weight used for all words.
   */
  fontWeight: string | number;

  /**
   * Inner word padding measured in pixels.
   */
  padding: number;

  /**
   * Optional random seed used when `deterministic` is enabled.
   */
  randomSeed?: string;

  /**
   * Minimum and maximum rotation angle used by `rotate`.
   */
  rotationAngles: MinMaxPair;

  /**
   * Number of evenly spaced rotation angles to generate.
   */
  rotations?: number;

  /**
   * Font size scale strategy.
   */
  scale: Scale;

  /**
   * Spiral path used by the layout engine.
   */
  spiral: Spiral;

  /**
   * Custom attributes added to the generated SVG element.
   */
  svgAttributes: AttributeMap<unknown>;

  /**
   * Custom attributes added to each generated text element.
   */
  textAttributes: AttributeMap<LayoutWord>;

  /**
   * Tippy.js configuration passed through to the tooltip instance.
   */
  tooltipOptions: Partial<TippyProps>;

  /**
   * Animation duration in milliseconds.
   */
  transitionDuration: number;
}

/**
 * Optional options accepted by the component.
 */
export type OptionsProp = Partial<Options>;

/**
 * Public component props.
 */
export interface ReactWordCloudProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Callback hooks for customizing the rendered words.
   */
  callbacks?: CallbacksProp;

  /**
   * Maximum number of words to render.
   */
  maxWords?: number;

  /**
   * Minimum `[width, height]` allowed for the responsive SVG container.
   */
  minSize?: MinMaxPair;

  /**
   * Rendering options for the word cloud.
   */
  options?: OptionsProp;

  /**
   * Explicit `[width, height]` for the SVG container.
   */
  size?: MinMaxPair;

  /**
   * Word data to render.
   */
  words: Word[];
}

/**
 * Backwards-compatible alias that matches the original package casing.
 */
export type ReactWordcloudProps = ReactWordCloudProps;

/**
 * A mutable ref to the responsive wrapper div.
 */
export type ResponsiveContainerRef = MutableRefObject<HTMLDivElement | null>;

/**
 * The D3 selection returned by the responsive hook.
 */
export type WordGroupSelection = Selection<
  SVGGElement,
  unknown,
  null,
  undefined
>;

/**
 * The layout callback payload.
 */
export interface LayoutArgs {
  /**
   * Word customization callbacks.
   */
  callbacks: Callbacks;

  /**
   * Maximum number of words to layout.
   */
  maxWords: number;

  /**
   * Rendering and layout configuration.
   */
  options: Options;

  /**
   * The root SVG group where the words are rendered.
   */
  selection: WordGroupSelection;

  /**
   * Current SVG width and height.
   */
  size: MinMaxPair;

  /**
   * Words to layout and render.
   */
  words: Word[];
}

/**
 * The render callback payload.
 */
export interface RenderArgs {
  /**
   * Word customization callbacks.
   */
  callbacks: Callbacks;

  /**
   * Rendering and layout configuration.
   */
  options: Options;

  /**
   * Random source used for fill colors and rotation choices.
   */
  random: RandomSource;

  /**
   * The root SVG group where the words are rendered.
   */
  selection: WordGroupSelection;

  /**
   * Words that already include layout coordinates.
   */
  words: LayoutWord[];
}

/**
 * A zero-argument random source used for deterministic or random output.
 */
export type RandomSource = () => number;

/**
 * A font-size scale function generated from D3 scale helpers.
 */
export type FontScale = (value: number) => number;
