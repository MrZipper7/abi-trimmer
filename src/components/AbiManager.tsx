import { useState, useCallback, useMemo } from 'react'
import { type Abi, formatAbi } from 'abitype'
import type { AbiItem, ItemFilters } from '../types'
import styles from './AbiManager.module.css'

export default function AbiManager() {
  const [abiInput, setAbiInput] = useState<string>('')
  const [parsedAbi, setParsedAbi] = useState<AbiItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>('')
  const [filters, setFilters] = useState<ItemFilters>({
    type: '',
    searchTerm: ''
  })

  const resetState = useCallback(() => {
    setAbiInput('')
    setParsedAbi([])
    setSelectedItems(new Set())
    setError('')
    setFilters({ type: '', searchTerm: '' })
  }, [])

  const parseAbiInput = useCallback(() => {
    try {
      const abi = JSON.parse(abiInput) as Abi
      const filteredAbi = abi.filter(i => 
        i.type !== 'constructor' && 
        i.type !== 'fallback' && 
        i.type !== 'receive'
      )
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
      const matchesSearch = !filters.searchTerm || 
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

  // const selectAllByType = useCallback((type: string) => {
  //   const itemsToSelect = parsedAbi
  //     .filter(item => item.type === type)
  //     .map(item => getItemId(item))
    
  //   setSelectedItems(prev => {
  //     const newSet = new Set(prev)
  //     itemsToSelect.forEach(id => newSet.add(id))
  //     return newSet
  //   })
  // }, [parsedAbi])

  // const deselectAllByType = useCallback((type: string) => {
  //   setSelectedItems(prev => {
  //     const newSet = new Set(prev)
  //     parsedAbi
  //       .filter(item => item.type === type)
  //       .forEach(item => newSet.delete(getItemId(item)))
  //     return newSet
  //   })
  // }, [parsedAbi])

  const getSelectedAbi = useCallback(() => {
    return parsedAbi.filter(item => selectedItems.has(getItemId(item)))
  }, [parsedAbi, selectedItems])

  const getFilteredAbiPreview = useCallback(() => {
    const selectedAbi = getSelectedAbi()
    return {
      json: JSON.stringify(selectedAbi, null, 2),
      human: JSON.stringify(formatAbi(selectedAbi), null, 2)
    }
  }, [getSelectedAbi])

  const downloadAbi = useCallback((format: 'json' | 'human') => {
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
  }, [getSelectedAbi])

  const renderItemDetails = (item: AbiItem) => {
    const getTypeTag = () => {
      const typeClasses = `${styles.typeTag} ${styles[item.type]}`
      return <span className={typeClasses}>{item.type.toUpperCase()}</span>
    }

    const renderInputs = () => (
      <div className={styles.itemParams}>
        Inputs: {item.inputs?.length ? item.inputs.map(input => 
          `${input.name || ''}: ${input.type}`
        ).join(', ') : 'none'}
      </div>
    )

    const renderOutputs = () => {
      if (item.type === 'event' || item.type === 'error') return null
      return (
        <div className={styles.itemParams}>
          Outputs: {item.outputs?.length ? item.outputs.map(output => 
            `${output.name || ''}: ${output.type}`
          ).join(', ') : 'none'}
        </div>
      )
    }

    const renderStateMutability = () => {
      if ('stateMutability' in item && item.stateMutability) {
        return (
          <span className={styles.mutability}>
            [{item.stateMutability}]
          </span>
        )
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
          <button 
            className={`${styles.button} ${styles.resetButton}`} 
            onClick={resetState}
          >
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
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={deselectAll}
            >
              Deselect All
            </button>
            {/* <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => selectAllByType('function')}
            >
              Select All Functions
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => deselectAllByType('function')}
            >
              Deselect Functions
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => selectAllByType('event')}
            >
              Select All Events
            </button>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => deselectAllByType('event')}
            >
              Deselect Events
            </button> */}
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

          <div className={styles.previewSection}>
            <div className={styles.previewBox}>
              <div className={styles.previewLabel}>JSON ABI</div>
              <pre>{getFilteredAbiPreview().json}</pre>
            </div>
            <div className={styles.previewBox}>
              <div className={styles.previewLabel}>Human Readable ABI</div>
              <pre>{getFilteredAbiPreview().human}</pre>
            </div>
          </div>

          <div>
            <button
              className={styles.button}
              onClick={() => downloadAbi('json')}
            >
              Download JSON ABI
            </button>
            <button
              className={styles.button}
              onClick={() => downloadAbi('human')}
            >
              Download Human Readable ABI
            </button>
          </div>
        </>
      )}
    </div>
  )
}