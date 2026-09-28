/** 把畫布上的 SVG 匯出成高清 PNG 並下載 */
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
