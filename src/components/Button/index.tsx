import type { ReactElement } from 'react'
import clsx from 'clsx'
import styles from './index.module.css'

interface ButtonProps {
  children?: ReactElement
  className?: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
  text: string
  type?: 'secondary' | 'reset'
}

export function Button({ children, className, onClick, text, type }: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, className, {
        [styles.resetButton]: type === 'reset',
        [styles.secondaryButton]: type === 'secondary',
      })}
      onClick={onClick}
    >
      {text}
      {children}
    </button>
  )
}
