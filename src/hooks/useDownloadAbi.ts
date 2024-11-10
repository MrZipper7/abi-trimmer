import { useCallback } from 'react'
import { type Abi, formatAbi } from 'abitype'
import { FormatType } from '../types'

export function useDownloadAbi() {
  return useCallback((selectedAbi: Abi, format: FormatType) => {
    let content: string

    if (format === FormatType.JSON) {
      content = JSON.stringify(selectedAbi, null, 2)
    } else {
      content = JSON.stringify(formatAbi(selectedAbi), null, 2)
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-abi.${format === FormatType.JSON ? 'json' : 'txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])
}
