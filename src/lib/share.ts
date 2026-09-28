import type { Design } from '../types'
import { normalize } from './storage'
import type { Doc } from './canvas'
import { newDoll, normalizeDoc } from './canvas'

/** 把資料編碼成可放進 URL 的字串（base64url，支援 UTF-8） */
function encode(data: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode<T>(encoded: string, fix: (raw: unknown) => T): T | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return fix(JSON.parse(json))
  } catch {
    return null
  }
}

/** 舊版：單一設計的分享編碼 */
export function encodeDesign(design: Design): string {
  return encode(design)
}

export function decodeDesign(encoded: string): Design | null {
  return decode(encoded, normalize)
}

/** 整份畫布文件的分享編碼 */
export function encodeDoc(doc: Doc): string {
  return encode(doc)
}

export function decodeDoc(encoded: string): Doc | null {
  return decode(encoded, normalizeDoc)
}

/** 產生目前畫布的分享連結 */
export function buildShareLink(doc: Doc): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#c=${encodeDoc(doc)}`
}

/** 從目前網址讀取分享資料（開頁時套用）；相容舊版 #d= */
export function docFromHash(): Doc | null {
  const hash = window.location.hash
  const c = hash.match(/[#&]c=([^&]+)/)
  if (c) return decodeDoc(c[1])
  const d = hash.match(/[#&]d=([^&]+)/)
  if (d) {
    const design = decodeDesign(d[1])
    if (design) {
      return { v: 1, bg: 'mint', elements: [newDoll(design, '公仔1', 120, 120)] }
    }
  }
  return null
}

/** 讀取 hash 後清掉，避免重新整理又蓋掉目前狀態 */
export function clearHash(): void {
  if (window.location.hash) {
    const url = `${window.location.origin}${window.location.pathname}`
    window.history.replaceState(null, '', url)
  }
}
