import type { AbiError, AbiEvent, AbiFunction } from "abitype";

export type AbiItem = AbiError | AbiEvent | AbiFunction;

export interface ItemFilters {
  type?: string;
  searchTerm?: string;
}
