import { useState } from 'react'
import type { Design } from '../types'
import { DEFAULT_DESIGN } from '../types'
import Character from '../character/Character'
import { Icon, P } from './Icons'

/** 新增公仔時的模板 */
export interface DollTemplate {
  key: string
  label: string
  design: Design
}

export const DOLL_TEMPLATES: DollTemplate[] = [
  { key: 'blank', label: '新公仔', design: DEFAULT_DESIGN },
  {
    key: 'boy',
    label: '標準男孩',
    design: { ...DEFAULT_DESIGN, hair: 'bowl', hairColor: 'darkbrown', skin: 'wheat', eyes: 'cute' },
  },
  {
    key: 'girl',
    label: '可愛女孩',
    design: { ...DEFAULT_DESIGN, hair: 'twintail', hairColor: 'brown', face: 'heart', eyes: 'smile', skin: 'fair', body: 'slim' },
  },
  {
    key: 'cool',
    label: '酷酷男生',
    design: { ...DEFAULT_DESIGN, hair: 'side', hairColor: 'silver', eyes: 'cool', skin: 'deep', body: 'slim' },
  },
]

interface Group {
  title: string
  hint: string
  /** 有這個欄位表示「之後才登場」 */
  soon?: boolean
  icon: string
  items?: { label: string }[]
}

const GROUPS: Group[] = [
  { title: '公仔', hint: '拖到畫布，或點一下新增', icon: P.person },
  { title: '衣物', hint: '第二階段登場', soon: true, icon: P.shirt, items: [{ label: '童軍上衣' }, { label: '長褲' }, { label: '制服帽' }, { label: '外套' }] },
  { title: '章', hint: '第三階段登場', soon: true, icon: P.badge, items: [{ label: '團徽' }, { label: '級章' }, { label: '進階章' }] },
  { title: '姿勢', hint: '第四階段登場', soon: true, icon: P.pose, items: [{ label: '站姿' }, { label: '敬禮' }] },
]

interface Props {
  onAdd: (template: DollTemplate, world?: { x: number; y: number }) => void
}

/** 左側：零件庫（公仔可拖放；衣物／章／姿勢先佔位） */
export default function PartsPanel({ onAdd }: Props) {
  const [q, setQ] = useState('')

  const match = (label: string) => label.toLowerCase().includes(q.trim().toLowerCase())

  return (
    <div className="parts-panel">
      <div className="panel-head">
        <h2>零件庫</h2>
      </div>

      <div className="search-box">
        <Icon d={P.search} size={16} />
        <input placeholder="搜尋零件" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {GROUPS.map((g) => {
        if (g.soon && !g.items?.some((i) => match(i.label))) return null
        if (g.title === '公仔' && q && !DOLL_TEMPLATES.some((t) => match(t.label))) return null

        return (
          <section className="parts-group" key={g.title}>
            <h3 className="parts-group-title">
              <Icon d={g.icon} size={15} />
              {g.title}
              <span className={`parts-group-hint ${g.soon ? 'is-soon' : ''}`}>{g.hint}</span>
            </h3>

            {g.title === '公仔' && (
              <div className="parts-grid">
                {DOLL_TEMPLATES.filter((t) => !q || match(t.label)).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className="part-tile"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-doll', t.key)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={() => onAdd(t)}
                    title="點一下放到畫布中央，或拖到畫布指定位置"
                  >
                    <span className="part-art">
                      <Character design={t.design} viewBox="60 -10 240 250" />
                    </span>
                    <span className="part-label">{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {g.soon && (
              <div className="parts-grid">
                {g
                  .items!.filter((i) => !q || match(i.label))
                  .map((i) => (
                    <span key={i.label} className="part-tile is-soon" title={`${g.hint}，先逛逛其他功能吧`}>
                      <span className="part-art soon-art">
                        <Icon d={g.icon} size={30} />
                      </span>
                      <span className="part-label">{i.label}</span>
                      <span className="soon-badge">稍後</span>
                    </span>
                  ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
