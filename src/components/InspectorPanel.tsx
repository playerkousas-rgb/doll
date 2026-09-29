import { useRef, useState } from 'react'
import type { Design } from '../types'
import Character from '../character/Character'
import { FACES, HAIRS, getOpt } from '../data/options'
import { CUT_LABELS, uniformById, type UniformCut } from '../data/uniforms'
import type { JointKey, PosePresetId } from '../character/pose'
import type { DollElement, Doc } from '../lib/canvas'
import { buildPrompt } from '../lib/prompt'
import { copyText } from '../lib/export'
import { Icon } from './Icons'
import { P } from './iconPaths'
import OptionsPanel from './OptionsPanel'
import type { DesignSection } from './OptionsPanel'
import PosePanel from './PosePanel'

export type InspectorTab = 'props' | 'pose' | 'prompt'

interface Props {
  sel: DollElement | null
  elementCount: number
  tab: InspectorTab
  onTab: (tab: InspectorTab) => void
  sectionId: DesignSection
  onSection: (section: DesignSection) => void
  /** 互動期間的快照（輸入框／滑桿 focus/blur 用，避免逐字佔滿復原紀錄） */
  beginInteract: () => Doc
  endInteract: (snap: Doc) => void
  onDesignChange: (key: keyof Design, value: string) => void
  onPosePreset: (id: PosePresetId) => void
  onPoseJoint: (key: JointKey, angle: number, discrete: boolean) => void
  onMirrorPose: () => void
  onResetPose: () => void
  onName: (name: string) => void
  onNote: (note: string) => void
  onRandom: () => void
  onReset: () => void
  onDuplicate: () => void
  onDelete: () => void
  onCollapse: () => void
}

function HeadPortrait({ design }: { design: Design }) {
  const face = getOpt(FACES, design.face).label
  const hair = getOpt(HAIRS, design.hair).label
  return <div className="portrait-card" aria-label="目前的臉與頭髮特寫">
    <div className="portrait-meta"><span>FACE & HAIR STUDIO</span><span>01 / 04</span></div>
    <div className="portrait-art"><Character design={design} viewBox="65 -16 230 249" showHat={false} /></div>
    <div className="portrait-caption">
      <strong>挑好臉與頭髮</strong>
      <span>{face} · {hair}（暫不戴帽）</span>
    </div>
  </div>
}

function UniformPortrait({ design }: { design: Design }) {
  const uniform = uniformById(design.uniform)
  const cut = CUT_LABELS[design.uniformCut as UniformCut] ?? '短褲'
  return <div className="portrait-card uniform-portrait" aria-label="目前的制服全身預覽">
    <div className="portrait-meta"><span>YOUTH UNIFORM STUDIO</span><span>02 / 04</span></div>
    <div className="portrait-art"><Character design={design} /></div>
    <div className="portrait-caption">
      <strong>{uniform.label}</strong><span>{cut} · {design.uniformHat === 'on' ? '戴帽' : '不戴帽'}</span>
    </div>
  </div>
}

/** 右側：臉與頭髮為主、姿勢為後續延伸。 */
export default function InspectorPanel({
  sel,
  elementCount,
  tab,
  onTab,
  sectionId,
  onSection,
  beginInteract,
  endInteract,
  onDesignChange,
  onPosePreset,
  onPoseJoint,
  onMirrorPose,
  onResetPose,
  onName,
  onNote,
  onRandom,
  onReset,
  onDuplicate,
  onDelete,
  onCollapse,
}: Props) {
  const [manualPrompt, setManualPrompt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 未手動修改時直接由目前造型／姿勢衍生；換選取角色時由 key 重建編輯器。
  const fresh = sel ? buildPrompt(sel.design, sel.pose, sel.note) : ''
  const prompt = manualPrompt ?? fresh

  const flashCopy = async (text: string) => {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  const nameSnap = useRef<Doc | null>(null)
  const noteSnap = useRef<Doc | null>(null)

  return (
    <div className="inspector">
      <div className="inspector-tabs">
        <div className="inspector-segmented" role="tablist" aria-label="角色編輯分頁">
          {([
            { id: 'props', label: '臉與髮', icon: P.sliders },
            { id: 'pose', label: '姿勢', icon: P.pose },
            { id: 'prompt', label: '提示詞', icon: P.spark },
          ] as const).map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`inspector-tab ${tab === id ? 'is-active' : ''}`}
              onClick={() => onTab(id)}
            >
              <Icon d={icon} size={16} /> {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-btn inspector-collapse"
          title="收合面板"
          aria-label="收合右側面板"
          onClick={onCollapse}
        >
          <Icon d={P.panelRight} size={17} />
        </button>
      </div>

      {!sel ? (
        <div className="inspector-empty">
          <Icon d={P.cursor} size={34} />
          <p>
            點一下畫布上的公仔
            <br />
            就能在這裡調整造型與姿勢
          </p>
          <p className="muted">畫布上共有 {elementCount} 隻公仔</p>
        </div>
      ) : tab === 'pose' ? (
        <PosePanel
          key={sel.id}
          sel={sel}
          beginInteract={beginInteract}
          endInteract={endInteract}
          onPreset={onPosePreset}
          onJoint={onPoseJoint}
          onMirror={onMirrorPose}
          onReset={onResetPose}
        />
      ) : tab === 'props' ? (
        <div className="inspector-body">
          <div className="name-row">
            <span className="name-icon">
              <Icon d={P.person} size={16} />
            </span>
            <input
              className="name-input"
              value={sel.name}
              onChange={(e) => onName(e.target.value)}
              onFocus={() => {
                nameSnap.current = beginInteract()
              }}
              onBlur={() => {
                if (nameSnap.current) endInteract(nameSnap.current)
                nameSnap.current = null
              }}
              aria-label="公仔名稱"
            />
          </div>

          {sectionId === 'uniform' || sectionId === 'body'
            ? <UniformPortrait design={sel.design} /> : <HeadPortrait design={sel.design} />}
          <OptionsPanel design={sel.design} sectionId={sectionId} onSection={onSection} onChange={onDesignChange} />

          <div className="inspector-actions">
            <button type="button" className="btn" onClick={onRandom}>
              <Icon d={P.random} size={15} /> 隨機造型
            </button>
            <button type="button" className="btn btn-ghost" onClick={onReset}>
              <Icon d={P.reset} size={15} /> 重設
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDuplicate}>
              <Icon d={P.copy} size={15} /> 複製
            </button>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <Icon d={P.trash} size={15} /> 刪除
            </button>
          </div>
        </div>
      ) : (
        <div className="inspector-body prompt-body">
          <div className="chip">
            <Icon d={P.person} size={14} />
            <span className="chip-name">{sel.name}</span>
          </div>

          <label className="note-label" htmlFor="doll-note">
            <Icon d={P.note} size={14} /> 備註（會寫進提示詞）
          </label>
          <input
            id="doll-note"
            className="input"
            placeholder="例如：戴着彗星帽、拿着小童軍刀"
            value={sel.note}
            onChange={(e) => onNote(e.target.value)}
            onFocus={() => {
              noteSnap.current = beginInteract()
            }}
            onBlur={() => {
              if (noteSnap.current) endInteract(noteSnap.current)
              noteSnap.current = null
            }}
          />

          <textarea
            className="prompt-box"
            value={prompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            rows={11}
          />
          <div className="btn-row">
            <button type="button" className="btn btn-primary btn-block" onClick={() => flashCopy(prompt)}>
              <Icon d={copied ? P.check : P.copy} size={15} />
              {copied ? '已複製 ✓' : '複製提示詞'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setManualPrompt(null)}
            >
              重新產生
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
