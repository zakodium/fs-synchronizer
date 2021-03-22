import { FileSynchronizer } from '../FileSynchronizer';
import { FileInfo, Pattern, SyncOptions } from '../types';

const defaultOptions = {
  root: 'test-utils',
};

async function stub(options: SyncOptions) {
  const sync = new FileSynchronizer(options);

  const files: FileInfo[] = [];
  const excludedFiles: FileInfo[] = [];

  sync.on('file', (fileInfo) => {
    files.push(fileInfo);
  });

  sync.on('excluded-file', (fileInfo) => {
    excludedFiles.push(fileInfo);
  });

  await sync.walk();

  return {
    files,
    excludedFiles,
  };
}

test('should throws if "root" is undefined', async () => {
  const t = async () => {
    await stub({ ...defaultOptions, root: (undefined as unknown) as string });
  };
  await expect(t).rejects.toBeInstanceOf(TypeError);
});
test('should throws if "maxDepth" is not an integer', async () => {
  const t = async () => {
    await stub({ ...defaultOptions, maxDepth: 4.2 });
  };
  await expect(t).rejects.toBeInstanceOf(TypeError);
});
test('should throws if "patterns" is not an array', async () => {
  const t = async () => {
    await stub({ ...defaultOptions, patterns: ({} as unknown) as Pattern[] });
  };
  await expect(t).rejects.toBeInstanceOf(TypeError);
});
test('should match with files without patterns', async () => {
  const syncOptions: SyncOptions = defaultOptions;

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(4);
  expect(excludedFiles).toHaveLength(0);
});
test('should match with exclusion, but no inclusion', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [{ type: 'exclude', pattern: 'a*' }],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(3);
  expect(excludedFiles).toHaveLength(1);
});
test('should match with inclusion, but no exclusion', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [{ type: 'include', pattern: 'a*' }],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(1);
  expect(excludedFiles).toHaveLength(3);
});
test('should match correctly with both inclusion and exclusion (include)', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [
      { type: 'include', pattern: 'a*' },
      { type: 'exclude', pattern: '[abc]*' },
    ],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(1);
  expect(excludedFiles).toHaveLength(3);
});
test('should match correctly with both inclusion and exclusion (exclude)', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [
      { type: 'exclude', pattern: 'b*' },
      { type: 'include', pattern: '[cd]*' },
    ],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(2);
  expect(excludedFiles).toHaveLength(2);
});
test('should match correctly with both inclusions and exclusion', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [
      { type: 'include', pattern: 'a*' },
      { type: 'exclude', pattern: '[cd]*' },
      { type: 'include', pattern: 'b*' },
    ],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(2);
  expect(excludedFiles).toHaveLength(2);
});
test('should match correctly with both inclusion and exclusions', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [
      { type: 'exclude', pattern: 'a*' },
      { type: 'include', pattern: '[cd]*' },
      { type: 'exclude', pattern: 'b*' },
    ],
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(2);
  expect(excludedFiles).toHaveLength(2);
});
test('stop when at max depth', async () => {
  const syncOptions: SyncOptions = {
    ...defaultOptions,
    maxDepth: 1,
  };

  const { files, excludedFiles } = await stub(syncOptions);

  expect(files).toHaveLength(3);
  expect(excludedFiles).toHaveLength(0);
});
test('"end" event emitted after other events', async () => {
  expect.assertions(2);

  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [{ type: 'include', pattern: '[abc].txt' }],
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

  await sync.walk();
});
test('"end" event emitted before promise resolution', async () => {
  expect.assertions(1);

  const syncOptions: SyncOptions = {
    ...defaultOptions,
    patterns: [{ type: 'include', pattern: '[abc].txt' }],
  };

  const sync = new FileSynchronizer(syncOptions);

  let isPromiseResolved = false;

  sync.on('end', () => {
    expect(isPromiseResolved).toStrictEqual(false);
  });

  await sync.walk().then(() => (isPromiseResolved = true));
});
