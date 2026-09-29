import type { Design, Option } from '../types'
import { DEFAULT_DESIGN } from '../types'
import { BANGS, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS, getOpt } from '../data/options'

const idOr = (list: Option[], id: string, fallback: string) => list.some((o) => o.id === id) ? id : fallback

/** 同一份設計轉成頭部各素材層使用的安全 id／顏色。 */
export function headColors(design: Design) {
  return {
    skin: getOpt(SKINS, design.skin).color ?? '#f3c79c',
    hairColor: getOpt(HAIR_COLORS, design.hairColor).color ?? '#2e2a28',
    face: idOr(FACES, design.face, DEFAULT_DESIGN.face),
    hair: idOr(HAIRS, design.hair, DEFAULT_DESIGN.hair),
    bangs: idOr(BANGS, design.bangs, DEFAULT_DESIGN.bangs),
    eyes: idOr(EYES, design.eyes, DEFAULT_DESIGN.eyes),
    brows: idOr(BROWS, design.brows, DEFAULT_DESIGN.brows),
    mouth: idOr(MOUTHS, design.mouth, DEFAULT_DESIGN.mouth),
    cheeks: idOr(CHEEKS, design.cheeks, DEFAULT_DESIGN.cheeks),
  }
}

export type HeadColors = ReturnType<typeof headColors>
