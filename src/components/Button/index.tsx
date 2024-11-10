import clsx from 'clsx'
import styles from './index.module.css'

interface ButtonProps {
  className?: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
  text: string
  type?: 'secondary' | 'reset'
}

export function Button({ className, onClick, text, type }: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, className, {
        [styles.resetButton]: type === 'reset',
        [styles.secondaryButton]: type === 'secondary',
      })}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
