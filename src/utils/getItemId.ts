import { AbiItem } from '../types'

export function getItemId(item: AbiItem): string {
  const inputs = item.inputs?.map(input => input.type).join(',') || ''
  return `${item.type}-${item.name}(${inputs})`
}
