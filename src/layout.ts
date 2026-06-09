import { descending } from 'd3-array';
import d3Cloud from 'd3-cloud';
import 'd3-transition';
import { cloneDeep } from 'lodash';
import seedrandom from 'seedrandom';
import tippy from 'tippy.js';

import optimizedD3Cloud from './optimized-d3-cloud';
import {
  choose,
  getFontScale,
  getFontSize,
  getText,
  getTransform,
  rotate,
} from './utils';
import type {
  LayoutArgs,
  LayoutWord,
  RandomSource,
  RenderArgs,
  Word,
} from './types';
import type { Instance as TippyInstance } from 'tippy.js';

type CloudLayout = ReturnType<typeof d3Cloud> & {
  revive?: () => void;
};

/**
 * Render the laid out words into the SVG selection.
 *
 * @param args - Render payload produced by the layout engine.
 */
export function render({
  callbacks,
  options,
  random,
  selection,
  words,
}: RenderArgs): void {
  const {
    getWordColor,
    getWordTooltip,
    onWordClick,
    onWordMouseOver,
    onWordMouseOut,
  } = callbacks;
  const {
    colors,
    enableTooltip,
    fontStyle,
    fontWeight,
    textAttributes,
    tooltipOptions,
  } = options;
  const { fontFamily, transitionDuration } = options;

  /**
   * Resolve the fill color for a word.
   *
   * @param word - The word being rendered.
   * @returns The fill color to apply.
   */
  function getFill(word: LayoutWord): string {
    return getWordColor ? getWordColor(word) : choose(colors, random);
  }

  let tooltipInstance: TippyInstance | null = null;
  const vizWords = selection.selectAll<SVGTextElement, LayoutWord>('text').data(words);

  vizWords.join(
    enter => {
      const text = enter
        .append('text')
        .on('click', (event: MouseEvent, word: LayoutWord) => {
          if (onWordClick) {
            onWordClick(word, event);
          }
        })
        .on('mouseover', (event: MouseEvent, word: LayoutWord) => {
          if (
            enableTooltip &&
            (!tooltipInstance || tooltipInstance.state.isDestroyed)
          ) {
            tooltipInstance = tippy(event.target as Element, {
              animation: 'scale',
              arrow: true,
              content: () => getWordTooltip(word),
              onHidden: instance => {
                instance.destroy();
                tooltipInstance = null;
              },
              ...tooltipOptions,
            });
          }

          if (onWordMouseOver) {
            onWordMouseOver(word, event);
          }
        })
        .on('mouseout', (event: MouseEvent, word: LayoutWord) => {
          if (tooltipInstance && !tooltipInstance.state.isVisible) {
            tooltipInstance.destroy();
            tooltipInstance = null;
          }

          if (onWordMouseOut) {
            onWordMouseOut(word, event);
          }
        })
        .attr('cursor', onWordClick ? 'pointer' : 'default')
        .attr('fill', getFill)
        .attr('font-family', fontFamily)
        .attr('font-style', fontStyle)
        .attr('font-weight', fontWeight)
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(0, 0) rotate(0)');

      Object.entries(textAttributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          text.attr(key, value);
        }
      });

      text
        .transition()
        .duration(transitionDuration)
        .attr('font-size', getFontSize)
        .attr('transform', getTransform)
        .text(getText);

      return text;
    },
    update => {
      update
        .transition()
        .duration(transitionDuration)
        .attr('fill', getFill)
        .attr('font-family', fontFamily)
        .attr('font-size', getFontSize)
        .attr('transform', getTransform)
        .text(getText);

      return update;
    },
    exit => {
      exit
        .transition()
        .duration(transitionDuration)
        .attr('fill-opacity', 0)
        .remove();

      return exit;
    },
  );
}

/**
 * Calculate the layout positions for the provided words.
 *
 * @param args - Layout payload from the component.
 */
export function layout({
  callbacks,
  maxWords,
  options,
  selection,
  size,
  words,
}: LayoutArgs): void {
  const MAX_LAYOUT_ATTEMPTS = 10;
  const SHRINK_FACTOR = 0.95;
  const {
    deterministic,
    enableOptimizations,
    fontFamily,
    fontStyle,
    fontSizes,
    fontWeight,
    padding,
    randomSeed,
    rotations,
    rotationAngles,
    spiral,
    scale,
  } = options;

  const sortedWords = words
    .concat()
    .sort((x, y) => descending(x.value, y.value))
    .slice(0, maxWords);

  const random = seedrandom(
    deterministic ? randomSeed ?? 'deterministic' : undefined,
  ) as RandomSource;

  const cloud: CloudLayout = enableOptimizations
    ? (optimizedD3Cloud() as CloudLayout)
    : (d3Cloud() as CloudLayout);

  cloud
    .size(size)
    .padding(padding)
    .words(cloneDeep(sortedWords))
    .rotate(() => {
      if (rotations === undefined) {
        // Default rotation algorithm.
        return (~~(random() * 6) - 3) * 30;
      }

      return rotate(rotations, rotationAngles, random);
    })
    .spiral(spiral)
    .random(random)
    .text(getText)
    .font(fontFamily)
    .fontStyle(fontStyle)
    .fontWeight(fontWeight);

  /**
   * Run a layout pass and recursively shrink the font size if words collide.
   *
   * @param currentFontSizes - The active font-size range for this attempt.
   * @param attempts - The number of layout attempts completed so far.
   */
  function draw(currentFontSizes: [number, number], attempts = 1): void {
    if (enableOptimizations) {
      cloud.revive?.();
    }

    const fontScale = getFontScale(sortedWords, currentFontSizes, scale);

    cloud
      .fontSize(word => fontScale((word as Word).value))
      .on('end', (computedWords: Word[]) => {
        const laidOutWords = computedWords as LayoutWord[];

        /**
         * KNOWN ISSUE: https://github.com/jasondavies/d3-cloud/issues/36
         * Recursively layout and decrease font-sizes by a SHRINK_FACTOR.
         * Bail out with a warning message after MAX_LAYOUT_ATTEMPTS.
         */
        if (
          sortedWords.length !== laidOutWords.length &&
          attempts <= MAX_LAYOUT_ATTEMPTS
        ) {
          if (attempts === MAX_LAYOUT_ATTEMPTS) {
            console.warn(
              `Unable to layout ${sortedWords.length - laidOutWords.length} word(s) after ${attempts} attempts. Consider: (1) Increasing the container/component size. (2) Lowering the max font size. (3) Limiting the rotation angles.`,
            );
          }

          const minFontSize = Math.max(currentFontSizes[0] * SHRINK_FACTOR, 1);
          const maxFontSize = Math.max(
            currentFontSizes[1] * SHRINK_FACTOR,
            minFontSize,
          );

          draw([minFontSize, maxFontSize], attempts + 1);
        } else {
          render({
            callbacks,
            options,
            random,
            selection,
            words: laidOutWords,
          });
        }
      })
      .start();
  }

  draw(fontSizes);
}
