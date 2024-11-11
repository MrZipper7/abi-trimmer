import clsx from 'clsx'
import { AbiItem } from 'types'
import styles from './index.module.css'

interface ItemDetailsProps {
  item: AbiItem
}

export function ItemDetails({ item }: ItemDetailsProps) {
  return (
    <div className={styles.itemDetails}>
      <div className={styles.itemHeader}>
        <span className={clsx(styles.typeTag, styles[item.type])}>{item.type.toUpperCase()}</span>
        <strong>{item.name}</strong>
        {'stateMutability' in item && item.stateMutability && (
          <span className={styles.mutability}>[{item.stateMutability}]</span>
        )}
      </div>
      <div className={styles.itemParams}>
        <span className={styles.label}>Inputs:</span>{' '}
        {item.inputs?.length ? item.inputs.map(input => `${input.name || ''}: ${input.type}`).join(', ') : 'none'}
      </div>
      {item.type !== 'event' && item.type !== 'error' && (
        <div className={styles.itemParams}>
          <span className={styles.label}>Outputs:</span>{' '}
          {item.outputs?.length
            ? item.outputs.map(output => `${output.name || ''}: ${output.type}`).join(', ')
            : 'none'}
        </div>
      )}
    </div>
  )
}
