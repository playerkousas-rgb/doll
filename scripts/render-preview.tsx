/**
 * 開發用：把 Character 渲染成一張 SVG 型錄，方便本地檢查畫風。
 * 用法：npx vite build --ssr scripts/render-preview.tsx --outDir .preview-build && node .preview-build/render-preview.js
 */
import { writeFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import Character from '../src/character/Character'
import type { Design } from '../src/types'
import { DEFAULT_DESIGN } from '../src/types'
import { BODIES, EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS } from '../src/data/options'

const base: Design = { ...DEFAULT_DESIGN }

const variants: { label: string; design: Design; vb?: string }[] = [
  { label: 'default', design: base },
  ...HAIRS.map((h) => ({ label: `hair:${h.label}`, design: { ...base, hair: h.id } })),
  ...FACES.map((f) => ({ label: `face:${f.label}`, design: { ...base, face: f.id, hair: 'bald' } })),
  ...EXPRS.map((e) => ({ label: `eyes:${e.label}`, design: { ...base, eyes: e.id, hair: 'bald' } })),
  ...BODIES.map((b) => ({ label: `body:${b.label}`, design: { ...base, body: b.id } })),
  ...SKINS.map((s) => ({ label: `skin:${s.label}`, design: { ...base, skin: s.id } })),
  ...HAIR_COLORS.map((c) => ({ label: `hairColor:${c.label}`, design: { ...base, hairColor: c.id, hair: 'long' } })),
  { label: 'combo:丸子頭粉紅', design: { ...base, hair: 'bun', hairColor: 'pink', eyes: 'wink', skin: 'fair' } },
  { label: 'combo:雙馬尾棕', design: { ...base, hair: 'twintail', hairColor: 'brown', face: 'heart', skin: 'ivory' } },
  { label: 'combo:側分酷', design: { ...base, hair: 'side', hairColor: 'silver', eyes: 'cool', body: 'slim', skin: 'deep' } },
  // 左側面板縮圖的取景檢查（與 OptionsPanel 相同的 viewBox）
  ...HAIRS.map((h) => ({
    label: `thumb髮:${h.label}`,
    design: { ...base, hair: h.id },
    vb: '48 -4 264 262',
  })),
  ...FACES.map((f) => ({
    label: `thumb臉:${f.label}`,
    design: { ...base, face: f.id, hair: 'bald' },
    vb: '76 -2 208 212',
  })),
  ...EXPRS.map((e) => ({
    label: `thumb眼:${e.label}`,
    design: { ...base, eyes: e.id, hair: 'bald' },
    vb: '76 -2 208 212',
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
    const svg = renderToStaticMarkup(<Character design={v.design} viewBox={v.vb} />).replace(
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
