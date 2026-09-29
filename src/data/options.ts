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

/** 臉型：輪廓差異不依賴髮型或表情。 */
export const FACES: Option[] = [
  { id: 'round', label: '圓臉' },
  { id: 'oval', label: '鵝蛋臉' },
  { id: 'square', label: '方圓臉' },
  { id: 'heart', label: '心形臉' },
]

/** 髮型決定頭頂及後髮外輪廓；瀏海另外選。 */
export const HAIRS: Option[] = [
  { id: 'bald', label: '光頭' },
  { id: 'spiky', label: '刺刺短髮' },
  { id: 'bowl', label: '蘑菇頭' },
  { id: 'side', label: '俐落側分' },
  { id: 'bob', label: '齊下巴短髮' },
  { id: 'bun', label: '丸子頭' },
  { id: 'twintail', label: '雙馬尾' },
  { id: 'long', label: '長直髮' },
  { id: 'curly', label: '蓬鬆捲髮' },
]

export const BANGS: Option[] = [
  { id: 'auto', label: '隨髮型' },
  { id: 'open', label: '露額頭' },
  { id: 'straight', label: '齊瀏海' },
  { id: 'sweep', label: '側瀏海' },
  { id: 'wispy', label: '空氣瀏海' },
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

/** 五官拆開：眼、眉、口與臉頰可以任意組合。保留既有眼睛 id。 */
export const EYES: Option[] = [
  { id: 'cute', label: '圓亮眼' },
  { id: 'bright', label: '星星眼' },
  { id: 'smile', label: '彎彎眼' },
  { id: 'wink', label: '眨眨眼' },
  { id: 'cool', label: '沉穩眼' },
  { id: 'sleepy', label: '半瞇眼' },
]

/** 舊程式名稱保留為別名，資料格式不變。 */
export const EXPRS = EYES

export const BROWS: Option[] = [
  { id: 'soft', label: '柔和眉' },
  { id: 'raised', label: '驚喜眉' },
  { id: 'straight', label: '一字眉' },
  { id: 'determined', label: '精神眉' },
]

export const MOUTHS: Option[] = [
  { id: 'soft', label: '淺淺笑' },
  { id: 'grin', label: '露齒笑' },
  { id: 'open', label: '驚喜嘴' },
  { id: 'calm', label: '酷酷嘴' },
  { id: 'pout', label: '嘟嘟嘴' },
]

export const CHEEKS: Option[] = [
  { id: 'blush', label: '紅潤臉頰' },
  { id: 'freckles', label: '小雀斑' },
  { id: 'none', label: '自然無妝' },
]

/** 體型（制服完成後可沿用同樣尺寸錨點） */
export const BODIES: Option[] = [
  { id: 'slim', label: '纖瘦' },
  { id: 'normal', label: '標準' },
  { id: 'round', label: '圓潤' },
]

/** 依 id 取選項（找不到時回退第一項）；同時提供舊資料保護。 */
export function getOpt(list: Option[], id: string): Option {
  return list.find((o) => o.id === id) ?? list[0]
}
