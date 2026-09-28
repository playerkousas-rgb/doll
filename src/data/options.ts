import type { Option } from '../types'

/** 膚色 */
export const SKINS: Option[] = [
  { id: 'ivory', label: '白皙', color: '#ffe9dc' },
  { id: 'fair', label: '粉嫩', color: '#fbd8bd' },
  { id: 'natural', label: '自然', color: '#f3c79c' },
  { id: 'wheat', label: '小麥', color: '#e0a971' },
  { id: 'bronze', label: '古銅', color: '#c08048' },
  { id: 'deep', label: '深棕', color: '#8d5a33' },
]

/** 臉型 */
export const FACES: Option[] = [
  { id: 'round', label: '圓臉' },
  { id: 'oval', label: '橢圓臉' },
  { id: 'square', label: '方圓臉' },
  { id: 'heart', label: '心形臉' },
]

/** 髮型 */
export const HAIRS: Option[] = [
  { id: 'bald', label: '光頭' },
  { id: 'spiky', label: '刺刺頭' },
  { id: 'bowl', label: '蘑菇頭' },
  { id: 'side', label: '側分髮' },
  { id: 'bob', label: '短波波' },
  { id: 'bun', label: '丸子頭' },
  { id: 'twintail', label: '雙馬尾' },
  { id: 'long', label: '長直髮' },
]

/** 髮色 */
export const HAIR_COLORS: Option[] = [
  { id: 'black', label: '烏黑', color: '#2e2a28' },
  { id: 'darkbrown', label: '深棕', color: '#50372a' },
  { id: 'brown', label: '棕色', color: '#8a5a34' },
  { id: 'gold', label: '金色', color: '#e3b54a' },
  { id: 'red', label: '紅棕', color: '#b3542a' },
  { id: 'silver', label: '銀灰', color: '#b8bec6' },
  { id: 'pink', label: '粉紅', color: '#e88bb0' },
]

/** 表情（眼睛＋嘴） */
export const EXPRS: Option[] = [
  { id: 'cute', label: '可愛圓眼' },
  { id: 'smile', label: '瞇眼微笑' },
  { id: 'wink', label: '眨眨眼' },
  { id: 'cool', label: '酷酷眼' },
]

/** 體型 */
export const BODIES: Option[] = [
  { id: 'slim', label: '纖瘦' },
  { id: 'normal', label: '標準' },
  { id: 'round', label: '圓潤' },
]

/** 依 id 取選項（找不到時回退第一項） */
export function getOpt(list: Option[], id: string): Option {
  return list.find((o) => o.id === id) ?? list[0]
}
