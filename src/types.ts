/** 每隻公仔的造型資料；臉、五官和頭髮彼此獨立，可存檔及分享。 */
export interface Design {
  /** 膚色 id */
  skin: string
  /** 臉型 id */
  face: string
  /** 髮型（外輪廓／後髮）id */
  hair: string
  /** 瀏海 id；auto 依髮型選擇預設瀏海 */
  bangs: string
  /** 髮色 id */
  hairColor: string
  /** 眼睛 id（保留舊欄位名稱以相容存檔） */
  eyes: string
  /** 眉型 id */
  brows: string
  /** 嘴型 id */
  mouth: string
  /** 臉頰 id */
  cheeks: string
  /** 體型 id */
  body: string
  /** 青少年支部及陸／海／空制服 id；basic 只供舊造型相容 */
  uniform: string
  /** 按支部提供短褲、裙褲、長褲或半截裙 */
  uniformCut: string
  /** 戴帽或不戴帽；頭部特寫會暫時隱藏帽子，方便挑選髮型 */
  uniformHat: string
  /** 領巾；深資／樂行在典禮、儀式及會議亦可改戴所屬類別的領帶 */
  uniformNeckwear: string
  /** 旅巾底色與邊色是示意色，不代表總會核准的旅巾 */
  scarfColor: string
  scarfTrim: string
}

export const DEFAULT_DESIGN: Design = {
  skin: 'natural',
  face: 'round',
  hair: 'spiky',
  bangs: 'auto',
  hairColor: 'black',
  eyes: 'cute',
  brows: 'soft',
  mouth: 'soft',
  cheeks: 'blush',
  body: 'normal',
  uniform: 'scout-land',
  uniformCut: 'shorts',
  uniformHat: 'on',
  uniformNeckwear: 'scarf',
  scarfColor: '#b84648',
  scarfTrim: '#f0ce76',
}

/** 選項：id 對應中文標籤，顏色類選項帶 color */
export interface Option {
  id: string
  label: string
  color?: string
}
