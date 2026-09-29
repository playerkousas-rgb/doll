import type { HeadColors } from './palette'
import Face from './Face'
import { FrontHair } from './Hair'
import UniformHat from './UniformHat'

/** 頭部順序：臉與五官 → 頭頂／瀏海 → 選配的制服帽；後髮在身體後面。 */
export function Head({ skin, face, eyes, brows, mouth, cheeks, hair, bangs, hairColor, uniform, uniformCut, uniformHat }: HeadColors & {
  uniform: string; uniformCut: string; uniformHat: string
}) {
  return <g>
    <Face skin={skin} face={face} eyes={eyes} brows={brows} mouth={mouth} cheeks={cheeks} />
    <g data-layer="hair-front"><FrontHair hair={hair} bangs={bangs} hairColor={hairColor} /></g>
    {uniformHat === 'on' && <UniformHat uniform={uniform} cut={uniformCut} />}
  </g>
}
