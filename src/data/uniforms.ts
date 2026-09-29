import type { Design } from '../types'

/** 香港童軍總會青少年成員制服頁（文字規格）；插畫色值僅作近似，並非官方色碼。 */
export const UNIFORM_SOURCES = {
  grasshopper: 'https://www.scout.org.hk/tc/youth-members/grasshopper-scouts/index.html?sid=2',
  cub: 'https://www.scout.org.hk/tc/youth-members/cub-scouts/index.html?sid=2',
  scout: 'https://www.scout.org.hk/tc/youth-members/scouts/index.html?sid=2',
  venture: 'https://www.scout.org.hk/tc/youth-members/venture-scouts/index.html?sid=2',
  rover: 'https://www.scout.org.hk/tc/youth-members/rover-scouts/index.html?sid=2',
  handbook: 'https://uniform.scouting.org.hk/toc/',
  scarf: 'https://uniform.scouting.org.hk/wp-content/uploads/2017/03/uniformhandbook_p107-114.pdf',
} as const

export type YouthSection = 'basic' | 'grasshopper' | 'cub' | 'scout' | 'venture' | 'rover'
export type Branch = 'land' | 'sea' | 'air'
export type UniformCut = 'shorts' | 'skort' | 'trousers' | 'skirt'

export interface UniformOption {
  id: string
  label: string
  section: YouthSection
  branch: Branch
  /** 官方來源；舊版基礎衣物沒有對應的正式制服。 */
  source?: string
}

export const UNIFORMS: UniformOption[] = [
  { id: 'basic', label: '舊版基礎衣物', section: 'basic', branch: 'land' },
  { id: 'grasshopper', label: '小童軍集會服裝', section: 'grasshopper', branch: 'land', source: UNIFORM_SOURCES.grasshopper },
  { id: 'cub', label: '幼童軍', section: 'cub', branch: 'land', source: UNIFORM_SOURCES.cub },
  { id: 'scout-land', label: '童軍', section: 'scout', branch: 'land', source: UNIFORM_SOURCES.scout },
  { id: 'scout-sea', label: '海童軍', section: 'scout', branch: 'sea', source: UNIFORM_SOURCES.scout },
  { id: 'scout-air', label: '空童軍', section: 'scout', branch: 'air', source: UNIFORM_SOURCES.scout },
  { id: 'venture-land', label: '深資童軍', section: 'venture', branch: 'land', source: UNIFORM_SOURCES.venture },
  { id: 'venture-sea', label: '深資海童軍', section: 'venture', branch: 'sea', source: UNIFORM_SOURCES.venture },
  { id: 'venture-air', label: '深資空童軍', section: 'venture', branch: 'air', source: UNIFORM_SOURCES.venture },
  { id: 'rover-land', label: '樂行童軍', section: 'rover', branch: 'land', source: UNIFORM_SOURCES.rover },
  { id: 'rover-sea', label: '樂行海童軍', section: 'rover', branch: 'sea', source: UNIFORM_SOURCES.rover },
  { id: 'rover-air', label: '樂行空童軍', section: 'rover', branch: 'air', source: UNIFORM_SOURCES.rover },
]

export const UNIFORM_HATS = [
  { id: 'on', label: '戴帽' },
  { id: 'off', label: '不戴帽' },
]

export const NECKWEAR = [
  { id: 'scarf', label: '旅巾' },
  { id: 'tie', label: '領帶（典禮／會議）' },
]

/** 深資／樂行之領帶：陸裝按支部，海／空按類別。 */
export function tieColor(id: string): { label: string; color: string } {
  const { section, branch } = uniformById(id)
  if (branch === 'sea') return { label: '黑色', color: '#26282a' }
  if (branch === 'air') return { label: '深藍色', color: '#243d5c' }
  if (section === 'venture') return { label: '棗紅色', color: '#843e4a' }
  return { label: '深綠色', color: '#2e5545' }
}

export const CUT_LABELS: Record<UniformCut, string> = {
  shorts: '短褲',
  skort: '裙褲',
  trousers: '長褲',
  skirt: '及膝半截裙',
}

export function uniformById(id: string): UniformOption {
  return UNIFORMS.find((u) => u.id === id) ?? UNIFORMS[0]
}

/** 童軍長褲只限全團冬季安排；深資／樂行長褲亦供女性動態活動使用。 */
export function allowedCuts(id: string): UniformCut[] {
  const { section } = uniformById(id)
  if (section === 'cub') return ['shorts', 'skort']
  if (section === 'scout') return ['shorts', 'skort', 'trousers']
  if (section === 'venture' || section === 'rover') return ['trousers', 'skirt']
  if (section === 'grasshopper') return ['shorts', 'trousers']
  return ['shorts']
}

