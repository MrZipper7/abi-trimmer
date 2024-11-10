import { useMemo } from 'react'
import { Abi } from 'abitype'

interface SelectedItemStatsProps {
  selectedAbi: Abi
}

export function SelectedItemStats({ selectedAbi }: SelectedItemStatsProps) {
  const stats = useMemo(() => {
    const typeCounts = selectedAbi.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [selectedAbi])

  return (
    <div>
      Selected:{' '}
      {selectedAbi.length > 0 ? (
        stats.map(({ type, count }, index) => (
          <span key={type}>
            {count} {type}
            {count > 1 && 's'}
            {index < stats.length - 1 && ', '}
          </span>
        ))
      ) : (
        <>No selected ABI items</>
      )}
    </div>
  )
}
