import { useMemo } from 'react'
import { type Abi, formatAbi } from 'abitype'
import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { type FormatOptions, FormatType } from '../../types'
import { highlightSyntax } from '../../utils/highlightSyntax'
import styles from './index.module.css'

interface FormatPreviewProps {
  selectedAbi: Abi
  type: FormatType
  formatOptions: FormatOptions
}

export function FormatPreview({ selectedAbi, type, formatOptions }: FormatPreviewProps) {
  const { copyState, copyToClipboard } = useCopyToClipboard()

  const { previewContent, formattedPreviewContent } = useMemo(() => {
    const content =
      type === FormatType.JSON
        ? JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
        : JSON.stringify(formatAbi(selectedAbi), null, formatOptions.minified ? 0 : formatOptions.indentation)

    return {
      previewContent: content,
      formattedPreviewContent: formatOptions.minified ? content : highlightSyntax(content, styles),
    }
  }, [selectedAbi, type, formatOptions])

  return (
    <div className={styles.previewBox}>
      <div className={styles.previewControls}>
        <div>
          <div className={styles.previewLabel}>{type === FormatType.JSON ? 'JSON' : 'Human Readable'} ABI</div>
          <div className={styles.previewStats}>
            Size: {(new Blob([previewContent]).size / 1024).toFixed(2)}KB • Characters: {previewContent.length}
          </div>
        </div>
        <button
          className={clsx(styles.copyButton, styles.tooltip)}
          onClick={() => copyToClipboard(previewContent)}
          data-tooltip="Copy to clipboard"
        >
          {copyState ? <Check size={14} /> : <Copy size={14} />}
          {copyState ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          whiteSpace: formatOptions.wordWrap ? 'pre-wrap' : 'pre',
        }}
        dangerouslySetInnerHTML={{ __html: formattedPreviewContent }}
      />
    </div>
  )
}
