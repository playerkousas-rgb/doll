import { BG_PRESETS } from '../lib/canvas'
import { Icon, P } from './Icons'

interface Props {
  bg: string
  onBg: (id: string) => void
}

/** 左側：畫布背景（裝飾零件之後才登場） */
export default function BgPanel({ bg, onBg }: Props) {
  return (
    <div className="bg-panel">
      <div className="panel-head">
        <h2>背景</h2>
      </div>

      <section className="parts-group">
        <h3 className="parts-group-title">
          <Icon d={P.palette} size={15} />
          畫布底色
        </h3>
        <div className="bg-grid">
          {BG_PRESETS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`bg-swatch ${bg === b.id ? 'is-active' : ''}`}
              onClick={() => onBg(b.id)}
              aria-pressed={bg === b.id}
            >
              <span className="bg-dot" style={{ background: b.color }} />
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="parts-group">
        <h3 className="parts-group-title">
          <Icon d={P.tent} size={15} />
          裝飾
          <span className="parts-group-hint is-soon">之後登場</span>
        </h3>
        <div className="parts-grid">
          {['帳篷', '旗幟', '星星'].map((label) => (
            <span key={label} className="part-tile is-soon" title="裝飾零件稍後登場">
              <span className="part-art soon-art">
                <Icon d={P.tent} size={30} />
              </span>
              <span className="part-label">{label}</span>
              <span className="soon-badge">稍後</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
