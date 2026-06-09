# d3-wordcloud-react

Typed React + D3 word cloud component built on the [`d3-cloud`](https://github.com/jasondavies/d3-cloud) layout.

This package is a maintained fork of [`react-wordcloud`](https://github.com/chrisrzhou/react-wordcloud) with a modern TypeScript source tree, updated tooling, and current React 18/19-friendly dependencies.

## Install

```bash
npm install d3-wordcloud-react
```

## Usage

### Minimal example

```tsx
import { ReactWordCloud } from 'd3-wordcloud-react';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

const words = [
  { text: 'told', value: 64 },
  { text: 'mistake', value: 11 },
  { text: 'thought', value: 16 },
  { text: 'bad', value: 17 },
];

export function SimpleWordCloud() {
  return <ReactWordCloud words={words} />;
}
```

`ReactWordCloud` renders responsively by default and enables tooltips out of the box. If you want tooltips to match the default styling shown in the examples, keep the Tippy CSS imports above.

### Fully customized example

```tsx
import { ReactWordCloud, type ReactWordCloudProps } from 'd3-wordcloud-react';

const callbacks: ReactWordCloudProps['callbacks'] = {
  getWordColor: word => (word.value > 50 ? '#0d6efd' : '#dc3545'),
  getWordTooltip: word => `${word.text} (${word.value})`,
  onWordClick: (word, event) => {
    console.log('clicked', word.text, event.type);
  },
};

const options: ReactWordCloudProps['options'] = {
  fontFamily: 'Inter, system-ui, sans-serif',
  rotations: 2,
  rotationAngles: [-90, 0],
  transitionDuration: 450,
};

const size: [number, number] = [600, 400];

const words: ReactWordCloudProps['words'] = [
  { text: 'analysis', value: 42 },
  { text: 'design', value: 26 },
  { text: 'tests', value: 18 },
  { text: 'typescript', value: 12 },
];

export function RichWordCloud() {
  return (
    <ReactWordCloud
      callbacks={callbacks}
      options={options}
      size={size}
      words={words}
    />
  );
}
```

### Exported types

The package also exports the component props and shared utility types, so you can type your own helpers against the same public contract:

```ts
import type {
  Callbacks,
  LayoutWord,
  Options,
  ReactWordCloudProps,
  Word,
} from 'd3-wordcloud-react';
```

## API notes

- `ReactWordCloud` is the canonical export.
- `ReactWordcloud` is kept as a backwards-compatible alias.
- `words` must contain at least `text` and `value`.
- `options.svgAttributes` and `options.textAttributes` allow you to pass additional SVG attributes.
- `options.tooltipOptions` is forwarded to Tippy.js.

## Development

```bash
npm install
npm run lint
npm run lint:fix
npm run typecheck
npm test
npm run test:coverage
npm run build
```

## Release process

Releases are automated through GitHub Actions:

1. Update the package version.
2. Push the tagged commit to `main`.
3. The publish workflow builds the package and uploads the release artifacts to npm.

See [RELEASE.md](./RELEASE.md) for the manual release notes and maintenance checklist.
