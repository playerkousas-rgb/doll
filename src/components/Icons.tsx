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

/** 圖示路徑庫 */
export const P = {
  /** 選擇（滑鼠指標） */
  cursor: 'M5 3l14 7.5-6.2 1.9L10.6 20 5 3z',
  /** 平移（四向箭頭） */
  move: 'M12 3v18M3 12h18M12 3l-2.6 2.6M12 3l2.6 2.6M12 21l-2.6-2.6M12 21l2.6-2.6M3 12l2.6-2.6M3 12l2.6 2.6M21 12l-2.6-2.6M21 12l-2.6 2.6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  play: 'M8 5.5v13l11-6.5z',
  undo: 'M9 7L4.5 11.5 9 16M4.5 11.5H14a5.5 5.5 0 015.5 5.5V19',
  redo: 'M15 7l4.5 4.5L15 16M19.5 11.5H10A5.5 5.5 0 004.5 17V19',
  fit: 'M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4',
  eye: 'M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  eyeOff: 'M4 4l16 16M9.9 5.9A9.6 9.6 0 0112 5.5c6 0 9.5 5.5 9.5 5.5a17 17 0 01-3.2 3.7M6.1 8A17 17 0 002.5 11s3.5 5.5 9.5 5.5c1.2 0 2.3-.2 3.3-.6M10 9.9a2.5 2.5 0 003.5 3.5',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
  lockOpen: 'M7 11V8a5 5 0 019.6-2M6 11h12v9H6z',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 10.5v6M14 10.5v6',
  up: 'M12 19V5M12 5l-6 6M12 5l6 6',
  down: 'M12 5v14M12 19l-6-6M12 19l6-6',
  layers: 'M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5',
  palette: 'M12 3a9 9 0 100 18c1.4 0 2-1 1.5-2s0-2 1.5-2H18a3 3 0 003-3c0-5.5-4-11-9-11zM7.5 10.5h.01M10 7h.01M14 7h.01M16.5 10.5h.01',
  text: 'M5 6.5V4h14v2.5M12 4v16M9 20h6',
  share: 'M18 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18 23a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1',
  download: 'M12 4v10M8 10.5l4 4 4-4M5 19.5h14',
  random: 'M4 6.5h3.5L17 17.5h3M4 17.5h3.5L17 6.5h3M17.5 4l2.5 2.5-2.5 2.5M17.5 15l2.5 2.5-2.5 2.5',
  reset: 'M20 12a8 8 0 11-2.4-5.7M20 4v4.5h-4.5',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 6a5 5 0 100 10 5 5 0 000-10zM14.8 14.8L21 21',
  tent: 'M12 4.5L3.5 20h17L12 4.5zM12 4.5V20M8 20l4-7.5 4 7.5',
  spark: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z',
  sliders: 'M4 7.5h9M18.5 7.5H20M4 16.5h3.5M13 16.5H20M14.5 7.5a2 2 0 10-4 0 2 2 0 004 0zM11 16.5a2 2 0 104 0 2 2 0 00-4 0z',
  person: 'M12 5.5a3 3 0 110 6 3 3 0 010-6zM5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5',
  shirt: 'M8 4l-5 3 2 3.5 2-1V20h10V9.5l2 1L21 7l-5-3a4 4 0 01-8 0z',
  badge: 'M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8L12 3z',
  pose: 'M12 4a2.2 2.2 0 110 4.4A2.2 2.2 0 0112 4zM12 8.5v6M12 14.5l-3 5.5M12 14.5l3 5.5M8 11h8',
  copy: 'M9 9h11v11H9zM5 15V4h11',
  note: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
} as const
