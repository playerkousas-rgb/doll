import { useEffect, useRef, useState } from 'react'
import type { Design } from '../types'
import type { DollElement, Doc } from '../lib/canvas'
import { buildPrompt } from '../lib/prompt'
import { copyText } from '../lib/export'
import { Icon, P } from './Icons'
import OptionsPanel from './OptionsPanel'

type Tab = 'props' | 'prompt'

interface Props {
  sel: DollElement | null
  elementCount: number
  /** 互動期間的快照（輸入框 focus/blur 用，避免逐字佔滿復原紀錄） */
  beginInteract: () => Doc
  endInteract: (snap: Doc) => void
  onDesignChange: (key: keyof Design, value: string) => void
  onName: (name: string) => void
  onNote: (note: string) => void
  onRandom: () => void
  onReset: () => void
  onDuplicate: () => void
  onDelete: () => void
  onCollapse: () => void
}

/** 右側：屬性 / 提示詞 */
export default function InspectorPanel({
  sel,
  elementCount,
  beginInteract,
  endInteract,
  onDesignChange,
  onName,
  onNote,
  onRandom,
  onReset,
  onDuplicate,
  onDelete,
  onCollapse,
}: Props) {
  const [tab, setTab] = useState<Tab>('props')
  const [prompt, setPrompt] = useState('')
  const [edited, setEdited] = useState(false)
  const [copied, setCopied] = useState(false)

  const fresh = sel ? buildPrompt(sel.design, sel.note) : ''
  useEffect(() => {
    if (!edited) setPrompt(fresh)
  }, [fresh, edited])

  // 換選取物件時，提示詞回到自動產生
  useEffect(() => {
    setEdited(false)
  }, [sel?.id])

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
        <div className="inspector-segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'props'}
            aria-label="屬性"
            title="屬性"
            className={`inspector-tab ${tab === 'props' ? 'is-active' : ''}`}
            onClick={() => setTab('props')}
          >
            <Icon d={P.sliders} size={18} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'prompt'}
            aria-label="提示詞"
            title="提示詞"
            className={`inspector-tab ${tab === 'prompt' ? 'is-active' : ''}`}
            onClick={() => setTab('prompt')}
          >
            <Icon d={P.spark} size={18} />
          </button>
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
            就能在這裡調整它的造型
          </p>
          <p className="muted">畫布上共有 {elementCount} 隻公仔</p>
        </div>
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

          <OptionsPanel design={sel.design} onChange={onDesignChange} />

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
            onChange={(e) => {
              setPrompt(e.target.value)
              setEdited(true)
            }}
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
              onClick={() => {
                setEdited(false)
                setPrompt(buildPrompt(sel.design, sel.note))
              }}
            >
              重新產生
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
