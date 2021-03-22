import EventEmitter from 'events';
import { opendir, stat } from 'fs/promises';
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
    if (!Number.isInteger(maxDepth) && maxDepth !== Infinity) {
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

    this.defaultInclude = !patterns.some(({ type }) => type === 'include');
  }

  public async walk(options: WalkOptions = {}) {
    if (options.signal?.aborted) {
      throw new Error('operation was aborted');
    }

    await this.scanDirectory(this.root, 0, options.signal);
    this.emit('end');
  }

  private async scanDirectory(
    rootPath: string,
    depth: number,
    signal?: AbortSignal,
  ) {
    const dir = await opendir(rootPath);
    for await (const dirent of dir) {
      if (signal?.aborted) {
        throw new Error('operation was aborted');
      }
      const { name } = dirent;
      const filePath = join(rootPath, name);
      const fileStat = await stat(filePath);

      if (dirent.isDirectory()) {
        if (depth < this.maxDepth) {
          await this.scanDirectory(filePath, depth + 1, signal);
        }
      } else {
        const fileInfo: FileInfo = {
          path: resolve(filePath),
          relativePath: filePath,
          filename: name,
          extension: extname(name),
          size: fileStat.size,
          creationDate: fileStat.birthtime,
          modificationDate: fileStat.mtime,
          stat: fileStat,
        };
        const event = this.shouldInclude(fileInfo) ? 'file' : 'excluded-file';
        this.emit(event, fileInfo);
      }
    }
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
