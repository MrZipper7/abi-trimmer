import type { Abi } from 'abitype'
import { unusedEvents, unusedFunctions } from 'constants'

export function trimAbiItems(abi: Abi): Abi {
  return abi.filter(item => {
    switch (item.type) {
      case 'constructor':
      case 'fallback':
      case 'receive':
        return false

      case 'event':
        if (unusedEvents.includes(item.name)) {
          return false
        }
        return true

      case 'error':
      case 'function':
        if (unusedFunctions.includes(item.name) || item.name.endsWith('_ROLE')) {
          return false
        }
        return true

      default:
        return false
    }
  })
}
