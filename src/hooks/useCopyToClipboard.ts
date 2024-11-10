import { useCallback, useState } from 'react'

export function useCopyToClipboard() {
  const [copyState, setCopyState] = useState(false)

  const copyToClipboard = useCallback(async (previewContent: string) => {
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopyState(true)
      setTimeout(() => {
        setCopyState(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  return { copyState, copyToClipboard }
}
