import { useState, useCallback, useMemo } from 'react'
import { type Abi, formatAbi } from 'abitype'
import { Copy, Check } from 'lucide-react'
import type { AbiItem, ItemFilters } from '../types'
import styles from './AbiManager.module.css'

interface FormatOptions {
  indentation: number
  minified: boolean
  wordWrap: boolean
}

interface PreviewCopyState {
  json: boolean
  human: boolean
}

export default function AbiManager() {
  const [abiInput, setAbiInput] = useState<string>('')
  const [parsedAbi, setParsedAbi] = useState<AbiItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>('')
  const [filters, setFilters] = useState<ItemFilters>({
    type: '',
    searchTerm: '',
  })
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    indentation: 2,
    minified: false,
    wordWrap: true,
  })
  const [copyState, setCopyState] = useState<PreviewCopyState>({
    json: false,
    human: false,
  })

  const resetState = useCallback(() => {
    setAbiInput('')
    setParsedAbi([])
    setSelectedItems(new Set())
    setError('')
    setFilters({ type: '', searchTerm: '' })
    setFormatOptions({
      indentation: 2,
      minified: false,
      wordWrap: true,
    })
    setCopyState({
      json: false,
      human: false,
    })
  }, [])

  const parseAbiInput = useCallback(() => {
    try {
      const abi = JSON.parse(abiInput) as Abi
      const filteredAbi = abi.filter(i => i.type !== 'constructor' && i.type !== 'fallback' && i.type !== 'receive')
      setParsedAbi(filteredAbi)
      setSelectedItems(new Set(filteredAbi.map(item => getItemId(item))))
      setError('')
    } catch (err: unknown) {
      console.log(err)
      setError('Invalid ABI format. Please check your input.')
      setParsedAbi([])
    }
  }, [abiInput])

  const getItemId = (item: AbiItem): string => {
    const inputs = item.inputs?.map(input => input.type).join(',') || ''
    return `${item.type}-${item.name}(${inputs})`
  }

  const filteredItems = useMemo(() => {
    return parsedAbi.filter(item => {
      const matchesType = !filters.type || item.type === filters.type
      const matchesSearch =
        !filters.searchTerm ||
        item.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        getItemId(item).toLowerCase().includes(filters.searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [parsedAbi, filters])

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(parsedAbi.map(item => getItemId(item))))
  }, [parsedAbi])

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const getSelectedAbi = useCallback(() => {
    return parsedAbi.filter(item => selectedItems.has(getItemId(item)))
  }, [parsedAbi, selectedItems])

  const renderPreviewSection = () => {
    const stats = getStats()

    return (
      <div className={styles.previewSection}>
        <div className={styles.previewBox}>
          <div className={styles.previewControls}>
            <div className={styles.previewLabel}>JSON ABI Preview</div>
            <button
              className={`${styles.copyButton} ${styles.tooltip}`}
              onClick={() => copyToClipboard('json')}
              data-tooltip="Copy to clipboard"
            >
              {copyState.json ? <Check size={14} /> : <Copy size={14} />}
              {copyState.json ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className={styles.previewStats}>
            Selected: {stats.selectedCount.functions} functions, {stats.selectedCount.events} events
            <br />
            Size: {stats.size.json}KB • Characters: {stats.chars.json}
          </div>
          <pre
            style={{
              whiteSpace: formatOptions.wordWrap ? 'pre-wrap' : 'pre',
            }}
            dangerouslySetInnerHTML={{ __html: getPreviewContent('json') }}
          />
        </div>
        <div className={styles.previewBox}>
          <div className={styles.previewControls}>
            <div className={styles.previewLabel}>Human Readable ABI Preview</div>
            <button
              className={`${styles.copyButton} ${styles.tooltip}`}
              onClick={() => copyToClipboard('human')}
              data-tooltip="Copy to clipboard"
            >
              {copyState.human ? <Check size={14} /> : <Copy size={14} />}
              {copyState.human ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className={styles.previewStats}>
            Selected: {stats.selectedCount.functions} functions, {stats.selectedCount.events} events
            <br />
            Size: {stats.size.human}KB • Characters: {stats.chars.human}
          </div>
          <pre
            style={{
              whiteSpace: formatOptions.wordWrap ? 'pre-wrap' : 'pre',
            }}
            dangerouslySetInnerHTML={{ __html: getPreviewContent('human') }}
          />
        </div>
      </div>
    )
  }

  const renderFormatControls = () => (
    <div className={styles.formatControls}>
      <select
        className={styles.selectSmall}
        value={formatOptions.indentation}
        onChange={e =>
          setFormatOptions(prev => ({
            ...prev,
            indentation: Number(e.target.value),
          }))
        }
      >
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={formatOptions.minified}
          onChange={e =>
            setFormatOptions(prev => ({
              ...prev,
              minified: e.target.checked,
            }))
          }
        />
        Minify
      </label>
      <label>
        <input
          type="checkbox"
          checked={formatOptions.wordWrap}
          onChange={e =>
            setFormatOptions(prev => ({
              ...prev,
              wordWrap: e.target.checked,
            }))
          }
        />
        Wrap Lines
      </label>
    </div>
  )

  const downloadAbi = useCallback(
    (format: 'json' | 'human') => {
      const selectedAbi = getSelectedAbi()
      let content: string

      if (format === 'json') {
        content = JSON.stringify(selectedAbi, null, 2)
      } else {
        content = JSON.stringify(formatAbi(selectedAbi), null, 2)
      }

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selected-abi.${format === 'json' ? 'json' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [getSelectedAbi]
  )

  const renderItemDetails = (item: AbiItem) => {
    const getTypeTag = () => {
      const typeClasses = `${styles.typeTag} ${styles[item.type]}`
      return <span className={typeClasses}>{item.type.toUpperCase()}</span>
    }

    const renderInputs = () => (
      <div className={styles.itemParams}>
        Inputs:{' '}
        {item.inputs?.length ? item.inputs.map(input => `${input.name || ''}: ${input.type}`).join(', ') : 'none'}
      </div>
    )

    const renderOutputs = () => {
      if (item.type === 'event' || item.type === 'error') return null
      return (
        <div className={styles.itemParams}>
          Outputs:{' '}
          {item.outputs?.length
            ? item.outputs.map(output => `${output.name || ''}: ${output.type}`).join(', ')
            : 'none'}
        </div>
      )
    }

    const renderStateMutability = () => {
      if ('stateMutability' in item && item.stateMutability) {
        return <span className={styles.mutability}>[{item.stateMutability}]</span>
      }
      return null
    }

    return (
      <div className={styles.itemDetails}>
        <div className={styles.itemHeader}>
          {getTypeTag()}
          <strong>{item.name}</strong>
          {renderStateMutability()}
        </div>
        {renderInputs()}
        {renderOutputs()}
      </div>
    )
  }

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

  const getPreviewContent = useCallback(
    (format: 'json' | 'human') => {
      const selectedAbi = getSelectedAbi()
      const content =
        format === 'json'
          ? JSON.stringify(selectedAbi, null, formatOptions.minified ? 0 : formatOptions.indentation)
          : JSON.stringify(formatAbi(selectedAbi), null, formatOptions.minified ? 0 : formatOptions.indentation)

      return formatOptions.minified ? content : syntaxHighlight(content)
    },
    [getSelectedAbi, formatOptions]
  )

  const getStats = useCallback(() => {
    const selectedAbi = getSelectedAbi()
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
  }, [formatOptions.indentation, formatOptions.minified, getSelectedAbi])

  const copyToClipboard = useCallback(
    async (format: 'json' | 'human') => {
      const content =
        format === 'json'
          ? JSON.stringify(getSelectedAbi(), null, formatOptions.minified ? 0 : formatOptions.indentation)
          : JSON.stringify(formatAbi(getSelectedAbi()), null, formatOptions.minified ? 0 : formatOptions.indentation)

      try {
        await navigator.clipboard.writeText(content)
        setCopyState(prev => ({ ...prev, [format]: true }))
        setTimeout(() => {
          setCopyState(prev => ({ ...prev, [format]: false }))
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    },
    [getSelectedAbi, formatOptions]
  )

  return (
    <div className={styles.container}>
      <h1>ABI Manager</h1>

      <div className={styles.inputSection}>
        <h2>Input ABI</h2>
        <textarea
          className={styles.textarea}
          value={abiInput}
          onChange={e => setAbiInput(e.target.value)}
          placeholder="Paste your ABI here..."
        />
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={parseAbiInput}>
            Parse ABI
          </button>
          <button className={`${styles.button} ${styles.resetButton}`} onClick={resetState}>
            Reset
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {parsedAbi.length > 0 && (
        <>
          <div className={styles.filterSection}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={filters.searchTerm}
              onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
            <button className={`${styles.button} ${styles.secondaryButton}`} onClick={selectAll}>
              Select All
            </button>
            <button className={`${styles.button} ${styles.secondaryButton}`} onClick={deselectAll}>
              Deselect All
            </button>
          </div>

          <div className={styles.itemList}>
            {filteredItems.map(item => (
              <div key={getItemId(item)} className={styles.itemRow}>
                <input
                  type="checkbox"
                  checked={selectedItems.has(getItemId(item))}
                  onChange={() => toggleItem(getItemId(item))}
                />
                {renderItemDetails(item)}
              </div>
            ))}
          </div>
          {renderFormatControls()}
          {renderPreviewSection()}
          <div>
            <button className={styles.button} onClick={() => downloadAbi('json')}>
              Download JSON ABI
            </button>
            <button className={styles.button} onClick={() => downloadAbi('human')}>
              Download Human Readable ABI
            </button>
          </div>
        </>
      )}
    </div>
  )
}
