/** 輕量 SVG 圖示（單色 stroke，跟著 currentColor） */

interface Props {
  d: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ d, size = 20, strokeWidth = 1.8, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
