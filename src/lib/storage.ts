import type { Design } from '../types'
import { DEFAULT_DESIGN } from '../types'

const CURRENT_KEY = 'doll.current.v1'
const DESIGNS_KEY = 'doll.designs.v1'

/** 已命名存檔的作品 */
export interface SavedDesign {
  id: string
  name: string
  design: Design
  updatedAt: number
}

/** 自動儲存目前的設計 */
export function saveCurrent(design: Design): void {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(design))
  } catch {
    /* 私隱模式等情況忽略 */
  }
}

/** 讀取目前的設計 */
export function loadCurrent(): Design | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    if (!raw) return null
    return normalize(JSON.parse(raw))
  } catch {
    return null
  }
}

/** 讀取所有已命名作品 */
export function loadDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(DESIGNS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function persistDesigns(list: SavedDesign[]): void {
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

/** 補上缺漏欄位，確保舊存檔不會讓畫面當掉 */
export function normalize(raw: unknown): Design {
  const d = (raw ?? {}) as Partial<Design>
  return {
    skin: typeof d.skin === 'string' ? d.skin : DEFAULT_DESIGN.skin,
    face: typeof d.face === 'string' ? d.face : DEFAULT_DESIGN.face,
    hair: typeof d.hair === 'string' ? d.hair : DEFAULT_DESIGN.hair,
    hairColor: typeof d.hairColor === 'string' ? d.hairColor : DEFAULT_DESIGN.hairColor,
    eyes: typeof d.eyes === 'string' ? d.eyes : DEFAULT_DESIGN.eyes,
    body: typeof d.body === 'string' ? d.body : DEFAULT_DESIGN.body,
  }
}
