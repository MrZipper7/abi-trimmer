import type { AbiConstructor, AbiError, AbiEvent, AbiFallback, AbiFunction, AbiReceive } from 'abitype'

export type AbiItem = AbiConstructor | AbiError | AbiEvent | AbiFallback | AbiFunction | AbiReceive

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
  HUMAN = 'human',
}
