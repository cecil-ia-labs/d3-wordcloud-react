import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LayoutArgs } from '../src/types';
import { createCloudMock, createGroupSelectionStub } from './test-helpers';

let d3CloudMockInstance: ReturnType<typeof createCloudMock>['cloud'];
let optimizedCloudMockInstance: ReturnType<typeof createCloudMock>['cloud'];

vi.mock('d3-cloud', () => ({
  default: vi.fn(() => d3CloudMockInstance),
}));

vi.mock('../src/optimized-d3-cloud', () => ({
  default: vi.fn(() => optimizedCloudMockInstance),
}));

import { layout } from '../src/layout';

/**
 * Exercise the layout pipeline using controllable cloud and selection mocks.
 */
describe('layout', () => {
  beforeEach(() => {
    d3CloudMockInstance = createCloudMock().cloud;
    optimizedCloudMockInstance = createCloudMock().cloud;
  });

  it('configures a standard d3-cloud instance and renders the first maxWords words', () => {
    const { groupSelection, textSelection } = createGroupSelectionStub();

    const payload: LayoutArgs = {
      callbacks: {
        getWordTooltip: word => `${word.text} (${word.value})`,
      },
      maxWords: 1,
      options: {
        colors: ['#ff0000', '#00ff00'],
        deterministic: true,
        enableOptimizations: false,
        enableTooltip: false,
        fontFamily: 'Inter',
        fontSizes: [12, 24],
        fontStyle: 'normal',
        fontWeight: 'bold',
        padding: 2,
        rotationAngles: [-45, 45],
        rotations: 1,
        scale: 'linear',
        spiral: 'rectangular',
        svgAttributes: {},
        textAttributes: {},
        tooltipOptions: {},
        transitionDuration: 0,
      },
      selection: groupSelection,
      size: [500, 300],
      words: [
        { text: 'Alpha', value: 10 },
        { text: 'Beta', value: 3 },
      ],
    };

    layout(payload);

    expect(d3CloudMockInstance.words).toHaveBeenCalledWith([
      expect.objectContaining({ text: 'Alpha', value: 10 }),
    ]);
    expect(d3CloudMockInstance.size).toHaveBeenCalledWith([500, 300]);
    expect(d3CloudMockInstance.padding).toHaveBeenCalledWith(2);
    expect(d3CloudMockInstance.random).toHaveBeenCalled();
    expect(d3CloudMockInstance.start).toHaveBeenCalled();
    expect(groupSelection.selectAll).toHaveBeenCalledWith('text');
    expect(textSelection.append).toHaveBeenCalledWith('text');
    expect(textSelection.text).toHaveBeenCalled();
  });

  it('uses the optimized cloud wrapper when enabled', () => {
    const { groupSelection } = createGroupSelectionStub();

    const reviveSpy = vi.fn(() => optimizedCloudMockInstance);
    optimizedCloudMockInstance.revive = reviveSpy;

    layout({
      callbacks: {
        getWordTooltip: word => `${word.text} (${word.value})`,
      },
      maxWords: 2,
      options: {
        colors: ['#ff0000'],
        deterministic: false,
        enableOptimizations: true,
        enableTooltip: false,
        fontFamily: 'Inter',
        fontSizes: [12, 24],
        fontStyle: 'normal',
        fontWeight: 'bold',
        padding: 1,
        rotationAngles: [-45, 45],
        scale: 'sqrt',
        spiral: 'archimedean',
        svgAttributes: {},
        textAttributes: {},
        tooltipOptions: {},
        transitionDuration: 0,
      },
      selection: groupSelection,
      size: [400, 220],
      words: [{ text: 'Gamma', value: 5 }],
    });

    expect(reviveSpy).toHaveBeenCalledTimes(1);
    expect(optimizedCloudMockInstance.start).toHaveBeenCalled();
  });
});
