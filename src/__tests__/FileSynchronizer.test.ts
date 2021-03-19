import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill';

import { FileSynchronizer } from '../FileSynchronizer';
import { FileInfo, SyncOptions } from '../types';

test('should match with files without patterns', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(4);
    expect(excludedFiles).toHaveLength(0);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match with exclusion, but no inclusion', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [{ type: 'exclude', pattern: 'a*' }],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(3);
    expect(excludedFiles).toHaveLength(1);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match with inclusion, but no exclusion', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [{ type: 'include', pattern: 'a*' }],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(1);
    expect(excludedFiles).toHaveLength(3);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match correctly with both inclusion and exclusion (include)', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [
      { type: 'include', pattern: 'a*' },
      { type: 'exclude', pattern: '[abc]*' },
    ],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(1);
    expect(excludedFiles).toHaveLength(3);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match correctly with both inclusion and exclusion (exclude)', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [
      { type: 'exclude', pattern: 'b*' },
      { type: 'include', pattern: '[cd]*' },
    ],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(2);
    expect(excludedFiles).toHaveLength(2);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match correctly with both inclusions and exclusion', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [
      { type: 'include', pattern: 'a*' },
      { type: 'exclude', pattern: '[cd]*' },
      { type: 'include', pattern: 'b*' },
    ],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(2);
    expect(excludedFiles).toHaveLength(2);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
test('should match correctly with both inclusion and exclusions', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    root: 'test-utils',
    patterns: [
      { type: 'exclude', pattern: 'a*' },
      { type: 'include', pattern: '[cd]*' },
      { type: 'exclude', pattern: 'b*' },
    ],
  };

  const sync = new FileSynchronizer(syncOptions);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  sync.on('end', () => {
    expect(files).toHaveLength(2);
    expect(excludedFiles).toHaveLength(2);
  });

  const controller = new AbortController();
  await sync.walk({ signal: controller.signal });
});
