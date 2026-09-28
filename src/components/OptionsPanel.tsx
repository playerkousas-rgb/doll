import type { ReactNode } from 'react'
import type { Design, Option } from '../types'
import Character from '../character/Character'
import { BODIES, EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS } from '../data/options'

interface Props {
  design: Design
  onChange: (key: keyof Design, value: string) => void
}

/** 頭部特寫縮圖的 viewBox（光頭＋耳朵都在範圍內） */
const HEAD_VIEW = '76 -2 208 212'

/** 髮型縮圖的 viewBox（要涵蓋雙馬尾、長髮外緣） */
const HAIR_VIEW = '48 -4 264 262'

/** 部位縮圖：把目前設計換上指定選項後畫出來 */
function Thumb({
  design,
  override,
  viewBox,
}: {
  design: Design
  override: Partial<Design>
  viewBox?: string
}) {
  return (
    <div className="thumb">
      <Character design={{ ...design, ...override }} viewBox={viewBox} />
    </div>
  )
}

/** 顏色圓點 */
function Swatch({ option, active, onPick }: { option: Option; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      className={`swatch ${active ? 'is-active' : ''}`}
      onClick={onPick}
      title={option.label}
      aria-pressed={active}
    >
      <span className="swatch-dot" style={{ background: option.color }} />
      <span className="swatch-label">{option.label}</span>
    </button>
  )
}

/** 有縮圖的選項 */
function Tile({
  design,
  optionId,
  label,
  keyName,
  active,
  onPick,
  viewBox,
  extra,
}: {
  design: Design
  optionId: string
  label: string
  keyName: keyof Design
  active: boolean
  onPick: () => void
  viewBox?: string
  extra?: Partial<Design>
}) {
  return (
    <button type="button" className={`tile ${active ? 'is-active' : ''}`} onClick={onPick} aria-pressed={active}>
      <Thumb design={design} override={{ [keyName]: optionId, ...extra } as Partial<Design>} viewBox={viewBox} />
      <span className="tile-label">{label}</span>
    </button>
  )
}

/** 左側：部位選項面板 */
export default function OptionsPanel({ design, onChange }: Props) {
  const section = (title: string, content: ReactNode) => (
    <section className="section" key={title}>
      <h2 className="section-title">{title}</h2>
      {content}
    </section>
  )

  const swatches = (list: Option[], k: keyof Design) => (
    <div className="swatch-grid">
      {list.map((o) => (
        <Swatch key={o.id} option={o} active={design[k] === o.id} onPick={() => onChange(k, o.id)} />
      ))}
    </div>
  )

  const tiles = (list: Option[], k: keyof Design, viewBox?: string, extra?: Partial<Design>) => (
    <div className={`tile-grid ${list.length % 3 === 1 ? 'tile-grid--wide' : ''}`}>
      {list.map((o) => (
        <Tile
          key={o.id}
          design={design}
          optionId={o.id}
          label={o.label}
          keyName={k}
          active={design[k] === o.id}
          onPick={() => onChange(k, o.id)}
          viewBox={viewBox}
          extra={extra}
        />
      ))}
    </div>
  )

  // 臉型、表情的縮圖用光頭，才看得清楚差異
  const bald: Partial<Design> = { hair: 'bald' }

  return (
    <div className="options-panel">
      {section('臉型', tiles(FACES, 'face', HEAD_VIEW, bald))}
      {section('膚色', swatches(SKINS, 'skin'))}
      {section('髮型', tiles(HAIRS, 'hair', HAIR_VIEW))}
      {section('髮色', swatches(HAIR_COLORS, 'hairColor'))}
      {section('表情', tiles(EXPRS, 'eyes', HEAD_VIEW, bald))}
      {section('體型', tiles(BODIES, 'body'))}
    </div>
  )
}
