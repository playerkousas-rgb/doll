import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Design } from './types'
import { DEFAULT_DESIGN } from './types'
import { BODIES, EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS } from './data/options'
import CanvasStage, { fitView } from './components/CanvasStage'
import type { StageApi, View } from './components/CanvasStage'
import PartsPanel from './components/PartsPanel'
import type { DollTemplate } from './components/PartsPanel'
import LayersPanel from './components/LayersPanel'
import BgPanel from './components/BgPanel'
import InspectorPanel from './components/InspectorPanel'
import { Icon, P } from './components/Icons'
import type { Doc, DollElement } from './lib/canvas'
import {
  BOARD,
  bgColor,
  createStarterDoc,
  docBounds,
  legacyDoc,
  loadDoc,
  newDoll,
  nextName,
  saveDoc,
} from './lib/canvas'
import { buildShareLink, clearHash, docFromHash } from './lib/share'
import { copyText, exportCanvasPng } from './lib/export'

type LeftView = 'parts' | 'layers' | 'bg'

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

function randomDesign(): Design {
  return {
    skin: pick(SKINS).id,
    face: pick(FACES).id,
    hair: pick(HAIRS).id,
    hairColor: pick(HAIR_COLORS).id,
    eyes: pick(EXPRS).id,
    body: pick(BODIES).id,
  }
}

