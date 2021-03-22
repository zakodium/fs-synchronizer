# fs-synchronizer

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Recursively find files in folder and extract file informations.

## Installation

`$ npm i fs-synchronizer`

## Usage

```js
import { FileSynchronizer } from 'fs-synchronizer';
const sync = new FileSynchronizer({
  root: 'test-utils',
  maxDepth: 2,
  patterns: [{ type: 'include', pattern: 'a*' }],
});

sync.on('file', (fileInfo) => {
  console.log(`Found file: ${fileInfo.filename}`);
});
sync.on('excluded-file', (fileInfo) => {
  console.log(`Excluded file: ${fileInfo.filename}`);
});
sync.on('end', () => {
  console.log('Finished walking');
});
await sync.walk();
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/fs-synchronizer.svg
[npm-url]: https://www.npmjs.com/package/fs-synchronizer
[ci-image]: https://github.com/zakodium/fs-synchronizer/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/zakodium/fs-synchronizer/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/zakodium/fs-synchronizer.svg
[codecov-url]: https://codecov.io/gh/zakodium/fs-synchronizer
[download-image]: https://img.shields.io/npm/dm/fs-synchronizer.svg
[download-url]: https://www.npmjs.com/package/fs-synchronizer
