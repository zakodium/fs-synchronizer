import { Stats } from 'fs';

import { IMinimatch } from 'minimatch';

type PatternType = 'include' | 'exclude';

export interface Pattern {
  type: PatternType;
  pattern: string;
}

export interface ProcessedPattern {
  type: PatternType;
  pattern: IMinimatch;
}

export interface SyncOptions {
  root: string;
  maxDepth?: number;
  patterns?: Pattern[];
}

export interface FileInfo {
  path: string;
  relativePath: string;
  filename: string;
  extension: string;
  size: number;
  creationDate: Date;
  modificationDate: Date;
  stat: Stats;
}

export interface WalkOptions {
  signal: AbortSignal;
}

export type WalkCallback = (file: FileInfo) => void;
