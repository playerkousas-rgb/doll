import type { DollElement } from '../lib/canvas'
import { Icon, P } from './Icons'

interface Props {
  elements: DollElement[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleHide: (id: string) => void
  onToggleLock: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  onDelete: (id: string) => void
}

/** 左側：圖層（由上至下 = 由前至後） */
export default function LayersPanel({ elements, selectedId, onSelect, onToggleHide, onToggleLock, onMove, onDelete }: Props) {
  const rows = [...elements].reverse()

  return (
    <div className="layers-panel">
      <div className="panel-head">
        <h2>圖層</h2>
        <span className="panel-count">{elements.length}</span>
      </div>

      {rows.length === 0 ? (
        <p className="empty">畫布是空的，到「零件庫」加一隻公仔吧。</p>
      ) : (
        <ul className="layer-list">
          {rows.map((el) => {
            const top = elements[elements.length - 1]?.id === el.id
            const bottom = elements[0]?.id === el.id
            return (
              <li
                key={el.id}
                className={`layer-row ${selectedId === el.id ? 'is-active' : ''} ${el.hidden ? 'is-hidden' : ''}`}
                onClick={() => onSelect(el.id)}
              >
                <button
                  type="button"
                  className="icon-btn"
                  title={el.hidden ? '顯示' : '隱藏'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleHide(el.id)
                  }}
                >
                  <Icon d={el.hidden ? P.eyeOff : P.eye} size={16} />
                </button>
                <span className="layer-name">{el.name}</span>
                {el.locked && (
                  <span className="layer-lock" title="已鎖定">
                    <Icon d={P.lock} size={14} />
                  </span>
                )}
                <span className="layer-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={top}
                    title="上移"
                    onClick={() => onMove(el.id, 1)}
                  >
                    <Icon d={P.up} size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={bottom}
                    title="下移"
                    onClick={() => onMove(el.id, -1)}
                  >
                    <Icon d={P.down} size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title={el.locked ? '解鎖後才能刪除' : '刪除'}
                    disabled={el.locked}
                    onClick={() => onDelete(el.id)}
                  >
                    <Icon d={P.trash} size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title={el.locked ? '解鎖' : '鎖定'}
                    onClick={() => onToggleLock(el.id)}
                  >
                    <Icon d={el.locked ? P.lock : P.lockOpen} size={15} />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
