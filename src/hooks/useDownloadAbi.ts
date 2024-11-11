import { useCallback } from 'react'
import { type Abi, formatAbi } from 'abitype'
import { FormatOptions, FormatType } from 'types'

export function useDownloadAbi() {
  return useCallback((selectedAbi: Abi, format: FormatType, formatOptions: FormatOptions) => {
    const content =
      format === FormatType.JSON
        ? JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
        : JSON.stringify(formatAbi(selectedAbi), null, formatOptions.minified ? 0 : formatOptions.indentation)

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trimmedAbi.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])
}
