import { useCallback, useState } from 'react'
import { formatAbi } from 'abitype'
import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { type AbiItem, type FormatOptions, FormatType } from '../../types'
import styles from './index.module.css'

interface FormatPreviewProps {
  selectedAbi: AbiItem[]
  type: FormatType
  formatOptions: FormatOptions
}

export function FormatPreview({ selectedAbi, type, formatOptions }: FormatPreviewProps) {
  const [copyState, setCopyState] = useState(false)

  const getPreviewContent = useCallback(
    (format: FormatType) => {
      const content =
        format === FormatType.JSON
          ? JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
          : JSON.stringify(formatAbi(selectedAbi), null, formatOptions.minified ? 0 : formatOptions.indentation)

      return formatOptions.minified ? content : syntaxHighlight(content)
    },
    [selectedAbi, formatOptions]
  )

  const getStats = useCallback(() => {
    const jsonContent = JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
    const humanContent = JSON.stringify(
      formatAbi(selectedAbi),
      null,
      formatOptions.minified ? 0 : formatOptions.indentation
    )

    return {
      selectedCount: {
        functions: selectedAbi.filter(item => item.type === 'function').length,
        events: selectedAbi.filter(item => item.type === 'event').length,
      },
      size: {
        json: (new Blob([jsonContent]).size / 1024).toFixed(2),
        human: (new Blob([humanContent]).size / 1024).toFixed(2),
      },
      chars: {
        json: jsonContent.length,
        human: humanContent.length,
      },
    }
  }, [formatOptions.indentation, formatOptions.minified, selectedAbi])

  const copyToClipboard = useCallback(
    async (format: FormatType) => {
      const content =
        format === FormatType.JSON
          ? JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
          : JSON.stringify(formatAbi(selectedAbi), null, formatOptions.minified ? 0 : formatOptions.indentation)

      try {
        await navigator.clipboard.writeText(content)
        setCopyState(true)
        setTimeout(() => {
          setCopyState(false)
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    },
    [selectedAbi, formatOptions]
  )

  const syntaxHighlight = (json: string) => {
    const highlighted = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
      match => {
        let cls = 'number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key'
          } else {
            cls = 'string'
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean'
        } else if (/null/.test(match)) {
          cls = 'null'
        }
        return `<span class="${styles[cls]}">${match}</span>`
      }
    )
    return highlighted
  }

  const stats = getStats()

  return (
    <div className={styles.previewBox}>
      <div className={styles.previewControls}>
        <div className={styles.previewLabel}>{type === FormatType.JSON ? 'JSON' : 'Human Readable'} ABI</div>
        <button
          className={clsx(styles.copyButton, styles.tooltip)}
          onClick={() => copyToClipboard(type)}
          data-tooltip="Copy to clipboard"
        >
          {copyState ? <Check size={14} /> : <Copy size={14} />}
          {copyState ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className={styles.previewStats}>
        Selected: {stats.selectedCount.functions} functions, {stats.selectedCount.events} events
        <br />
        Size: {stats.size[type]}KB • Characters: {stats.chars[type]}
      </div>
      <pre
        style={{
          whiteSpace: formatOptions.wordWrap ? 'pre-wrap' : 'pre',
        }}
        dangerouslySetInnerHTML={{ __html: getPreviewContent(type) }}
      />
    </div>
  )
}
