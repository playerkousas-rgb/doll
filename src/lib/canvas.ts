import type { Design } from '../types'
import { DEFAULT_DESIGN } from '../types'
import type { Pose } from '../character/pose'
import { normalizePose, poseFromPreset } from '../character/pose'
import { normalize } from './storage'

/** 畫布上的元素（目前只有公仔板，之後會有文字、裝飾） */
export interface DollElement {
  id: string
  type: 'doll'
  name: string
  /** 公仔板左上角（世界座標） */
  x: number
  y: number
  design: Design
  /** 角色骨架關節（舊文件缺漏時會回退至自然站立） */
  pose: Pose
  /** 使用者備註（會寫進提示詞） */
  note: string
  hidden?: boolean
  locked?: boolean
}

/** 整份文件 = 畫布狀態（可存檔、可分享） */
export interface Doc {
  v: 1
  /** 畫布底色 id（對應 BG_PRESETS） */
  bg: string
  elements: DollElement[]
}

/** 公仔板幾何 */
export const BOARD = {
  w: 272,
  h: 388,
  pad: 16,
  dollW: 240,
  dollH: 320,
} as const

/** 畫布底色預設 */
export const BG_PRESETS = [
  { id: 'mint', label: '薄荷', color: '#edf5ef' },
  { id: 'gray', label: '淺灰', color: '#f0f1f3' },
  { id: 'cream', label: '奶油', color: '#f7f3ea' },
  { id: 'sky', label: '天藍', color: '#eaf2f8' },
  { id: 'sand', label: '沙灘', color: '#f6efe4' },
  { id: 'lilac', label: '淡紫', color: '#f1eef7' },
]

export function bgColor(doc: Doc): string {
  return BG_PRESETS.find((b) => b.id === doc.bg)?.color ?? BG_PRESETS[0].color
}

export const uid = (): string => Math.random().toString(36).slice(2, 10)

export function newDoll(design: Design = DEFAULT_DESIGN, name = '', x = 0, y = 0): DollElement {
  return { id: uid(), type: 'doll', name, x, y, design: { ...design }, pose: poseFromPreset('stand'), note: '' }
}

/** 自動命名：公仔1、公仔2…… */
export function nextName(elements: DollElement[]): string {
  const used = new Set(elements.map((e) => e.name))
  for (let i = 1; ; i++) {
    const n = `公仔${i}`
    if (!used.has(n)) return n
  }
}

export function createStarterDoc(): Doc {
  const doll = newDoll(DEFAULT_DESIGN, '公仔1', 120, 120)
  return { v: 1, bg: 'mint', elements: [doll] }
}

/** 所有可見元素的邊界 */
export function docBounds(doc: Doc): { x: number; y: number; w: number; h: number } | null {
  const els = doc.elements.filter((e) => !e.hidden)
  if (els.length === 0) return null
  const x = Math.min(...els.map((e) => e.x))
  const y = Math.min(...els.map((e) => e.y))
  const x2 = Math.max(...els.map((e) => e.x + BOARD.w))
  const y2 = Math.max(...els.map((e) => e.y + BOARD.h))
  return { x, y, w: x2 - x, h: y2 - y }
}

const DOC_KEY = 'doll.canvas.v1'
const LEGACY_KEY = 'doll.current.v1'

export function saveDoc(doc: Doc): void {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(doc))
  } catch {
    /* 私隱模式等情況忽略 */
  }
}

export function loadDoc(): Doc | null {
  try {
    const raw = localStorage.getItem(DOC_KEY)
    if (!raw) return null
    return normalizeDoc(JSON.parse(raw))
  } catch {
    return null
  }
}

/** 舊版「單一設計」存檔 → 轉成一份文件 */
export function legacyDoc(): Doc | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const design = normalize(JSON.parse(raw))
    const doll = newDoll(design, '公仔1', 120, 120)
    return { v: 1, bg: 'mint', elements: [doll] }
  } catch {
    return null
  }
}

/** 嘗試把任意 JSON 修成合法 Doc（未來改格式靠這裡相容舊檔） */
export function normalizeDoc(raw: unknown): Doc {
  const d = (raw ?? {}) as Partial<Doc>
  const elements: DollElement[] = Array.isArray(d.elements)
    ? d.elements
        .filter((e): e is DollElement => !!e && typeof e === 'object' && e.type === 'doll')
        .map((e) => ({
          id: typeof e.id === 'string' && e.id ? e.id : uid(),
          type: 'doll' as const,
          name: typeof e.name === 'string' ? e.name : '公仔',
          x: Number.isFinite(e.x) ? Number(e.x) : 0,
          y: Number.isFinite(e.y) ? Number(e.y) : 0,
          design: normalize(e.design),
          pose: normalizePose(e.pose),
          note: typeof e.note === 'string' ? e.note : '',
          hidden: !!e.hidden,
          locked: !!e.locked,
        }))
    : []
  const bg = typeof d.bg === 'string' && BG_PRESETS.some((b) => b.id === d.bg) ? d.bg : BG_PRESETS[0].id
  return { v: 1, bg, elements }
}
