import type { Design } from '../types'
import { normalize } from './storage'

/** 把設計編碼成可放進 URL 的字串（base64url，支援 UTF-8） */
export function encodeDesign(design: Design): string {
  const bytes = new TextEncoder().encode(JSON.stringify(design))
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** 從分享連結字串解碼設計；失敗回傳 null */
export function decodeDesign(encoded: string): Design | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return normalize(JSON.parse(json))
  } catch {
    return null
  }
}

/** 產生目前設計的分享連結 */
export function buildShareLink(design: Design): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#d=${encodeDesign(design)}`
}

/** 從目前網址讀取分享資料（開頁時套用） */
export function designFromHash(): Design | null {
  const hash = window.location.hash
  const m = hash.match(/[#&]d=([^&]+)/)
  if (!m) return null
  return decodeDesign(m[1])
}
