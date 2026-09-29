import { RIG, type Point } from './rig'
import { SkinArm, Sleeve } from './LimbSkin'

const OUT = '#51443d'
const SHIRT = '#f7f3e8'
const SHIRT_SHADE = '#e8e7d8'
const GREEN = '#839d86'
const GREEN_DARK = '#617a65'
const SHORTS = '#657b69'
const SHORTS_DARK = '#4d6657'
const SCARF = '#e89166'

type Geom = { shoulder: number; waist: number; hip: number; armWidth: number; legWidth: number }

/** 每條腿是髖→膝→踝的父子變換。鞋子反向旋轉，所以抬腿時仍保持水平。 */
export function Leg({ hip, thigh, knee, width, skin, side }: {
  hip: Point; thigh: number; knee: number; width: number; skin: string; side: 'left' | 'right'
}) {
  return (
    <g transform={`translate(${hip.x} ${hip.y}) rotate(${thigh})`}>
      <g transform={`translate(0 ${RIG.thigh}) rotate(${knee})`}>
        <path d={`M0 -4 V${RIG.shin - 4}`} stroke={OUT} strokeWidth={width + 6} strokeLinecap="round" />
        <path d={`M0 -4 V${RIG.shin - 4}`} stroke={skin} strokeWidth={width} strokeLinecap="round" />
        <path d={`M0 38 V${RIG.shin - 2}`} stroke={OUT} strokeWidth={width + 4} strokeLinecap="round" />
        <path d={`M0 38 V${RIG.shin - 2}`} stroke={SHIRT} strokeWidth={width - 1} strokeLinecap="round" />
        <path d={`M${-width / 2 + 1} 39 H${width / 2 - 1}`} stroke={GREEN_DARK} strokeWidth={3} strokeLinecap="round" />
        <g transform={`translate(0 ${RIG.shin}) rotate(${-thigh - knee}) scale(${side === 'left' ? -1 : 1} 1)`}>
          <path d="M-12 -3 Q0 -9 12 -4 L28 4 Q34 7 32 13 Q30 19 22 19 H-12 Q-19 19 -19 11 Q-19 2 -12 -3Z" fill={SHIRT} stroke={OUT} strokeWidth={3.4} strokeLinejoin="round" />
          <path d="M-17 12 Q-12 16 -3 16 H29" fill="none" stroke={GREEN_DARK} strokeWidth={3.3} strokeLinecap="round" />
          <path d="M7 3 L12 5 M11 0 L17 2" stroke={GREEN_DARK} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
      <path d={`M0 -1 V${RIG.thigh}`} stroke={OUT} strokeWidth={width + 6} strokeLinecap="round" />
      <path d={`M0 -1 V${RIG.thigh}`} stroke={skin} strokeWidth={width} strokeLinecap="round" />
      <path d={`M${-width * 0.28} 15 V${RIG.thigh - 10}`} stroke="#fff" strokeOpacity={0.14} strokeWidth={3.5} strokeLinecap="round" />
    </g>
  )
}

export function Shorts({ hip }: Pick<Geom, 'hip'>) {
  const x0 = 180 - hip
  const x1 = 180 + hip
  return (
    <g strokeLinejoin="round">
      <path d={`M${x0} 305 Q${x0} 300 ${x0 + 10} 300 H${x1 - 10} Q${x1} 300 ${x1} 305 L${x1 + 3} 347 Q${x1 + 2} 352 ${x1 - 6} 352 H189 Q183 352 180 339 Q177 352 171 352 H${x0 + 6} Q${x0 - 2} 352 ${x0 - 3} 347Z`} fill={SHORTS} stroke={OUT} strokeWidth={3.5} />
      <path d={`M${x0 + 2} 319 Q180 324 ${x1 - 2} 319`} fill="none" stroke={SHORTS_DARK} strokeWidth={3.8} />
      <path d="M180 321 V338" fill="none" stroke={SHORTS_DARK} strokeWidth={2.8} />
      <path d={`M${x0 + 10} 343 H${171} M189 343 H${x1 - 10}`} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** 身體是可替換衣物的容器：領巾、衣服及短褲分開，手臂的袖子跟著肩膀移動。 */
export function Torso({ geom }: { geom: Geom }) {
  const { shoulder, waist } = geom
  return (
    <g strokeLinejoin="round">
      <path d={`M${180 - shoulder + 8} 217 Q180 209 ${180 + shoulder - 8} 217 Q${180 + shoulder} 221 ${180 + shoulder - 3} 237 L${180 + waist} 312 Q180 327 ${180 - waist} 312 L${180 - shoulder + 3} 237 Q${180 - shoulder} 221 ${180 - shoulder + 8} 217Z`} fill={SHIRT} stroke={OUT} strokeWidth={3.5} />
      <path d={`M${180 - shoulder + 11} 238 L${180 - waist + 7} 304 Q${180 - waist + 4} 312 ${180 - waist + 12} 315`} fill="none" stroke={SHIRT_SHADE} strokeWidth={7} strokeLinecap="round" />
      <path d="M160 216 Q180 240 200 216" fill="none" stroke={OUT} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M158 216 Q170 238 180 240 L171 251 Q157 239 152 223Z" fill={SCARF} stroke={OUT} strokeWidth={2.8} />
      <path d="M202 216 Q190 238 180 240 L189 251 Q203 239 208 223Z" fill={SCARF} stroke={OUT} strokeWidth={2.8} />
      <path d="M174 238 Q180 232 186 238 L187 247 Q182 252 178 248Z" fill="#f3b37f" stroke={OUT} strokeWidth={2.5} />
      <path d="M181 250 L186 268 L176 269 L177 250Z" fill={SCARF} stroke={OUT} strokeWidth={2.5} />
      <circle cx={207} cy={277} r={11} fill="#e7b75e" stroke={GREEN_DARK} strokeWidth={2.6} />
      <path d="M207 271 L208.7 275.4 L213 275.6 L209.5 278.5 L210.6 283 L207 280.6 L203.4 283 L204.5 278.5 L201 275.6 L205.3 275.4Z" fill="#fff8e7" />
      <path d={`M${180 - waist + 12} 309 Q180 316 ${180 + waist - 10} 309`} fill="none" stroke={GREEN} strokeWidth={2.5} strokeOpacity={0.75} strokeLinecap="round" />
    </g>
  )
}

export function Neck({ skin }: { skin: string }) {
  return <g>
    <rect x={166} y={194} width={28} height={33} rx={9} fill={skin} />
    <path d="M169 213 Q180 222 191 213" fill="none" stroke={OUT} strokeOpacity={0.22} strokeWidth={2.8} />
  </g>
}

/** 袖子跟著上臂一起轉；前臂與手掌跟著手肘轉，不需依姿勢複製素材。 */
export function Arm({ shoulder, upper, elbow, width, skin, side }: {
  shoulder: Point; upper: number; elbow: number; width: number; skin: string; side: 'left' | 'right'
}) {
  return (
    <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upper})`}>
      <SkinArm width={width} skin={skin} side={side} elbow={elbow} />
      <Sleeve width={width} color={GREEN} shade={GREEN_DARK} />
    </g>
  )
}
