import { useEffect, useState } from 'react'
import type { Design } from '../types'
import { buildPrompt } from '../lib/prompt'
import { buildShareLink } from '../lib/share'
import { copyText } from '../lib/export'
import type { SavedDesign } from '../lib/storage'

interface Props {
  design: Design
  saved: SavedDesign[]
  onSave: (name: string) => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

type Tab = 'prompt' | 'save' | 'share'

/** 右側：提示詞、存檔、分享 */
export default function OutputPanel({ design, saved, onSave, onLoad, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>('prompt')
  const [prompt, setPrompt] = useState(() => buildPrompt(design))
  const [edited, setEdited] = useState(false)
  const [copied, setCopied] = useState('')
  const [name, setName] = useState('')

  // 設計變動時重新產生提示詞（除非使用者正在手動編輯）
  useEffect(() => {
    if (!edited) setPrompt(buildPrompt(design))
  }, [design, edited])

  const flash = (msg: string) => {
    setCopied(msg)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const doCopy = async (text: string, tag: string) => {
    const ok = await copyText(text)
    flash(ok ? '已複製 ✓' : '複製失敗')
    if (ok && tag) setCopied('已複製 ✓')
  }

  const shareLink = buildShareLink(design)
  const dateFmt = (ts: number) => new Date(ts).toLocaleString('zh-HK', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="output-panel">
      <div className="tabs" role="tablist">
        {(
          [
            ['prompt', '提示詞'],
            ['save', '存檔'],
            ['share', '分享'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'prompt' && (
        <div className="tab-body">
          <p className="hint">
            把這段描述貼到 ChatGPT、Gemini 等 AI，就能生成更精緻的公仔圖。可先自行修改再複製。
          </p>
          <textarea
            className="prompt-box"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              setEdited(true)
            }}
            rows={9}
          />
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => doCopy(prompt, 'prompt')}>
              {copied || '複製提示詞'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setEdited(false)
                setPrompt(buildPrompt(design))
              }}
            >
              重新產生
            </button>
          </div>
        </div>
      )}

      {tab === 'save' && (
        <div className="tab-body">
          <p className="hint">作品只儲存在這部裝置的瀏覽器，不會上傳。</p>
          <div className="save-row">
            <input
              className="input"
              placeholder="作品名稱，例如：小明的公仔"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  onSave(name.trim())
                  setName('')
                }
              }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (!name.trim()) return
                onSave(name.trim())
                setName('')
              }}
            >
              儲存
            </button>
          </div>
          {saved.length === 0 ? (
            <p className="empty">還沒有存檔。</p>
          ) : (
            <ul className="save-list">
              {saved.map((s) => (
                <li key={s.id} className="save-item">
                  <div className="save-meta">
                    <span className="save-name">{s.name}</span>
                    <span className="save-date">{dateFmt(s.updatedAt)}</span>
                  </div>
                  <div className="save-actions">
                    <button type="button" className="btn btn-small" onClick={() => onLoad(s.id)}>
                      載入
                    </button>
                    <button type="button" className="btn btn-small btn-ghost" onClick={() => onDelete(s.id)}>
                      刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'share' && (
        <div className="tab-body">
          <p className="hint">
            連結內含完整設計資料，任何人打開都能看到這隻公仔，並可「以此為底圖」繼續改。
          </p>
          <textarea className="prompt-box link-box" value={shareLink} readOnly rows={4} onFocus={(e) => e.target.select()} />
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => doCopy(shareLink, 'link')}>
              {copied || '複製分享連結'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