function initialDoc(): Doc {
  const fromHash = docFromHash()
  if (fromHash) return fromHash
  const saved = loadDoc()
  if (saved) return saved
  const legacy = legacyDoc()
  if (legacy) return legacy
  return createStarterDoc()
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export default function App() {
  const [doc, setDoc] = useState<Doc>(initialDoc)
  const [selId, setSelId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'hand'>('select')
  const [view, setView] = useState<View>({ x: 80, y: 40, z: 1 })
  const [leftView, setLeftView] = useState<LeftView>('parts')
  const [preview, setPreview] = useState(false)
  const [histVer, setHistVer] = useState(0)
  const [toast, setToast] = useState('')

  const stageRef = useRef<HTMLDivElement | null>(null)
  const docRef = useRef(doc)
  docRef.current = doc
  const viewRef = useRef(view)
  viewRef.current = view
  const past = useRef<Doc[]>([])
  const future = useRef<Doc[]>([])
  const viewBeforePreview = useRef<View | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }, [])

  /* ── 歷史（復原／重做） ─────────────── */
  const pushHistory = useCallback((snap: Doc) => {
    past.current.push(snap)
    if (past.current.length > 120) past.current.shift()
    future.current = []
    setHistVer((v) => v + 1)
  }, [])

  /** 一般編輯：一步一筆復原紀錄 */
  const commit = useCallback(
    (fn: (d: Doc) => Doc) => {
      const prev = docRef.current
      const next = fn(prev)
      if (next === prev) return
      pushHistory(prev)
      setDoc(next)
    },
    [pushHistory],
  )

  /** 互動（拖曳、輸入）：結束時才記一筆 */
  const commitSnapshot = useCallback(
    (snap: Doc) => {
      if (docRef.current !== snap) pushHistory(snap)
    },
    [pushHistory],
  )

  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(docRef.current)
    setDoc(prev)
    setHistVer((v) => v + 1)
  }, [])

  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(docRef.current)
    setDoc(next)
    setHistVer((v) => v + 1)
  }, [])

  /* ── 視圖操作 ───────────────────────── */
  const fit = useCallback(() => {
    const el = stageRef.current
    if (!el) return
    setView(fitView(el, docRef.current))
  }, [])

  const zoomBy = useCallback((factor: number) => {
    const r = stageRef.current?.getBoundingClientRect()
    const pt = r ? { x: r.width / 2, y: r.height / 2 } : { x: 0, y: 0 }
    setView((v) => {
      const z2 = clamp(v.z * factor, 0.2, 2.5)
      const wx = (pt.x - v.x) / v.z
      const wy = (pt.y - v.y) / v.z
      return { z: z2, x: pt.x - wx * z2, y: pt.y - wy * z2 }
    })
  }, [])

  const togglePreview = useCallback(() => {
    if (!preview) {
      viewBeforePreview.current = { ...viewRef.current }
      setPreview(true)
      requestAnimationFrame(() => requestAnimationFrame(() => fit()))
    } else {
      setPreview(false)
      if (viewBeforePreview.current) setView(viewBeforePreview.current)
    }
  }, [preview, fit])

  /* ── 元素操作 ───────────────────────── */
  const select = useCallback((id: string | null) => setSelId(id), [])

  const moveEl = useCallback((id: string, x: number, y: number) => {
    setDoc((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, x, y } : e)) }))
  }, [])

  const addAt = useCallback(
    (template: DollTemplate, world: { x: number; y: number }) => {
      const doll = newDoll(template.design, nextName(docRef.current.elements), world.x, world.y)
      commit((d) => ({ ...d, elements: [...d.elements, doll] }))
      setSelId(doll.id)
      setLeftView('parts')
    },
    [commit],
  )

  const addCenter = useCallback(() => {
    const el = stageRef.current
    const r = el?.getBoundingClientRect()
    const v = viewRef.current
    const n = docRef.current.elements.length
    const off = (n % 5) * 32
    const cx = r ? (r.width / 2 - v.x) / v.z - BOARD.w / 2 + off : 200
    const cy = r ? (r.height / 2 - v.y) / v.z - BOARD.h / 2 + off : 150
    const doll = newDoll(DEFAULT_DESIGN, nextName(docRef.current.elements), Math.round(cx / 4) * 4, Math.round(cy / 4) * 4)
    commit((d) => ({ ...d, elements: [...d.elements, doll] }))
    setSelId(doll.id)
  }, [commit])

  const mutateSel = useCallback(
    (fn: (el: DollElement) => DollElement, discrete = true) => {
      const id = selId
      const apply = (d: Doc): Doc => ({
        ...d,
        elements: d.elements.map((e) => (e.id === id ? fn(e) : e)),
      })
      if (discrete) commit(apply)
      else setDoc(apply)
    },
    [selId, commit],
  )

  const deleteEl = useCallback(
    (id: string) => {
      const el = docRef.current.elements.find((e) => e.id === id)
      if (!el) return
      if (el.locked) {
        showToast(`「${el.name}」已鎖定，先在圖層解鎖`)
        return
      }
      commit((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }))
      setSelId((cur) => (cur === id ? null : cur))
    },
    [commit, showToast],
  )

  const duplicateSel = useCallback(() => {
    const el = docRef.current.elements.find((e) => e.id === selId)
    if (!el) return
    const copy: DollElement = {
      ...el,
      id: Math.random().toString(36).slice(2, 10),
      x: el.x + 24,
      y: el.y + 24,
      name: nextName(docRef.current.elements),
      design: { ...el.design },
    }
    commit((d) => ({ ...d, elements: [...d.elements, copy] }))
    setSelId(copy.id)
  }, [selId, commit])

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const id = selId
      if (!id) return
      const el = docRef.current.elements.find((e) => e.id === id)
      if (!el || el.locked) return
      commit((d) => ({
        ...d,
        elements: d.elements.map((e) => (e.id === id ? { ...e, x: e.x + dx, y: e.y + dy } : e)),
      }))
    },
    [selId, commit],
  )

  /* ── 圖層操作 ───────────────────────── */
  const reorder = (id: string, dir: -1 | 1) =>
    commit((d) => {
      const i = d.elements.findIndex((e) => e.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= d.elements.length) return d
      const els = [...d.elements]
      ;[els[i], els[j]] = [els[j], els[i]]
      return { ...d, elements: els }
    })

  /* ── 持久化與初始化 ─────────────────── */
  useEffect(() => saveDoc(doc), [doc])

  useEffect(() => {
    clearHash()
    const first = docRef.current.elements[0]
    setSelId(first?.id ?? null)
    requestAnimationFrame(() => requestAnimationFrame(() => fit()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── 鍵盤快捷鍵 ─────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      const ctrl = e.ctrlKey || e.metaKey
      const k = e.key

      if (ctrl && (k === 'z' || k === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (ctrl && (k === 'y' || k === 'Y')) {
        e.preventDefault()
        redo()
        return
      }
      if (ctrl && (k === 'd' || k === 'D')) {
        e.preventDefault()
        duplicateSel()
        return
      }
      if (typing) return

      if (k === 'Delete' || k === 'Backspace') {
        if (selId) {
          e.preventDefault()
          deleteEl(selId)
        }
        return
      }
      if (k === 'Escape') {
        if (preview) togglePreview()
        else setSelId(null)
        return
      }
      if (k === 'p' || k === 'P') {
        togglePreview()
        return
      }
      if (k === 'v' || k === 'V') {
        setTool('select')
        return
      }
      if (k === 'h' || k === 'H') {
        setTool('hand')
        return
      }
      if (k === '+' || k === '=') {
        zoomBy(1.25)
        return
      }
      if (k === '-') {
        zoomBy(0.8)
        return
      }
      if (k === '0') {
        fit()
        return
      }
      if (k.startsWith('Arrow')) {
        if (!selId) return
        e.preventDefault()
        const step = e.shiftKey ? 8 : 1
        if (k === 'ArrowUp') nudge(0, -step)
        if (k === 'ArrowDown') nudge(0, step)
        if (k === 'ArrowLeft') nudge(-step, 0)
        if (k === 'ArrowRight') nudge(step, 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* ── 分享 / 匯出 ────────────────────── */
  const onShare = async () => {
    const ok = await copyText(buildShareLink(docRef.current))
    showToast(ok ? '已複製分享連結，別人打開可以「以此為底圖」' : '複製失敗')
  }

  const onExport = async () => {
    const b = docBounds(docRef.current)
    if (!b) {
      showToast('畫布是空的')
      return
    }
    showToast('正在匯出 PNG…')
    const ok = await exportCanvasPng(docRef.current, b, bgColor(docRef.current))
    showToast(ok ? '已匯出 公仔畫布.png' : '匯出失敗')
  }

  /* ── 選取的元素 ─────────────────────── */
  const sel = useMemo(() => doc.elements.find((e) => e.id === selId) ?? null, [doc, selId])

  const stageApi: StageApi = {
    doc,
    selId,
    tool,
    view,
    preview,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    stageRef,
    setTool,
    setView,
    select,
    moveEl,
    snapshot: () => docRef.current,
    commitSnapshot,
    addAt,
    addCenter,
    undo,
    redo,
    fit,
    zoomBy,
    togglePreview,
  }
  // histVer 讓 canUndo/canRedo 在歷史變動時重算
  void histVer

  const railBtn = (id: LeftView, icon: string, label: string, disabled?: boolean, onClick?: () => void) => (
    <button
      key={id}
      type="button"
      className={`rail-btn ${leftView === id && !disabled ? 'is-active' : ''}`}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick ?? (() => setLeftView(id))}
    >
      <Icon d={icon} />
    </button>
  )

  return (
    <div className={`app ${preview ? 'is-preview' : ''}`}>
      <header className="header">
        <div className="brand">
          <span className="brand-mark">
            <Icon d={P.tent} size={22} strokeWidth={2} />
          </span>
          <div className="brand-text">
            <h1>童軍公仔設計台</h1>
            <p>旅團個人化童軍卡通公仔設計平台</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={onExport}>
            <Icon d={P.download} size={15} /> 匯出 PNG
          </button>
          <button type="button" className="btn" onClick={onShare}>
            <Icon d={P.share} size={15} /> 分享連結
          </button>
          <button type="button" className="btn btn-primary" onClick={togglePreview}>
            <Icon d={P.play} size={15} /> 預覽
          </button>
        </div>
      </header>

      <div className="body">
        <nav className="rail" aria-label="面板切換">
          {railBtn('parts', P.person, '零件庫')}
          {railBtn('layers', P.layers, '圖層')}
          {railBtn('bg', P.palette, '背景')}
          <button
            type="button"
            className="rail-btn is-disabled"
            title="文字零件稍後登場"
            aria-label="文字（稍後登場）"
            onClick={() => showToast('文字零件稍後登場')}
          >
            <Icon d={P.text} />
          </button>
          <span className="rail-spacer" />
          <span className="rail-foot" title="繁體中文（香港）">
            <Icon d={P.note} size={16} />
          </span>
        </nav>

        <aside className="panel-left">
          {leftView === 'parts' && (
            <PartsPanel
              onAdd={(t) => {
                // 點擊新增 → 放到目前視窗中央，並依數量錯開避免完全疊住
                const r = stageRef.current?.getBoundingClientRect()
                const v = viewRef.current
                const cx = r ? (r.width / 2 - v.x) / v.z - BOARD.w / 2 : 200
                const cy = r ? (r.height / 2 - v.y) / v.z - BOARD.h / 2 : 150
                const n = docRef.current.elements.length
                const off = (n % 5) * 32
                addAt(t, { x: Math.round((cx + off) / 4) * 4, y: Math.round((cy + off) / 4) * 4 })
              }}
            />
          )}
          {leftView === 'layers' && (
            <LayersPanel
              elements={doc.elements}
              selectedId={selId}
              onSelect={select}
              onToggleHide={(id) =>
                commit((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, hidden: !e.hidden } : e)) }))
              }
              onToggleLock={(id) =>
                commit((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, locked: !e.locked } : e)) }))
              }
              onMove={reorder}
              onDelete={deleteEl}
            />
          )}
          {leftView === 'bg' && (
            <BgPanel bg={doc.bg} onBg={(id) => commit((d) => ({ ...d, bg: id }))} />
          )}
        </aside>

        <CanvasStage api={stageApi} />

        <aside className="panel-right">
          <InspectorPanel
            sel={sel}
            elementCount={doc.elements.length}
            beginInteract={() => docRef.current}
            endInteract={(snap) => commitSnapshot(snap)}
            onDesignChange={(key, value) =>
              mutateSel((e) => ({ ...e, design: { ...e.design, [key]: value } }))
            }
            onName={(name) => mutateSel((e) => ({ ...e, name }), false)}
            onNote={(note) => mutateSel((e) => ({ ...e, note }), false)}
            onRandom={() => mutateSel((e) => ({ ...e, design: randomDesign() }))}
            onReset={() => mutateSel((e) => ({ ...e, design: { ...DEFAULT_DESIGN } }))}
            onDuplicate={duplicateSel}
            onDelete={() => selId && deleteEl(selId)}
          />
        </aside>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
