import type { Design } from '../types'
import { BODIES, EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS, getOpt } from '../data/options'

/**
 * 產生通用中文生圖 prompt（可貼給 ChatGPT、Gemini 等生成更精緻的版本）
 * note 為使用者對這隻公仔的專屬備註，會一併寫進去。
 */
export function buildPrompt(design: Design, note = ''): string {
  const skin = getOpt(SKINS, design.skin).label
  const face = getOpt(FACES, design.face).label
  const hair = getOpt(HAIRS, design.hair).label
  const hairColor = getOpt(HAIR_COLORS, design.hairColor).label
  const expr = getOpt(EXPRS, design.eyes).label
  const body = getOpt(BODIES, design.body).label

  const hairDesc = design.hair === 'bald' ? '光頭' : `${hairColor}的${hair}`

  const parts = [
    `一隻可愛的 Q 版卡通公仔角色，${face}、${body}身材，膚色${skin}，${hairDesc}，${expr}表情，`,
    `穿着白色背心和白色短褲，正面站立、雙手放在身側，全身入鏡，`,
    `乾淨俐落的向量插畫風格，柔和的深棕色描邊，簡單的淺色背景，`,
    `童軍主題角色設計，可愛圓潤，適合做旅團公仔。`,
  ]
  if (note.trim()) {
    parts.push(`另外注意：${note.trim()}`)
  }
  return parts.join('')
}
