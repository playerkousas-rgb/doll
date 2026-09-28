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
  id: string
  title: string
  icon: string
  /** 有欄位表示「之後才登場」 */
  soon?: string
  items?: { label: string }[]
}

const GROUPS: Group[] = [
  { id: 'doll', title: '公仔', icon: P.person },
  { id: 'cloth', title: '衣物', icon: P.shirt, soon: '第二階段登場', items: [{ label: '童軍上衣' }, { label: '長褲' }, { label: '制服帽' }, { label: '外套' }] },
  { id: 'badge', title: '章', icon: P.badge, soon: '第三階段登場', items: [{ label: '團徽' }, { label: '級章' }, { label: '進階章' }] },
  { id: 'pose', title: '姿勢', icon: P.pose, soon: '第四階段登場', items: [{ label: '站姿' }, { label: '敬禮' }] },
]

interface Props {
  onAdd: (template: DollTemplate, world?: { x: number; y: number }) => void
}

/** 左側：零件庫（公仔可拖放；衣物／章／姿勢先佔位） */
export default function PartsPanel({ onAdd }: Props) {
  const [q, setQ] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ cloth: false, badge: true, pose: true })

  const match = (label: string) => label.toLowerCase().includes(q.trim().toLowerCase())
  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

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
        const isOpen =
          !collapsed[g.id] ||
          (!!q && (g.soon ? (g.items ?? []).some((i) => match(i.label)) : DOLL_TEMPLATES.some((t) => match(t.label))))
        const dollList = DOLL_TEMPLATES.filter((t) => !q || match(t.label))
        const itemList = (g.items ?? []).filter((i) => !q || match(i.label))
        if (q && (g.id === 'doll' ? dollList.length : itemList.length) === 0) return null

        return (
          <section className="parts-group" key={g.id}>
            <h3 className="parts-group-title">
              <button
                type="button"
                className="group-toggle"
                onClick={() => toggle(g.id)}
                aria-expanded={isOpen}
                title={g.soon ?? g.title}
              >
                <Icon d={g.icon} size={15} />
                <span>{g.title}</span>
                {g.soon && <span className="soon-hint">{g.soon}</span>}
                <Icon d={isOpen ? P.chevronUp : P.chevronDown} size={14} className="chevron" />
              </button>
            </h3>

            {isOpen && (
              <div className="parts-grid">
                {g.id === 'doll' &&
                  dollList.map((t) => (
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
                {g.id !== 'doll' &&
                  itemList.map((i) => (
                    <span key={i.label} className="part-tile is-soon" title={`${g.soon}，先逛逛其他功能吧`}>
                      <span className="part-art soon-art">
                        <Icon d={g.icon} size={28} />
                      </span>
                      <span className="part-label">{i.label}</span>
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
