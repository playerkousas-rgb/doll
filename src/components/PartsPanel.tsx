import { useState } from 'react'
import type { Design } from '../types'
import { DEFAULT_DESIGN } from '../types'
import type { DollTemplate } from '../data/templates'
import { DOLL_TEMPLATES } from '../data/templates'
import { UNIFORMS, selectUniform } from '../data/uniforms'
import type { PosePresetId } from '../character/pose'
import { POSE_PRESETS, poseFromPreset } from '../character/pose'
import Character from '../character/Character'
import { Icon } from './Icons'
import { P } from './iconPaths'

interface Group {
  id: string
  title: string
  icon: string
  /** 有欄位表示「之後才登場」 */
  soon?: string
  note?: string
  items?: { label: string }[]
}

const GROUPS: Group[] = [
  { id: 'doll', title: '人物起點', icon: P.person },
  { id: 'cloth', title: '青少年制服', icon: P.shirt, note: '本階段' },
  { id: 'badge', title: '徽章', icon: P.badge, soon: '之後登場', items: [{ label: '團徽' }, { label: '級章' }, { label: '進階章' }] },
  { id: 'pose', title: '姿勢草稿', icon: P.pose, note: '後續深化' },
]

interface Props {
  onAdd: (template: DollTemplate, world?: { x: number; y: number }) => void
  selectedDesign: Design | null
  selectedPose: string | null
  onPose: (id: PosePresetId) => void
  onUniform: (id: string) => void
}

/** 左側：人物起點、可套用的青少年制服、尚未製作的徽章與姿勢草稿。 */
export default function PartsPanel({ onAdd, selectedDesign, selectedPose, onPose, onUniform }: Props) {
  const [q, setQ] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ badge: true, pose: true })

  const match = (label: string) => label.toLowerCase().includes(q.trim().toLowerCase())
  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  return (
    <div className="parts-panel">
      <div className="panel-head parts-head">
        <div>
          <span className="panel-eyebrow">CHARACTER LIBRARY</span>
          <h2>人物設計室</h2>
        </div>
        <span className="panel-count">{DOLL_TEMPLATES.length} 個起點</span>
      </div>
      <p className="parts-lead">先選人物，再挑青少年支部制服；款式與配色可在右側細調。</p>
      <div className="roadmap-mini" aria-label="設計順序">
        <span className="is-done">01 臉與髮</span><span className="is-now">02 制服</span><span>03 畫風</span><span>04 動作</span>
      </div>

      <div className="search-box">
        <Icon d={P.search} size={16} />
        <input placeholder="搜尋零件" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {GROUPS.map((g) => {
        const dollList = DOLL_TEMPLATES.filter((t) => !q || match(t.label))
        const poseList = POSE_PRESETS.filter((p) => !q || match(p.label) || match(p.detail))
        const uniformList = UNIFORMS.filter((u) => u.id !== 'basic' && (!q || match(u.label)))
        const itemList = (g.items ?? []).filter((i) => !q || match(i.label))
        const count = g.id === 'doll' ? dollList.length : g.id === 'pose' ? poseList.length : g.id === 'cloth' ? uniformList.length : itemList.length
        if (q && count === 0) return null
        const isOpen = !collapsed[g.id] || !!q

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
                {g.note && <span className="soon-hint is-muted">{g.note}</span>}
                <Icon d={isOpen ? P.chevronUp : P.chevronDown} size={14} className="chevron" />
              </button>
            </h3>

            {isOpen && (
              <div className={`parts-grid ${g.id === 'pose' ? 'parts-grid--pose' : ''} ${g.id === 'cloth' ? 'parts-grid--uniform' : ''}`}>
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
                {g.id === 'cloth' && uniformList.map((u) => (
                  <button key={u.id} type="button" className={`part-tile part-uniform ${selectedDesign?.uniform === u.id ? 'is-active' : ''}`}
                    aria-pressed={selectedDesign?.uniform === u.id} onClick={() => onUniform(u.id)}
                    title={selectedDesign ? `替選取的公仔套用「${u.label}」` : '請先選取畫布上的公仔'}>
                    <span className="part-art"><Character design={selectUniform(selectedDesign ?? DEFAULT_DESIGN, u.id)} /></span>
                    <span className="part-label">{u.label}</span>
                  </button>
                ))}
                {g.id === 'pose' && poseList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`part-tile part-pose ${selectedPose === p.id ? 'is-active' : ''}`}
                    aria-pressed={selectedPose === p.id}
                    onClick={() => onPose(p.id)}
                    title={selectedDesign ? `替選取的公仔套用「${p.label}」` : '請先點選畫布上的公仔'}
                  >
                    <span className="part-art pose-art"><Character design={selectedDesign ?? DEFAULT_DESIGN} pose={poseFromPreset(p.id)} /></span>
                    <span className="part-label">{p.label}</span>
                  </button>
                ))}
                {g.id === 'badge' &&
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
            {g.id === 'cloth' && isOpen && <p className="parts-hint">小童軍是集會服裝，並非正式制服；其餘款式依香港童軍總會青少年制服規格繪製。</p>}
            {g.id === 'pose' && isOpen && <p className="parts-hint">骨架仍可試用；目前先做好青少年成員制服。</p>}
          </section>
        )
      })}
    </div>
  )
}
