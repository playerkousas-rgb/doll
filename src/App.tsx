import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Design } from './types'
import { DEFAULT_DESIGN } from './types'
import { BANGS, BODIES, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS } from './data/options'
import { UNIFORMS, defaultCut, selectUniform } from './data/uniforms'
import type { JointKey, PosePresetId } from './character/pose'
import { mirrorPose, poseFromPreset, setPoseJoint } from './character/pose'
import CanvasStage from './components/CanvasStage'
import type { StageApi } from './components/CanvasStage'
import type { View } from './lib/view'
import { fitView } from './lib/view'
import PartsPanel from './components/PartsPanel'
import type { DollTemplate } from './data/templates'
import LayersPanel from './components/LayersPanel'
import BgPanel from './components/BgPanel'
import InspectorPanel from './components/InspectorPanel'
import type { InspectorTab } from './components/InspectorPanel'
import type { DesignSection } from './components/OptionsPanel'
import { Icon } from './components/Icons'
import { P } from './components/iconPaths'
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
  const hair = pick(HAIRS).id
  const uniform = pick(UNIFORMS.filter((u) => u.id !== 'basic')).id
  return {
    ...DEFAULT_DESIGN,
    skin: pick(SKINS).id,
    face: pick(FACES).id,
    hair,
    bangs: hair === 'bald' ? 'auto' : pick(BANGS).id,
    hairColor: pick(HAIR_COLORS).id,
    eyes: pick(EYES).id,
    brows: pick(BROWS).id,
    mouth: pick(MOUTHS).id,
    cheeks: pick(CHEEKS).id,
    body: pick(BODIES).id,
    uniform,
    uniformCut: defaultCut(uniform),
    uniformHat: uniform === 'grasshopper' ? 'off' : 'on',
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
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('props')
  const [designSection, setDesignSection] = useState<DesignSection>('face')
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
      if (!id) return
      const apply = (d: Doc): Doc => {
        let changed = false
        const elements = d.elements.map((e) => {
          if (e.id !== id) return e
          const next = fn(e)
          if (next !== e) changed = true
          return next
        })
        return changed ? { ...d, elements } : d
      }
      if (discrete) commit(apply)
      else setDoc(apply)
    },
    [selId, commit],
  )

  /** 姿勢範本與畫布骨架、滑桿共用同一份 Pose；拖曳時在放開後才入歷史。 */
  const changeJoint = useCallback((id: string, key: JointKey, angle: number, discrete: boolean) => {
    const apply = (d: Doc): Doc => {
      let changed = false
      const elements = d.elements.map((e) => {
        if (e.id !== id) return e
        const pose = setPoseJoint(e.pose, key, angle)
        if (pose === e.pose) return e
        changed = true
        return { ...e, pose }
      })
      return changed ? { ...d, elements } : d
    }
    if (discrete) commit(apply)
    else setDoc(apply)
  }, [commit])

  const applyPosePreset = useCallback((id: PosePresetId) => {
    if (!selId) {
      showToast('請先點選畫布上的一隻公仔')
      return
    }
    mutateSel((e) => e.pose.preset === id ? e : { ...e, pose: poseFromPreset(id) })
    setInspectorTab('pose')
    setRightOpen(true)
    setTool('select')
  }, [selId, mutateSel, showToast])

  const applyUniform = useCallback((id: string) => {
    if (!selId) {
      showToast('請先點選畫布上的一隻公仔')
      return
    }
    mutateSel((e) => ({ ...e, design: selectUniform(e.design, id) }))
    setInspectorTab('props')
    setDesignSection('uniform')
    setRightOpen(true)
  }, [selId, mutateSel, showToast])

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
      pose: { preset: el.pose.preset, joints: { ...el.pose.joints } },
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
    poseMode: rightOpen && inspectorTab === 'pose',
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    stageRef,
    setTool,
    setView,
    select,
    moveEl,
    snapshot: () => docRef.current,
    commitSnapshot,
    onJoint: changeJoint,
    onPoseMode: () => {
      setInspectorTab(rightOpen && inspectorTab === 'pose' ? 'props' : 'pose')
      setRightOpen(true)
      setTool('select')
    },
    addAt,
    addCenter,
    undo,
    redo,
    fit,
    zoomBy,
    togglePreview,
    leftOpen,
    rightOpen,
    onOpenLeft: () => setLeftOpen(true),
    onOpenRight: () => setRightOpen(true),
  }
  // histVer 讓 canUndo/canRedo 在歷史變動時重算
  void histVer

  /** 左欄圖示：再點一次同一顆 = 收合面板 */
  const railViewBtn = (id: LeftView, icon: string, label: string) => {
    const active = leftView === id && leftOpen
    return (
      <button
        key={id}
        type="button"
        className={`rail-btn ${active ? 'is-active' : ''}`}
        title={label}
        aria-label={label}
        onClick={() => {
          if (leftView === id && leftOpen) setLeftOpen(false)
          else {
            setLeftView(id)
            setLeftOpen(true)
          }
        }}
      >
        <Icon d={icon} />
      </button>
    )
  }

  return (
    <div className={`app ${preview ? 'is-preview' : ''}`}>
      <div className={`body ${inspectorTab === 'pose' ? 'body--pose' : ''}`}>
        {/* ── 最左圖示欄（logo＋面板切換＋匯出分享） ── */}
        <nav className="rail" aria-label="面板切換">
          <span className="rail-logo" title="童軍公仔設計台">
            <Icon d={P.tent} size={21} strokeWidth={2} />
          </span>
          {railViewBtn('parts', P.person, '零件庫')}
          {railViewBtn('layers', P.layers, '圖層')}
          {railViewBtn('bg', P.palette, '背景')}
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
          <button type="button" className="rail-btn" title="匯出 PNG" aria-label="匯出 PNG" onClick={onExport}>
            <Icon d={P.download} />
          </button>
          <button type="button" className="rail-btn" title="分享連結" aria-label="分享連結" onClick={onShare}>
            <Icon d={P.share} />
          </button>
        </nav>

        {/* ── 左面板 ── */}
        {leftOpen && (
          <aside className="panel-left">
            {leftView === 'parts' && (
              <PartsPanel
                selectedDesign={sel?.design ?? null}
                selectedPose={sel?.pose.preset ?? null}
                onPose={applyPosePreset}
                onUniform={applyUniform}
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
            {leftView === 'bg' && <BgPanel bg={doc.bg} onBg={(id) => commit((d) => ({ ...d, bg: id }))} />}
          </aside>
        )}

        <CanvasStage api={stageApi} />

        {/* ── 右面板 ── */}
        {rightOpen && (
          <aside className="panel-right">
            <InspectorPanel
              key={sel?.id ?? 'empty'}
              sel={sel}
              elementCount={doc.elements.length}
              tab={inspectorTab}
              onTab={(tab) => { setInspectorTab(tab); if (tab === 'pose') setTool('select') }}
              sectionId={designSection}
              onSection={setDesignSection}
              beginInteract={() => docRef.current}
              endInteract={(snap) => commitSnapshot(snap)}
              onDesignChange={(key, value) => mutateSel((e) => ({
                ...e, design: key === 'uniform' ? selectUniform(e.design, value) : { ...e.design, [key]: value },
              }))}
              onPosePreset={applyPosePreset}
              onPoseJoint={(key, angle, discrete) => { if (selId) changeJoint(selId, key, angle, discrete) }}
              onMirrorPose={() => mutateSel((e) => ({ ...e, pose: mirrorPose(e.pose) }))}
              onResetPose={() => applyPosePreset('stand')}
              onName={(name) => mutateSel((e) => ({ ...e, name }), false)}
              onNote={(note) => mutateSel((e) => ({ ...e, note }), false)}
              onRandom={() => mutateSel((e) => ({ ...e, design: randomDesign() }))}
              onReset={() => mutateSel((e) => ({ ...e, design: { ...DEFAULT_DESIGN } }))}
              onDuplicate={duplicateSel}
              onDelete={() => selId && deleteEl(selId)}
              onCollapse={() => setRightOpen(false)}
            />
          </aside>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
