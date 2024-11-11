import { useState, useCallback, useMemo } from 'react'
import type { Abi } from 'abitype'
import { CircleHelp } from 'lucide-react'
import { useDownloadAbi } from 'hooks/useDownloadAbi'
import { FormatType, type FormatOptions, type ItemFilters } from 'types'
import { getItemId } from 'utils/getItemId'
import { trimAbiItems } from 'utils/trimAbiItems'
import { Button } from '../Button'
import { FormatPreview } from '../FormatPreview'
import { ItemDetails } from '../ItemDetails'
import { SelectedItemStats } from '../SelectedItemStats'
import styles from './index.module.css'

export function AbiTrimmer() {
  const downloadAbi = useDownloadAbi()
  const [abiInput, setAbiInput] = useState<string>('')
  const [parsedAbi, setParsedAbi] = useState<Abi>([])
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
      setParsedAbi(abi)
      setSelectedItems(new Set(abi.map(item => getItemId(item))))
      setError('')
    } catch (err: unknown) {
      console.log(err)
      setError('Invalid ABI format. Please check your input.')
      setParsedAbi([])
    }
  }, [abiInput])

  const filteredItems = useMemo(() => {
    return parsedAbi.filter(item => {
      const matchesType = !filters.type || item.type === filters.type
      const matchesSearch =
        !filters.searchTerm ||
        ('name' in item && item.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
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

  return (
    <div className={styles.container}>
      <h1>ABI Trimmer</h1>

      <div>
        <h2>Instructions</h2>
        <ol>
          <li>Paste a JSON-style ABI into the input box.</li>
          <li>Select the items that you want in the final ABI.</li>
          <li>Choose output options and copy or download the final ABI.</li>
        </ol>
      </div>

      <div className={styles.inputSection}>
        <h2>Input ABI</h2>
        <textarea
          className={styles.textarea}
          value={abiInput}
          onChange={e => setAbiInput(e.target.value)}
          placeholder="Paste your ABI here..."
          spellCheck={false}
        />
        <div className={styles.buttonGroup}>
          <Button text="Parse ABI" onClick={parseAbiInput} />
          <Button text="Reset" onClick={resetState} type="reset" />
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
            <Button text="Select All" onClick={selectAll} type="secondary" />
            <Button text="Deselect All" onClick={deselectAll} type="secondary" />
            <Button
              className={styles.tooltipButton}
              text="Trim Functions"
              onClick={() => setSelectedItems(new Set(trimAbiItems(selectedAbi).map(item => getItemId(item))))}
              type="secondary"
            >
              <span
                className={styles.tooltip}
                data-tooltip="Removes admin, role, ownership, and other uncommonly used functions & events"
              >
                <CircleHelp size={16} />
              </span>
            </Button>
          </div>

          <div className={styles.itemList}>
            <SelectedItemStats selectedAbi={selectedAbi} />
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
            <SelectedItemStats selectedAbi={selectedAbi} />
          </div>

          <h2>Output ABI</h2>
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

          <div className={styles.previewSection}>
            <FormatPreview selectedAbi={selectedAbi} type={FormatType.JSON} formatOptions={formatOptions} />
            <FormatPreview selectedAbi={selectedAbi} type={FormatType.HUMAN} formatOptions={formatOptions} />
          </div>

          <div className={styles.buttonGroup}>
            <Button text="Download JSON ABI" onClick={() => downloadAbi(selectedAbi, FormatType.JSON)} />
            <Button text="Download Human Readable ABI" onClick={() => downloadAbi(selectedAbi, FormatType.HUMAN)} />
          </div>
        </>
      )}
    </div>
  )
}
