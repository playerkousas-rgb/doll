/** 一份公仔設計 = 全部部位的選擇（純 JSON，可存檔、可放分享連結） */
export interface Design {
  /** 膚色 id */
  skin: string
  /** 臉型 id */
  face: string
  /** 髮型 id */
  hair: string
  /** 髮色 id */
  hairColor: string
  /** 表情（眼睛＋嘴）id */
  eyes: string
  /** 體型 id */
  body: string
}

export const DEFAULT_DESIGN: Design = {
  skin: 'natural',
  face: 'round',
  hair: 'spiky',
  hairColor: 'black',
  eyes: 'cute',
  body: 'normal',
}

/** 選項：id 對應中文標籤，顏色類選項帶 color */
export interface Option {
  id: string
  label: string
  color?: string
}
