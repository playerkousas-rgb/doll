import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { DollElement, Doc } from '../lib/canvas'
import type { JointKey } from '../character/pose'
import { poseLabel } from '../character/pose'
import { BOARD, bgColor } from '../lib/canvas'
import type { View } from '../lib/view'
import { fitView } from '../lib/view'
import Character from '../character/Character'
import RigOverlay from './RigOverlay'
import { Icon } from './Icons'
import { P } from './iconPaths'
import type { DollTemplate } from '../data/templates'
import { DOLL_TEMPLATES } from '../data/templates'

export interface StageApi {
  doc: Doc
  selId: string | null
  tool: 'select' | 'hand'
  view: View
  preview: boolean
  poseMode: boolean
  canUndo: boolean
  canRedo: boolean
  leftOpen: boolean
  rightOpen: boolean
  stageRef: RefObject<HTMLDivElement | null>
  setTool: (t: 'select' | 'hand') => void
  setView: Dispatch<SetStateAction<View>>
  select: (id: string | null) => void
  moveEl: (id: string, x: number, y: number) => void
  snapshot: () => Doc
  commitSnapshot: (snap: Doc) => void
  onJoint: (id: string, key: JointKey, angle: number, discrete: boolean) => void
  onPoseMode: () => void
  addAt: (template: DollTemplate, world: { x: number; y: number }) => void
  addCenter: () => void
  undo: () => void
  redo: () => void
  fit: () => void
  zoomBy: (factor: number) => void
  togglePreview: () => void
  onOpenLeft: () => void
  onOpenRight: () => void
}

const snap4 = (v: number) => Math.round(v / 4) * 4

/** 中央：無限畫布（平移、縮放、拖放、浮動工具列） */
export default function CanvasStage({ api }: { api: StageApi }) {
  const { doc, selId, tool, view, preview, poseMode, stageRef, setView } = api
  const spaceRef = useRef(false)
  const viewRef = useRef(view)
  const snapshotRef = useRef(api.snapshot)
  useLayoutEffect(() => {
    viewRef.current = view
    snapshotRef.current = api.snapshot
  }, [view, api.snapshot])

  // 面板開合／手機轉向時保持畫布中心的世界座標，不讓公仔跑出視窗。
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    let width = el.clientWidth
    let height = el.clientHeight
    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width
      const nextHeight = entry.contentRect.height
      // 擷取舊尺寸：React 的 state updater 可能在本回呼結束後才執行。
      const oldWidth = width
      const oldHeight = height
      width = nextWidth
      height = nextHeight
      if (Math.abs(nextWidth - oldWidth) > 0.5 || Math.abs(nextHeight - oldHeight) > 0.5) {
        setView((v) => {
          const fitted = fitView(el, snapshotRef.current())
          // 畫布縮小到角色裝不下時重新適合畫面；其他情況保持原縮放與中心。
          if ((nextWidth < oldWidth || nextHeight < oldHeight) && v.z > fitted.z + 0.01) return fitted
          return { ...v, x: v.x + (nextWidth - oldWidth) / 2, y: v.y + (nextHeight - oldHeight) / 2 }
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [stageRef, setView])

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

  const cursor = tool === 'hand' ? 'grab' : 'default'

  return (
    <div
      ref={stageRef}
      className={`stage ${preview ? 'is-preview' : ''}`}
      style={{ cursor }}
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
                  <span className="board-pose">/ {poseLabel(el.pose)}</span>
                  {el.locked && <Icon d={P.lock} size={12} />}
                </div>
              )}
              <div
                className={`board-card ${isSel ? 'is-sel' : ''} ${el.locked ? 'is-locked' : ''}`}
                style={{ background: bgColor(doc) }}
                onPointerDown={(e) => onBoardPointerDown(e, el)}
              >
                <div className="board-art">
                  <Character design={el.design} pose={el.pose} svgId={`doll-${el.id}`} />
                  {isSel && poseMode && (
                    <RigOverlay el={el} snapshot={api.snapshot} commitSnapshot={api.commitSnapshot} onJoint={api.onJoint} />
                  )}
                </div>
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
              <button
                type="button"
                className={`icon-btn ${poseMode ? 'is-active' : ''}`}
                title="開啟／關閉姿勢編輯"
                aria-label="姿勢編輯"
                aria-pressed={poseMode}
                onClick={api.onPoseMode}
              >
                <Icon d={P.pose} />
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

          {poseMode && (
            <div className="pose-stage-tip">
              <span className="pose-stage-dot" />
              {selId ? '骨架模式 · 拖曳圓點調整關節' : '骨架模式 · 請先點選一隻公仔'}
            </div>
          )}

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

          {/* 面板收合時的恢復按鈕（參考專案的 ⊟/⊞ 設計） */}
          {!api.leftOpen && (
            <button type="button" className="float-pill restore-pill restore-left" title="展開零件庫" onClick={api.onOpenLeft}>
              <Icon d={P.panelLeft} size={17} />
            </button>
          )}
          {!api.rightOpen && (
            <button
              type="button"
              className="float-pill restore-pill restore-right"
              title="展開屬性面板"
              onClick={api.onOpenRight}
            >
              <Icon d={P.panelRight} size={17} />
            </button>
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
