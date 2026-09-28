import { BG_PRESETS } from '../lib/canvas'
import { Icon, P } from './Icons'

interface Props {
  bg: string
  onBg: (id: string) => void
}

/** 左側：公仔底色（畫布保持素面，底色套用在公仔板上；裝飾零件之後才登場） */
export default function BgPanel({ bg, onBg }: Props) {
  return (
    <div className="bg-panel">
      <div className="panel-head">
        <h2>背景</h2>
      </div>

      <section className="parts-group">
        <h3 className="parts-group-title">
          <span className="group-static">
            <Icon d={P.palette} size={15} />
            <span>公仔底色</span>
          </span>
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
          <span className="group-static">
            <Icon d={P.tent} size={15} />
            <span>裝飾</span>
            <span className="soon-hint">之後登場</span>
          </span>
        </h3>
        <div className="parts-grid">
          {['帳篷', '旗幟', '星星'].map((label) => (
            <span key={label} className="part-tile is-soon" title="裝飾零件稍後登場">
              <span className="part-art soon-art">
                <Icon d={P.tent} size={28} />
              </span>
              <span className="part-label">{label}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
