import type { AbiError, AbiEvent, AbiFunction } from 'abitype'

export type AbiItem = AbiError | AbiEvent | AbiFunction

export interface ItemFilters {
  type?: string
  searchTerm?: string
}

export interface FormatOptions {
  indentation: number
  minified: boolean
  wordWrap: boolean
}

export enum FormatType {
  JSON = 'json',
  HUMAN = 'human'
}
