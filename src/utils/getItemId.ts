import { AbiItem } from 'types'

export function getItemId(item: AbiItem): string {
  const inputs = ('inputs' in item && item.inputs?.map(input => input.type).join(',')) || ''
  return `${item.type}-${'name' in item && item.name}(${inputs})`
}
