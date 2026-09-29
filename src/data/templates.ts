import type { Design } from '../types'
import { DEFAULT_DESIGN } from '../types'

/** 新增公仔時的模板 */
export interface DollTemplate {
  key: string
  label: string
  design: Design
}

export const DOLL_TEMPLATES: DollTemplate[] = [
  { key: 'blank', label: '新公仔', design: DEFAULT_DESIGN },
  {
    key: 'boy',
    label: '幼童軍',
    design: { ...DEFAULT_DESIGN, uniform: 'cub', hair: 'bowl', hairColor: 'darkbrown', skin: 'wheat', eyes: 'cute' },
  },
  {
    key: 'girl',
    label: '童軍裙褲',
    design: { ...DEFAULT_DESIGN, uniformCut: 'skort', hair: 'twintail', hairColor: 'brown', face: 'heart', eyes: 'smile', mouth: 'grin', skin: 'fair', body: 'slim' },
  },
  {
    key: 'cool',
    label: '空童軍',
    design: { ...DEFAULT_DESIGN, uniform: 'scout-air', hair: 'side', hairColor: 'silver', eyes: 'cool', brows: 'straight', mouth: 'calm', cheeks: 'none', skin: 'deep', body: 'slim' },
  },
  {
    key: 'curly',
    label: '深資童軍',
    design: { ...DEFAULT_DESIGN, uniform: 'venture-land', uniformCut: 'trousers', hair: 'curly', hairColor: 'brown', eyes: 'bright', mouth: 'grin', cheeks: 'freckles', skin: 'bronze', body: 'round' },
  },
]
