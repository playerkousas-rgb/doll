/**
 * 開發用：把 Character 渲染成一張 SVG 型錄，方便本地檢查畫風。
 * 用法：npx vite build --ssr scripts/render-preview.tsx --outDir .preview-build && node .preview-build/render-preview.js
 */
import { writeFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import Character from '../src/character/Character'
import type { Design } from '../src/types'
import { DEFAULT_DESIGN } from '../src/types'
import { BANGS, BODIES, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS } from '../src/data/options'
import { defaultCut, UNIFORMS } from '../src/data/uniforms'
import type { Pose } from '../src/character/pose'
import { POSE_PRESETS, poseFromPreset } from '../src/character/pose'

const base: Design = { ...DEFAULT_DESIGN }

const variants: { label: string; design: Design; pose?: Pose; vb?: string }[] = [
  { label: 'default', design: base },
  ...FACES.map((f) => ({ label: `face:${f.label}`, design: { ...base, face: f.id, hair: 'bald' } })),
  ...SKINS.map((s) => ({ label: `skin:${s.label}`, design: { ...base, skin: s.id, hair: 'bald' } })),
  ...EYES.map((e) => ({ label: `eyes:${e.label}`, design: { ...base, eyes: e.id, hair: 'bald' } })),
  ...BROWS.map((b) => ({ label: `brows:${b.label}`, design: { ...base, brows: b.id, hair: 'bald' } })),
  ...MOUTHS.map((m) => ({ label: `mouth:${m.label}`, design: { ...base, mouth: m.id, hair: 'bald' } })),
  ...CHEEKS.map((c) => ({ label: `cheeks:${c.label}`, design: { ...base, cheeks: c.id, hair: 'bald' } })),
  ...HAIRS.map((h) => ({ label: `hair:${h.label}`, design: { ...base, hair: h.id } })),
  ...BANGS.map((b) => ({ label: `bangs:${b.label}`, design: { ...base, hair: 'bob', bangs: b.id } })),
  ...HAIR_COLORS.map((c) => ({ label: `hairColor:${c.label}`, design: { ...base, hairColor: c.id, hair: 'long' } })),
  ...BODIES.map((b) => ({ label: `body:${b.label}`, design: { ...base, body: b.id } })),
  { label: 'combo:丸子頭粉紅', design: { ...base, hair: 'bun', hairColor: 'pink', bangs: 'open', eyes: 'wink', mouth: 'grin', skin: 'fair' } },
  { label: 'combo:雙馬尾棕', design: { ...base, hair: 'twintail', hairColor: 'brown', face: 'heart', cheeks: 'freckles', skin: 'ivory' } },
  { label: 'combo:側分酷', design: { ...base, hair: 'side', hairColor: 'silver', eyes: 'cool', brows: 'straight', mouth: 'calm', body: 'slim', skin: 'deep' } },
  // 五個青少年支部及陸／海／空：同一位角色展示配色、帽型和下身剪裁。
  ...UNIFORMS.filter((u) => u.id !== 'basic').map((u) => ({
    label: `uniform:${u.label}`, design: { ...base, uniform: u.id, uniformCut: defaultCut(u.id), uniformHat: u.id === 'grasshopper' ? 'off' : 'on' },
  })),
  { label: 'uniform:幼童軍裙褲', design: { ...base, uniform: 'cub', uniformCut: 'skort' } },
  { label: 'uniform:童軍裙褲', design: { ...base, uniform: 'scout-land', uniformCut: 'skort' } },
  { label: 'uniform:童軍冬季長褲', design: { ...base, uniform: 'scout-land', uniformCut: 'trousers' } },
  { label: 'uniform:深資及膝裙', design: { ...base, uniform: 'venture-land', uniformCut: 'skirt' } },
  { label: 'uniform:樂行海裙', design: { ...base, uniform: 'rover-sea', uniformCut: 'skirt' } },
  { label: 'uniform:深資棗紅領帶', design: { ...base, uniform: 'venture-land', uniformCut: 'trousers', uniformNeckwear: 'tie' } },
  { label: 'uniform:海童軍黑領帶', design: { ...base, uniform: 'rover-sea', uniformCut: 'skirt', uniformNeckwear: 'tie' } },
  { label: 'uniform:空童軍藍領帶', design: { ...base, uniform: 'rover-air', uniformCut: 'trousers', uniformNeckwear: 'tie' } },
  { label: 'uniform:不戴帽', design: { ...base, uniform: 'scout-land', uniformHat: 'off' } },
  ...POSE_PRESETS.map((p) => ({ label: `pose:${p.label}`, design: base, pose: poseFromPreset(p.id) })),
  { label: 'combo:長髮歡呼', design: { ...base, hair: 'long', hairColor: 'brown', body: 'round' }, pose: poseFromPreset('cheer') },
  { label: 'combo:丸子跨步', design: { ...base, hair: 'bun', eyes: 'smile', body: 'slim' }, pose: poseFromPreset('stride') },
  // 左側面板縮圖的取景檢查（與 OptionsPanel 相同的 viewBox）
  ...HAIRS.map((h) => ({
    label: `thumb髮:${h.label}`,
    design: { ...base, hair: h.id },
    vb: '47 -18 266 278',
  })),
  ...FACES.map((f) => ({
    label: `thumb臉:${f.label}`,
    design: { ...base, face: f.id, hair: 'bald' },
    vb: '70 4 220 222',
  })),
  ...EYES.map((e) => ({
    label: `thumb眼:${e.label}`,
    design: { ...base, eyes: e.id, hair: 'bald' },
    vb: '70 4 220 222',
  })),
  ...BANGS.map((b) => ({
    label: `thumb瀏海:${b.label}`,
    design: { ...base, hair: 'bob', bangs: b.id },
    vb: '70 4 220 222',
  })),
]

const COLS = 6
const CELL_W = 360
const CELL_H = 520
const rows = Math.ceil(variants.length / COLS)

const cells = variants
  .map((v, i) => {
    const x = (i % COLS) * CELL_W
    const y = Math.floor(i / COLS) * CELL_H
    const svg = renderToStaticMarkup(<Character design={v.design} pose={v.pose} viewBox={v.vb} />).replace(
      '<svg',
      `<svg width="${CELL_W - 40}" height="${CELL_H - 60}"`,
    )
    return `<g transform="translate(${x} ${y})">
      <rect x="4" y="4" width="${CELL_W - 8}" height="${CELL_H - 8}" fill="#fffdf7" stroke="#e2e7e3" rx="12"/>
      <g transform="translate(0 10)">${svg}</g>
      <text x="${CELL_W / 2}" y="${CELL_H - 14}" text-anchor="middle" font-size="22" fill="#243026">${v.label}</text>
    </g>`
  })
  .join('\n')

const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL_W}" height="${rows * CELL_H}" viewBox="0 0 ${COLS * CELL_W} ${rows * CELL_H}">
  <rect width="100%" height="100%" fill="#f4f7f4"/>
  ${cells}
</svg>`

writeFileSync('preview-sheet.svg', sheet)
console.log(`written preview-sheet.svg (${COLS * CELL_W}x${rows * CELL_H}, ${variants.length} cells)`)
