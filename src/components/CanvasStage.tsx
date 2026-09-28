import { useEffect, useRef, type RefObject } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { DollElement, Doc } from '../lib/canvas'
import { BOARD, docBounds } from '../lib/canvas'
import Character from '../character/Character'
import { Icon, P } from './Icons'
import type { DollTemplate } from './PartsPanel'
import { DOLL_TEMPLATES } from './PartsPanel'

export interface View {
  x: number
  y: number
  z: number
}

export interface StageApi {
  doc: Doc
  selId: string | null
  tool: 'select' | 'hand'
  view: View
  preview: boolean
  canUndo: boolean
  canRedo: boolean
  stageRef: RefObject<HTMLDivElement | null>
  setTool: (t: 'select' | 'hand') => void
  setView: Dispatch<SetStateAction<View>>
  select: (id: string | null) => void
  moveEl: (id: string, x: number, y: number) => void
  snapshot: () => Doc
  commitSnapshot: (snap: Doc) => void
  addAt: (template: DollTemplate, world: { x: number; y: number }) => void
  addCenter: () => void
  undo: () => void
  redo: () => void
  fit: () => void
  zoomBy: (factor: number) => void
  togglePreview: () => void
}

const snap4 = (v: number) => Math.round(v / 4) * 4

/** 中央：無限畫布（平移、縮放、拖放、浮動工具列） */
export default function CanvasStage({ api }: { api: StageApi }) {
  const { doc, selId, tool, view, preview, stageRef, setView } = api
  const spaceRef = useRef(false)
  const viewRef = useRef(view)
  viewRef.current = view

  // 滾輪：一般 = 平移；Ctrl/Cmd + 滾輪 = 以指標為中心縮放
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        const factor = Math.exp(-e.deltaY * 0.0022)
        setView((v) => {
          const z2 = Math.min(2.5, Math.max(0.2, v.z * factor))
          const wx = (pt.x - v.x) / v.z
          const wy = (pt.y - v.y) / v.z
          return { z: z2, x: pt.x - wx * z2, y: pt.y - wy * z2 }
        })
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [stageRef, setView])

  // 空白鍵按住 = 暫時平移
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      spaceRef.current = true
      e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceRef.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /** 畫布空白處：選擇工具＝點擊取消選取；手掌/空白鍵/中鍵＝平移 */
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (preview) return
    const wantPan = tool === 'hand' || spaceRef.current || e.button === 1
    if (!wantPan) {
      if (e.button === 0) api.select(null)
      return
    }
    if (e.button !== 0 && e.button !== 1) return
    e.preventDefault()
    const sx = e.clientX
    const sy = e.clientY
    const vx = viewRef.current.x
    const vy = viewRef.current.y
    const move = (ev: PointerEvent) => {
      setView((v) => ({ ...v, x: vx + (ev.clientX - sx), y: vy + (ev.clientY - sy) }))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  /** 公仔板：點擊選取、拖曳移動（貼 4px 網格） */
  const onBoardPointerDown = (e: React.PointerEvent, el: DollElement) => {
    if (preview || tool !== 'select' || e.button !== 0) return
    e.stopPropagation()
    api.select(el.id)
    if (el.locked) return

    const sx = e.clientX
    const sy = e.clientY
    const ox = el.x
    const oy = el.y
    const snap = api.snapshot()
    let moved = false

    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / viewRef.current.z
      const dy = (ev.clientY - sy) / viewRef.current.z
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3) return
      moved = true
      api.moveEl(el.id, snap4(ox + dx), snap4(oy + dy))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) api.commitSnapshot(snap)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  /** 從零件庫拖公仔過來 */
  const onDrop = (e: React.DragEvent) => {
    if (preview) return
    const key = e.dataTransfer.getData('application/x-doll')
    if (!key) return
    e.preventDefault()
    const template = apiTemplate(key)
    if (!template) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const world = {
      x: snap4((e.clientX - rect.left - viewRef.current.x) / viewRef.current.z - BOARD.w / 2),
      y: snap4((e.clientY - rect.top - viewRef.current.y) / viewRef.current.z - BOARD.h / 2),
    }
    api.addAt(template, world)
  }

  const sel = doc.elements.find((e) => e.id === selId)
  const cursor = tool === 'hand' ? 'grab' : 'default'

  return (
    <div
      ref={stageRef}
      className={`stage ${preview ? 'is-preview' : ''}`}
      style={{
        backgroundColor: preview ? '#e8ece9' : undefined,
        backgroundImage: preview ? undefined : 'radial-gradient(circle, rgba(36,48,38,0.14) 1px, transparent 1px)',
        backgroundSize: `${24 * view.z}px ${24 * view.z}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        cursor,
      }}
      onPointerDown={onStagePointerDown}
      onDragOver={(e) => {
        if (!preview && e.dataTransfer.types.includes('application/x-doll')) {
          e.dataTransfer.dropEffect = 'copy'
          e.preventDefault()
        }
      }}
      onDrop={onDrop}
    >
      <div className="world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}>
        {doc.elements.map((el) => {
          if (el.hidden) return null
          const isSel = el.id === selId && !preview
          return (
            <div key={el.id} className="board-wrap" style={{ left: el.x, top: el.y, width: BOARD.w }}>
              {!preview && (
                <div className={`board-label ${el.locked ? 'is-locked' : ''}`}>
                  <Icon d={P.person} size={14} />
                  <span>{el.name}</span>
                  {el.locked && <Icon d={P.lock} size={12} />}
                </div>
              )}
              <div
                className={`board-card ${isSel ? 'is-sel' : ''} ${el.locked ? 'is-locked' : ''}`}
                onPointerDown={(e) => onBoardPointerDown(e, el)}
              >
                <Character design={el.design} svgId={`doll-${el.id}`} />
              </div>
            </div>
          )
        })}
      </div>

      {!preview && (
        <>
          {/* 上方浮動工具列 */}
          <div className="float-pill toolbar-pill">
            <div className="pill-group">
              <button
                type="button"
                className={`icon-btn ${tool === 'select' ? 'is-active' : ''}`}
                title="選擇工具（V）"
                onClick={() => api.setTool('select')}
              >
                <Icon d={P.cursor} />
              </button>
              <button
                type="button"
                className={`icon-btn ${tool === 'hand' ? 'is-active' : ''}`}
                title="手掌平移（H，或按住空白鍵）"
                onClick={() => api.setTool('hand')}
              >
                <Icon d={P.move} />
              </button>
            </div>
            <div className="pill-group">
              <button type="button" className="icon-btn" title="畫布中央加一隻公仔" onClick={api.addCenter}>
                <Icon d={P.plus} />
              </button>
              <button type="button" className="icon-btn" title="預覽（P）" onClick={api.togglePreview}>
                <Icon d={P.play} />
              </button>
            </div>
            <div className="pill-group">
              <button type="button" className="icon-btn" title="復原（Ctrl+Z）" disabled={!api.canUndo} onClick={api.undo}>
                <Icon d={P.undo} />
              </button>
              <button
                type="button"
                className="icon-btn"
                title="重做（Ctrl+Shift+Z）"
                disabled={!api.canRedo}
                onClick={api.redo}
              >
                <Icon d={P.redo} />
              </button>
            </div>
          </div>

          {/* 右下縮放列 */}
          <div className="float-pill zoom-pill">
            <button type="button" className="icon-btn" title="縮小" onClick={() => api.zoomBy(0.8)}>
              <Icon d={P.minus} />
            </button>
            <span className="zoom-value">{Math.round(view.z * 100)}%</span>
            <button type="button" className="icon-btn" title="放大" onClick={() => api.zoomBy(1.25)}>
              <Icon d={P.plus} />
            </button>
            <button type="button" className="icon-btn" title="適合畫面（0）" onClick={api.fit}>
              <Icon d={P.fit} />
            </button>
          </div>

          {/* 選取物件的小提示（置於左下，避開縮放列） */}
          {sel && tool === 'select' && (
            <div className="float-pill sel-hint">
              <Icon d={P.person} size={14} />
              {sel.name} · 拖曳移動 · 內容在右側「屬性」調整
            </div>
          )}
        </>
      )}

      {preview && (
        <div className="float-pill preview-pill">
          <span>預覽模式</span>
          <button type="button" className="btn btn-small" onClick={api.togglePreview}>
            退出（Esc）
          </button>
        </div>
      )}
    </div>
  )
}

function apiTemplate(key: string): DollTemplate | undefined {
  return DOLL_TEMPLATES.find((t) => t.key === key)
}

/** 適合畫面的計算（給 fit 用） */
export function fitView(stage: HTMLDivElement, doc: Doc): View {
  const r = stage.getBoundingClientRect()
  const b = docBounds(doc)
  if (!b) {
    return {
      z: 1,
      x: r.width / 2 - BOARD.w / 2,
      y: r.height / 2 - BOARD.h / 2,
    }
  }
  const pad = 72
  const z = Math.min((r.width - pad * 2) / b.w, (r.height - pad * 2) / b.h, 1.4)
  const z2 = Math.min(2.5, Math.max(0.15, z))
  return {
    z: z2,
    x: (r.width - b.w * z2) / 2 - b.x * z2,
    y: (r.height - b.h * z2) / 2 - b.y * z2,
  }
}