export function defaultCut(id: string): UniformCut {
  const { section } = uniformById(id)
  return section === 'venture' || section === 'rover' ? 'trousers' : 'shorts'
}

export function selectUniform(design: Design, id: string): Design {
  const uniform = uniformById(id).id
  const uniformCut = allowedCuts(uniform).includes(design.uniformCut as UniformCut)
    ? design.uniformCut : defaultCut(uniform)
  const senior = ['venture', 'rover'].includes(uniformById(uniform).section)
  return { ...design, uniform, uniformCut, uniformHat: uniform === 'grasshopper' || uniform === 'basic' ? 'off' : 'on',
    uniformNeckwear: senior ? design.uniformNeckwear : 'scarf' }
}

export interface UniformPalette {
  shirt: string
  shirtShade: string
  bottom: string
  bottomShade: string
  sock: string
  hat: string
  hatTrim: string
  shoe: string
}

/** 官網只給顏色名稱，以下 HEX 是供 SVG 插畫顯示的近似配色，非總會指定色碼。 */
const COLORS: Record<Branch, UniformPalette> = {
  land: {
    shirt: '#ead6b5', shirtShade: '#d8be94', bottom: '#83965d', bottomShade: '#64794b',
    sock: '#475e41', hat: '#2d5443', hatTrim: '#1d3c33', shoe: '#25292b',
  },
  sea: {
    shirt: '#faf9f5', shirtShade: '#d7dce0', bottom: '#293e5a', bottomShade: '#1d304b',
    sock: '#293e5a', hat: '#f4f5f0', hatTrim: '#273b55', shoe: '#25292b',
  },
  air: {
    shirt: '#c5d9e5', shirtShade: '#9eb6ca', bottom: '#293e5a', bottomShade: '#1d304b',
    sock: '#293e5a', hat: '#7189a0', hatTrim: '#4f6883', shoe: '#25292b',
  },
}

export interface UniformKit {
  palette: UniformPalette
  cut: UniformCut
  grasshopper: boolean
  scarfColor: string
  scarfTrim: string
  neckwear: string
  tieColor: string
}

export function uniformKit(design: Design): UniformKit {
  const cut = allowedCuts(design.uniform).includes(design.uniformCut as UniformCut)
    ? design.uniformCut as UniformCut : defaultCut(design.uniform)
  return {
    palette: uniformPalette(design.uniform),
    cut,
    grasshopper: uniformById(design.uniform).section === 'grasshopper',
    scarfColor: design.scarfColor,
    scarfTrim: design.scarfTrim,
    neckwear: design.uniformNeckwear,
    tieColor: tieColor(design.uniform).color,
  }
}

export function uniformPalette(id: string): UniformPalette {
  const { section, branch } = uniformById(id)
  if (section === 'grasshopper') return {
    shirt: '#e8914f', shirtShade: '#d47639', bottom: '#51646b', bottomShade: '#3e5158',
    sock: '#495258', hat: '#e8914f', hatTrim: '#bf6b34', shoe: '#3c5460',
  }
  if (section === 'venture' && branch === 'land') return { ...COLORS.land, hat: '#913f4d', hatTrim: '#642b38' }
  return COLORS[branch]
}

export function uniformDetails(design: Pick<Design, 'uniform' | 'uniformCut' | 'uniformNeckwear'>) {
  const { section, branch, label } = uniformById(design.uniform)
  const cut = CUT_LABELS[design.uniformCut as UniformCut] ?? CUT_LABELS[defaultCut(design.uniform)]
  if (section === 'basic') return '舊版米白上衣、短褲與球鞋（非正式制服）'
  if (section === 'grasshopper') return `橙色活動服或單色上衣、單色${cut}、運動鞋；並非正式制服`
  const shirt = branch === 'sea' ? '白色' : branch === 'air' ? '淺藍色' : '杏色'
  const bottom = branch === 'land' ? '草青色' : '深藍色'
  const socks = design.uniformCut === 'skirt' ? '肉色襪褲' : design.uniformCut === 'trousers' ? '黑色短襪' : (branch === 'land' ? '深草青色長襪' : '深藍色長襪')
  const hat = section === 'cub' ? (design.uniformCut === 'skort' ? '深綠色有邊圓帽' : '深綠色黃間條鴨舌帽')
    : branch === 'sea' ? '白頂海童軍帽' : branch === 'air' ? '灰藍色軟帽'
      : section === 'venture' ? '棗紅色軟帽' : '深綠色軟帽'
  const neck = design.uniformNeckwear === 'tie' && (section === 'venture' || section === 'rover')
    ? `${tieColor(design.uniform).label}領帶` : '旅巾（顏色按所屬旅）'
  return `${label}：${shirt}短袖恤衫、${bottom}${cut}、${socks}、${hat}、棕色皮帶、黑色皮鞋、${neck}`
}
