import EventEmitter from 'events';
import { readdir, stat } from 'fs/promises';
import { join, resolve, extname } from 'path';

import { Minimatch } from 'minimatch';

import {
  SyncOptions,
  WalkOptions,
  WalkCallback,
  FileInfo,
  ProcessedPattern,
} from './types';

export declare interface FileSynchronizer {
  emit(event: 'end'): boolean;
  emit(event: 'file' | 'excluded-file', file: FileInfo): boolean;
  on(event: 'end', listener: () => void): this;
  on(event: 'file' | 'excluded-file', listener: WalkCallback): this;
}

export class FileSynchronizer extends EventEmitter {
  private root: string;
  private maxDepth: number;
  private patterns: ProcessedPattern[];
  private defaultInclude: boolean;

  public constructor({
    root,
    maxDepth = Infinity,
    patterns = [],
  }: SyncOptions) {
    super();

    if (root === undefined) {
      throw new TypeError(`root is undefined`);
    }
    if (Number.isInteger(maxDepth) && maxDepth !== Infinity) {
      throw new TypeError(`maxDepth should be an integer`);
    }
    if (!Array.isArray(patterns)) {
      throw new TypeError(`patterns should be an array`);
    }

    this.root = root;
    this.maxDepth = maxDepth;

    this.patterns = patterns.map(({ type, pattern }) => {
      return {
        type,
        pattern: new Minimatch(pattern),
      };
    });

    this.defaultInclude =
      patterns.find(({ type }) => type === 'include') === undefined;
  }

  public async walk(options: WalkOptions) {
    if (!options.signal.aborted) {
      await this.scanDirectory(this.root, 0);
    }
    this.emit('end');
  }

  private async scanDirectory(rootPath: string, depth: number) {
    const filenames = await readdir(rootPath);
    await Promise.all(
      filenames
        .map(async (filename) => {
          const filePath = join(rootPath, filename);
          const fileStat = await stat(filePath);

          if (fileStat.isDirectory() && depth < this.maxDepth) {
            return this.scanDirectory(filePath, depth + 1);
          } else if (fileStat.isFile()) {
            const fileInfo: FileInfo = {
              path: resolve(filePath),
              relativePath: filePath,
              filename,
              extension: extname(filename),
              size: fileStat.size,
              creationDate: fileStat.birthtime,
              modificationDate: fileStat.mtime,
              stat: fileStat,
            };
            const event = this.shouldInclude(fileInfo)
              ? 'file'
              : 'excluded-file';
            this.emit(event, fileInfo);
            return null;
          } else {
            throw new Error(`Scanned file is neither a file nor a directory`);
          }
        })
        .filter((promise) => promise !== null),
    );
  }

  private shouldInclude(fileInfo: FileInfo): boolean {
    for (const { pattern, type } of this.patterns) {
      if (pattern.match(fileInfo.filename)) {
        if (type === 'include') {
          return true;
        } else {
          return false;
        }
      }
    }
    return this.defaultInclude;
  }
}
