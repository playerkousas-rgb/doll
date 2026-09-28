/** 把畫布上的 SVG 匯出成高清 PNG 並下載 */
import type { Doc } from './canvas'
import { BOARD } from './canvas'
export function exportPng(svgId: string, filename = '公仔設計.png', scale = 3): void {
  const svg = document.getElementById(svgId)
  if (!(svg instanceof SVGElement)) return

  const clone = svg.cloneNode(true) as SVGElement
  const viewBox = clone.getAttribute('viewBox')?.split(/\s+/).map(Number)
  const w = (viewBox?.[2] ?? 360) * scale
  const h = (viewBox?.[3] ?? 480) * scale
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const xml = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fffdf7'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(url)
    canvas.toBlob((png) => {
      if (!png) return
      const a = document.createElement('a')
      const pngUrl = URL.createObjectURL(png)
      a.href = pngUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}

/** 複製文字到剪貼簿，回傳是否成功 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 剪貼簿不可用時退回傳統方法
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

/** 把整張畫布（所有可見公仔板）匯出成 PNG */
export async function exportCanvasPng(
  doc: Doc,
  bounds: { x: number; y: number; w: number; h: number },
  bg: string,
  scale = 2,
): Promise<boolean> {
  const pad = 36
  const W = (bounds.w + pad * 2) * scale
  const H = (bounds.h + pad * 2) * scale
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const dolls = doc.elements.filter((e) => !e.hidden)
  for (const el of dolls) {
    const bx = (el.x - bounds.x + pad) * scale
    const by = (el.y - bounds.y + pad) * scale

    // 卡片底
    ctx.save()
    ctx.shadowColor = 'rgba(36, 48, 38, 0.14)'
    ctx.shadowBlur = 18 * scale
    ctx.shadowOffsetY = 8 * scale
    roundRect(ctx, bx, by, BOARD.w * scale, BOARD.h * scale, 20 * scale)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()

    // 公仔 SVG
    const svg = document.getElementById(`doll-${el.id}`)
    if (svg instanceof SVGElement) {
      const clone = svg.cloneNode(true) as SVGElement
      clone.setAttribute('width', String(BOARD.dollW * 3))
      clone.setAttribute('height', String(BOARD.dollH * 3))
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const xml = new XMLSerializer().serializeToString(clone)
      const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
      try {
        const img = await loadImage(url)
        ctx.drawImage(
          img,
          (bx + BOARD.pad * scale) as number,
          (by + BOARD.pad * scale) as number,
          BOARD.dollW * scale,
          BOARD.dollH * scale,
        )
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    // 名稱標籤
    ctx.fillStyle = '#243026'
    ctx.font = `600 ${14 * scale}px "PingFang TC", "Microsoft JhengHei", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(el.name, bx + (BOARD.w * scale) / 2, by - 12 * scale)
  }

  return new Promise((resolve) => {
    canvas.toBlob((png) => {
      if (!png) return resolve(false)
      const a = document.createElement('a')
      const url = URL.createObjectURL(png)
      a.href = url
      a.download = '公仔畫布.png'
      a.click()
      URL.revokeObjectURL(url)
      resolve(true)
    }, 'image/png')
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
