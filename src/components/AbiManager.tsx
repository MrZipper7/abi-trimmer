import { useState, useCallback, useMemo } from 'react'
import type { Abi } from 'abitype'
import clsx from 'clsx'
import { useDownloadAbi } from '../hooks/useDownloadAbi'
import { FormatType, type AbiItem, type FormatOptions, type ItemFilters } from '../types'
import { FormatPreview } from './FormatPreview'
import { ItemDetails } from './ItemDetails'
import styles from './AbiManager.module.css'

export default function AbiManager() {
  const downloadAbi = useDownloadAbi()
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

  const selectedAbi = useMemo(() => {
    return parsedAbi.filter(item => selectedItems.has(getItemId(item)))
  }, [parsedAbi, selectedItems])

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
          <button className={clsx(styles.button, styles.resetButton)} onClick={resetState}>
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
            <button className={clsx(styles.button, styles.secondaryButton)} onClick={selectAll}>
              Select All
            </button>
            <button className={clsx(styles.button, styles.secondaryButton)} onClick={deselectAll}>
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
                <ItemDetails item={item} />
              </div>
            ))}
          </div>
          {renderFormatControls()}
          <div className={styles.previewSection}>
            <FormatPreview selectedAbi={selectedAbi} type={FormatType.JSON} formatOptions={formatOptions} />
            <FormatPreview selectedAbi={selectedAbi} type={FormatType.HUMAN} formatOptions={formatOptions} />
          </div>
          <div>
            <button className={styles.button} onClick={() => downloadAbi(selectedAbi, FormatType.JSON)}>
              Download JSON ABI
            </button>
            <button className={styles.button} onClick={() => downloadAbi(selectedAbi, FormatType.HUMAN)}>
              Download Human Readable ABI
            </button>
          </div>
        </>
      )}
    </div>
  )
}
