import { vi } from 'vitest';

import type { LayoutWord, WordGroupSelection } from '../src/types';

type MockFn = ReturnType<typeof vi.fn>;

/**
 * Create a d3-cloud compatible mock that records configuration and emits a
 * predictable set of laid out words when `start()` is called.
 */
export function createCloudMock() {
  const state = {
    endHandler: null as ((words: LayoutWord[]) => void) | null,
    fontSize: (_word: LayoutWord, _index: number) => 0,
    random: () => 0.5,
    rotate: (_word: LayoutWord, _index: number) => 0,
    size: [0, 0] as [number, number],
    words: [] as LayoutWord[],
  };

  const cloud = {
    font: vi.fn(() => cloud),
    fontSize: vi.fn((value?: (word: LayoutWord, index: number) => number) => {
      if (value === undefined) {
        return state.fontSize;
      }

      state.fontSize = value;
      return cloud;
    }) as MockFn,
    fontStyle: vi.fn(() => cloud),
    fontWeight: vi.fn(() => cloud),
    on: vi.fn((type: string, listener?: ((...args: unknown[]) => void) | null) => {
      if (listener === undefined) {
        return type === 'end' ? state.endHandler : undefined;
      }

      if (type === 'end') {
        state.endHandler = listener as (words: LayoutWord[]) => void;
      }

      return cloud;
    }) as MockFn,
    padding: vi.fn(() => cloud),
    random: vi.fn((value?: () => number) => {
      if (value === undefined) {
        return state.random;
      }

      state.random = value;
      return cloud;
    }) as MockFn,
    revive: vi.fn(() => cloud),
    rotate: vi.fn((value?: (word: LayoutWord, index: number) => number) => {
      if (value === undefined) {
        return state.rotate;
      }

      state.rotate = value;
      return cloud;
    }) as MockFn,
    size: vi.fn((value?: [number, number]) => {
      if (value === undefined) {
        return state.size;
      }

      state.size = value;
      return cloud;
    }) as MockFn,
    spiral: vi.fn(() => cloud),
    start: vi.fn(() => {
      const laidOutWords = state.words.map((word, index) => ({
        ...word,
        font: word.font ?? 'serif',
        hasText: true,
        height: 20,
        padding: word.padding ?? 1,
        rotate: state.rotate(word, index),
        size: state.fontSize(word, index),
        sprite: word.sprite,
        style: word.style ?? 'normal',
        weight: word.weight ?? 'normal',
        width: 20,
        x: index * 10,
        x0: -10,
        x1: 10,
        xoff: 0,
        y: index * 6,
        y0: -10,
        y1: 10,
        yoff: 0,
      })) as LayoutWord[];

      state.endHandler?.(laidOutWords);
      return cloud;
    }) as MockFn,
    text: vi.fn((value?: (word: LayoutWord, index: number) => string) => {
      if (value === undefined) {
        return (word: LayoutWord) => word.text;
      }

      return cloud;
    }) as MockFn,
    words: vi.fn((value?: LayoutWord[]) => {
      if (value === undefined) {
        return state.words;
      }

      state.words = value;
      return cloud;
    }) as MockFn,
  };

  return { cloud, state };
}

/**
 * Create a minimal d3-selection compatible group selection for layout tests.
 */
export function createGroupSelectionStub() {
  type TextSelectionStub = {
    append: MockFn;
    attr: MockFn;
    call: MockFn;
    duration: MockFn;
    on: MockFn;
    remove: MockFn;
    text: MockFn;
    transition: MockFn;
  };

  const textSelection = {
    append: vi.fn(() => textSelection),
    attr: vi.fn(() => textSelection),
    call: vi.fn((callback: (selection: TextSelectionStub) => void) => {
      callback(textSelection);
      return textSelection;
    }),
    duration: vi.fn(() => textSelection),
    on: vi.fn(() => textSelection),
    remove: vi.fn(() => textSelection),
    text: vi.fn(() => textSelection),
    transition: vi.fn(() => textSelection),
  } as TextSelectionStub;

  const dataJoin = {
    join: vi.fn(
      (
        enter: (selection: typeof textSelection) => unknown,
        update: (selection: typeof textSelection) => unknown,
        exit: (selection: typeof textSelection) => unknown,
      ) => {
        enter(textSelection);
        update(textSelection);
        exit(textSelection);
        return textSelection;
      },
    ),
  };

  const groupSelection = {
    selectAll: vi.fn(() => ({
      data: vi.fn(() => dataJoin),
    })),
  } as unknown as WordGroupSelection;

  return { groupSelection, textSelection };
}
