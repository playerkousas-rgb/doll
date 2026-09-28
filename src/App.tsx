import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Design } from './types'
import { DEFAULT_DESIGN } from './types'
import Character from './character/Character'
import OptionsPanel from './components/OptionsPanel'
import OutputPanel from './components/OutputPanel'
import { designFromHash, buildShareLink } from './lib/share'
import { loadCurrent, loadDesigns, normalize, persistDesigns, saveCurrent } from './lib/storage'
import type { SavedDesign } from './lib/storage'
import { exportPng } from './lib/export'
import { BODIES, EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS } from './data/options'

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

function initialDesign(): Design {
  const fromHash = designFromHash()
  if (fromHash) return fromHash
  const current = loadCurrent()
  if (current) return current
  return DEFAULT_DESIGN
}

export default function App() {
  const [design, setDesign] = useState<Design>(initialDesign)
  const [saved, setSaved] = useState<SavedDesign[]>(loadDesigns)
  const [zoom, setZoom] = useState(1)

  // 每次變更自動存進瀏覽器
  useEffect(() => {
    saveCurrent(design)
  }, [design])

  // 分享連結：開啟後清掉 hash，避免重新整理又蓋回舊設計
  useEffect(() => {
    if (window.location.hash.startsWith('#d=')) {
      const url = `${window.location.origin}${window.location.pathname}`
      window.history.replaceState(null, '', url)
    }
  }, [])

  const onChange = useCallback((key: keyof Design, value: string) => {
    setDesign((d) => ({ ...d, [key]: value }))
  }, [])

  const save = (name: string) => {
    const entry: SavedDesign = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      design: { ...design },
      updatedAt: Date.now(),
    }
    const next = [entry, ...saved]
    setSaved(next)
    persistDesigns(next)
  }

  const load = (id: string) => {
    const found = saved.find((s) => s.id === id)
    if (found) setDesign(normalize(found.design))
  }

  const remove = (id: string) => {
    const next = saved.filter((s) => s.id !== id)
    setSaved(next)
    persistDesigns(next)
  }

  const shareLink = useMemo(() => buildShareLink(design), [design])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-icon" aria-hidden>
            ⛺
          </span>
          <div>
            <h1>童軍公仔設計台</h1>
            <p className="tagline">旅團個人化童軍卡通公仔 · 換臉型・換髮型・換膚色（換衣、換章、換姿勢陸續登場）</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={() => setDesign(randomDesign())}>
            🎲 隨機
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setDesign(DEFAULT_DESIGN)}>
            ↺ 重設
          </button>
          <button type="button" className="btn btn-primary" onClick={() => exportPng('main-character')}>
            ⬇ 匯出 PNG
          </button>
        </div>
      </header>

      <main className="layout">
        <aside className="panel-left">
          <OptionsPanel design={design} onChange={onChange} />
        </aside>

        <section className="stage">
          <div className="stage-toolbar">
            <button type="button" className="btn btn-small" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}>
              −
            </button>
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="btn btn-small" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}>
              ＋
            </button>
            <button type="button" className="btn btn-small btn-ghost" onClick={() => setZoom(1)}>
              適合
            </button>
            <span className="spacer" />
            <button
              type="button"
              className="btn btn-small btn-ghost"
              onClick={() => {
                void navigator.clipboard?.writeText(shareLink)
              }}
              title="複製分享連結"
            >
              🔗 複製連結
            </button>
          </div>
          <div className="stage-canvas">
            <div className="character-frame" style={{ width: `${Math.round(460 * zoom)}px` }}>
              <Character design={design} svgId="main-character" />
            </div>
          </div>
        </section>

        <aside className="panel-right">
          <OutputPanel design={design} saved={saved} onSave={save} onLoad={load} onDelete={remove} />
        </aside>
      </main>
    </div>
  )
}
