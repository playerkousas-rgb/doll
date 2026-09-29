import type { Design, Option } from '../types'
import { DEFAULT_DESIGN } from '../types'
import { BANGS, BODIES, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS } from '../data/options'
import { UNIFORMS, UNIFORM_HATS, NECKWEAR, allowedCuts, defaultCut, uniformById, type UniformCut } from '../data/uniforms'

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

const valid = (list: Option[], id: unknown, fallback: string) =>
  typeof id === 'string' && list.some((o) => o.id === id) ? id : fallback

const validHex = (value: unknown, fallback: string) =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback

/** 補上臉部及制服欄位；沒有 uniform 的舊檔必須維持原有米白基礎衣物。 */
export function normalize(raw: unknown): Design {
  const d = (raw ?? {}) as Partial<Design>
  const eyes = valid(EYES, d.eyes, DEFAULT_DESIGN.eyes)
  const oldMouth = eyes === 'smile' ? 'grin' : eyes === 'cool' ? 'calm' : DEFAULT_DESIGN.mouth
  const uniform = d.uniform === undefined ? 'basic' : valid(UNIFORMS, d.uniform, DEFAULT_DESIGN.uniform)
  const uniformCut = typeof d.uniformCut === 'string' && allowedCuts(uniform).includes(d.uniformCut as UniformCut)
    ? d.uniformCut : defaultCut(uniform)
  return {
    skin: valid(SKINS, d.skin, DEFAULT_DESIGN.skin),
    face: valid(FACES, d.face, DEFAULT_DESIGN.face),
    hair: valid(HAIRS, d.hair, DEFAULT_DESIGN.hair),
    bangs: valid(BANGS, d.bangs, DEFAULT_DESIGN.bangs),
    hairColor: valid(HAIR_COLORS, d.hairColor, DEFAULT_DESIGN.hairColor),
    eyes,
    brows: valid(BROWS, d.brows, DEFAULT_DESIGN.brows),
    mouth: valid(MOUTHS, d.mouth, oldMouth),
    cheeks: valid(CHEEKS, d.cheeks, DEFAULT_DESIGN.cheeks),
    body: valid(BODIES, d.body, DEFAULT_DESIGN.body),
    uniform,
    uniformCut,
    uniformHat: valid(UNIFORM_HATS, d.uniformHat,
      uniform === 'basic' || uniform === 'grasshopper' ? 'off' : DEFAULT_DESIGN.uniformHat),
    uniformNeckwear: ['venture', 'rover'].includes(uniformById(uniform).section)
      ? valid(NECKWEAR, d.uniformNeckwear, DEFAULT_DESIGN.uniformNeckwear) : 'scarf',
    scarfColor: validHex(d.scarfColor, DEFAULT_DESIGN.scarfColor),
    scarfTrim: validHex(d.scarfTrim, DEFAULT_DESIGN.scarfTrim),
  }
}
