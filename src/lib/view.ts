import type { Doc } from './canvas'
import { BOARD, docBounds } from './canvas'

export interface View {
  x: number
  y: number
  z: number
}

/** 適合畫面的計算（給 fit 用） */
export function fitView(stage: HTMLDivElement, doc: Doc): View {
  const r = stage.getBoundingClientRect()
  const b = docBounds(doc)
  if (!b) {
    return {
      z: 1,
      x: r.width / 2 - BOARD.w / 2,
      y: r.height / 2 - BOARD.h / 2,
    }
  }
  const pad = 72
  const z = Math.min((r.width - pad * 2) / b.w, (r.height - pad * 2) / b.h, 1.4)
  const z2 = Math.min(2.5, Math.max(0.15, z))
  return {
    z: z2,
    x: (r.width - b.w * z2) / 2 - b.x * z2,
    y: (r.height - b.h * z2) / 2 - b.y * z2,
  }
}
