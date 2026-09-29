import type { UniformKit as Kit } from '../data/uniforms'
import { RIG, type Point } from './rig'
import { SkinArm, Sleeve } from './LimbSkin'

const OUT = '#51443d'
const BELT = '#69462f'
const BUCKLE = '#c9ab69'

type Geom = { shoulder: number; waist: number; hip: number; armWidth: number; legWidth: number }

function UniformTie({ color }: { color: string }) {
  return <g data-layer="uniform-tie" strokeLinejoin="round">
    <path d="M170 217 L180 235 L190 217" fill="none" stroke={OUT} strokeWidth={2.4} />
    <path d="M173 237 Q180 233 187 237 L184 249 H176Z" fill={color} stroke={OUT} strokeWidth={2.3} />
    <path d="M177 249 H183 L187 285 L180 292 L173 285Z" fill={color} stroke={OUT} strokeWidth={2.5} />
    <path d="M178 255 L177 279" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} strokeLinecap="round" />
  </g>
}

function TravelScarf({ base, trim }: { base: string; trim: string }) {
  return <g data-layer="travel-scarf" strokeLinejoin="round">
    <path d="M151 219 Q155 234 171 248 L174 257 L159 247 L147 222Z" fill={base} stroke={OUT} strokeWidth={2.5} />
    <path d="M209 219 Q205 234 189 248 L186 257 L201 247 L213 222Z" fill={base} stroke={OUT} strokeWidth={2.5} />
    <path d="M152 225 Q160 243 170 248 M208 225 Q200 243 190 248" fill="none" stroke={trim} strokeWidth={3.4} strokeLinecap="round" />
    <path d="M175 248 Q180 244 186 248 L184 285 L180 290 L175 286Z" fill={base} stroke={OUT} strokeWidth={2.6} />
    <path d="M176 275 L184 275 M176 281 L184 281" stroke={trim} strokeWidth={2.4} />
    <path d="M173 241 Q180 237 187 241 L187 251 Q180 257 174 251Z" fill={trim} stroke={OUT} strokeWidth={2.4} />
  </g>
}

/** 杏／白／淺藍短袖恤衫，雙胸袋和肩帶；小童軍則是橙色活動服而非制服。 */
export function UniformTorso({ geom, kit }: { geom: Geom; kit: Kit }) {
  const { palette: c, grasshopper } = kit
  const { shoulder, waist, hip } = geom
  const left = 180 - shoulder
  const right = 180 + shoulder
  const beltEdge = Math.max(hip - 2, waist - 1)
  return <g data-layer="uniform-shirt" strokeLinejoin="round">
    <path d={`M${left + 8} 217 Q180 210 ${right - 8} 217 Q${right + 3} 220 ${right - 3} 241 C${right - 9} 270 ${180 + waist + 5} 289 ${180 + waist} 313 Q180 324 ${180 - waist} 313 C${180 - waist - 5} 289 ${left + 9} 270 ${left + 3} 241 Q${left - 3} 220 ${left + 8} 217Z`}
      fill={c.shirt} stroke={OUT} strokeWidth={3.5} />
    <path d={`M${left + 11} 244 Q${left + 16} 256 ${180 - waist + 7} 273 M${right - 11} 244 Q${right - 16} 256 ${180 + waist - 7} 273 M${180 - waist + 5} 293 Q${180 - waist + 8} 299 ${180 - waist + 5} 306 M${180 + waist - 5} 293 Q${180 + waist - 8} 299 ${180 + waist - 5} 306`}
      fill="none" stroke={c.shirtShade} strokeWidth={3.2} strokeLinecap="round" opacity={0.57} />
    {grasshopper ? <g>
      <path d="M162 215 Q180 238 198 215" fill="none" stroke={OUT} strokeWidth={3.4} />
      <path d="M166 216 Q180 227 194 216" fill="none" stroke="#f9c58f" strokeWidth={2.4} />
      <circle cx={207} cy={266} r={8.5} fill="#f9dab2" opacity={0.8} />
      <path d="M204 264 L210 267 M204 267 L210 264" stroke="#ae643c" strokeWidth={1.6} />
    </g> : <g>
      <path d={`M${left + 9} 216 L${left + 26} 221 L${left + 17} 230 L${left + 4} 225Z M${right - 9} 216 L${right - 26} 221 L${right - 17} 230 L${right - 4} 225Z`}
        fill={c.shirtShade} stroke={OUT} strokeWidth={2.1} />
      <path d="M160 215 L180 237 L169 242 Q159 234 155 220Z M200 215 L180 237 L191 242 Q201 234 205 220Z"
        fill={c.shirt === '#faf9f5' ? '#ffffff' : c.shirt} stroke={OUT} strokeWidth={2.6} />
      <path d="M180 240 V303" fill="none" stroke={c.shirtShade} strokeWidth={3} />
      <circle cx={180} cy={268} r={2} fill="#8a8678" />
      <circle cx={180} cy={291} r={2} fill="#8a8678" />
      {[147, 192].map((x) => <g key={x}>
        <path d={`M${x} 263 H${x + 21} L${x + 20} 284 Q${x + 11} 288 ${x + 1} 284Z`}
          fill={c.shirt} stroke={c.shirtShade} strokeWidth={2} />
        <path d={`M${x - 1} 259 H${x + 22} L${x + 20} 268 Q${x + 11} 271 ${x + 1} 268Z`}
          fill={c.shirtShade} stroke={OUT} strokeWidth={1.8} />
        <circle cx={x + 11} cy={265} r={1.6} fill="#968877" />
      </g>)}
    </g>}
    {/* 皮帶在衣襬外，沒有沿用原本的卡通勳章或球鞋。 */}
    {!grasshopper && <g data-layer="uniform-belt">
      <path d={`M${180 - beltEdge} 304 Q180 309 ${180 + beltEdge} 304 L${180 + beltEdge} 324 Q180 329 ${180 - beltEdge} 324Z`}
        fill={BELT} stroke={OUT} strokeWidth={2.7} />
      <path d={`M${180 - beltEdge + 5} 312 H${180 + beltEdge - 5}`} stroke="#986b43" strokeWidth={2} opacity={0.65} />
      <rect x={171} y={306} width={18} height={18} rx={3} fill={BUCKLE} stroke={OUT} strokeWidth={2} />
      <path d="M175 315 H184 M180 311 V319" stroke="#705137" strokeWidth={1.9} strokeLinecap="round" />
    </g>}
    {kit.neckwear === 'tie' && !grasshopper
      ? <UniformTie color={kit.tieColor} />
      : <TravelScarf base={kit.scarfColor} trim={kit.scarfTrim} />}
  </g>
}

/** 短褲、弓字褶裙褲、長褲腰位或及膝半截裙。 */
export function UniformBottom({ hip, kit }: { hip: number; kit: Kit }) {
  const x0 = 180 - hip
  const x1 = 180 + hip
  const { cut, palette: c } = kit
  if (cut === 'skirt') return <g data-layer="uniform-bottom" strokeLinejoin="round">
    <path d={`M${x0 + 2} 311 Q180 306 ${x1 - 2} 311 L${x1 + 17} 386 Q180 395 ${x0 - 17} 386Z`}
      fill={c.bottom} stroke={OUT} strokeWidth={3.6} />
    <path d={`M${x0 + 5} 336 Q${x0 + 1} 364 ${x0 - 4} 380 M${x1 - 4} 337 Q${x1 + 1} 366 ${x1 + 5} 380`}
      fill="none" stroke={c.bottomShade} opacity={0.65} strokeWidth={3} />
    <path d={`M${x0 - 12} 382 Q180 389 ${x1 + 12} 382`} fill="none" stroke="#fff" strokeOpacity={0.26} strokeWidth={2.4} />
  </g>
  if (cut === 'trousers') return <g data-layer="uniform-bottom" strokeLinejoin="round">
    <path d={`M${x0} 312 Q180 307 ${x1} 312 L${x1 + 2} 336 H194 Q184 331 180 327 Q176 331 166 336 H${x0 - 2}Z`}
      fill={c.bottom} stroke={OUT} strokeWidth={3.2} />
    <path d={`M${x0 + 8} 320 Q180 316 ${x1 - 8} 320 M180 326 V331`} fill="none" stroke={c.bottomShade} strokeWidth={2.2} />
  </g>
  if (cut === 'skort') return <g data-layer="uniform-bottom" strokeLinejoin="round">
    <path d={`M${x0} 308 Q180 305 ${x1} 308 L${x1 + 12} 351 Q${x1 + 6} 360 188 359 Q182 352 180 346 Q176 354 172 359 Q${x0 - 6} 360 ${x0 - 12} 351Z`}
      fill={c.bottom} stroke={OUT} strokeWidth={3.3} />
    <path d={`M${x0 + 6} 317 H${x1 - 6} M${x0 + 15} 326 L${x0 + 8} 351 M${x1 - 15} 326 L${x1 - 8} 351 M180 319 L174 348 L180 353 L186 348Z`}
      fill="none" stroke={c.bottomShade} strokeWidth={2.5} strokeLinecap="round" />
    <path d={`M${x0 - 8} 350 Q${x0 + 8} 355 169 350 M191 350 Q${x1 - 8} 355 ${x1 + 8} 350`}
      fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2.2} />
  </g>
  return <g data-layer="uniform-bottom" strokeLinejoin="round">
    <path d={`M${x0} 308 Q180 305 ${x1} 308 L${x1 + 3} 350 Q${x1 + 2} 355 ${x1 - 4} 355 H190 Q183 352 180 339 Q177 352 170 355 H${x0 + 4} Q${x0 - 2} 355 ${x0 - 3} 350Z`}
      fill={c.bottom} stroke={OUT} strokeWidth={3.4} />
    <path d={`M${x0 + 9} 321 Q180 325 ${x1 - 9} 321 M180 320 V337`} fill="none" stroke={c.bottomShade} strokeWidth={2.5} />
    <path d={`M${x0 + 8} 346 H170 M190 346 H${x1 - 8}`} fill="none" stroke="#fff" strokeOpacity={0.23} strokeWidth={2.2} strokeLinecap="round" />
  </g>
}

/** 每條腿仍共用髖→膝→踝兩級骨架；長褲跟隨兩段腿而非蓋一片直布。 */
export function UniformLeg({ hip, thigh, knee, width, skin, side, kit }: {
  hip: Point; thigh: number; knee: number; width: number; skin: string; side: 'left' | 'right'; kit: Kit
}) {
  const { palette: c, cut } = kit
  const pants = cut === 'trousers'
  const half = width / 2
  const sock = pants ? '#25292b' : c.sock
  // 寬度順着膝蓋、腳踝微收；兩段路徑仍各自跟隨原來的骨架旋轉。
  const lower = `M${-half * 0.94} -8 Q${-half * 1.06} 14 ${-half * 0.89} 27 L${-half * 0.72} ${RIG.shin - 4} Q0 ${RIG.shin + 1} ${half * 0.72} ${RIG.shin - 4} L${half * 0.89} 27 Q${half * 1.06} 14 ${half * 0.94} -8Z`
  const upper = `M${-half} -3 Q${-half * 1.08} 19 ${-half * 0.96} 33 L${-half * 0.8} ${RIG.thigh - 2} Q0 ${RIG.thigh + 4} ${half * 0.8} ${RIG.thigh - 2} L${half * 0.96} 33 Q${half * 1.08} 19 ${half} -3Z`
  return <g data-layer="uniform-leg" transform={`translate(${hip.x} ${hip.y}) rotate(${thigh})`}>
    <g transform={`translate(0 ${RIG.thigh}) rotate(${knee})`}>
      <path d={lower} fill={pants ? c.bottom : skin} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      {pants ? <g>
        <path d={`M${-half * 0.65} 6 Q${-half * 0.49} 27 ${-half * 0.42} ${RIG.shin - 9}`}
          stroke={c.bottomShade} fill="none" opacity={0.56} strokeWidth={2.5} strokeLinecap="round" />
        <path d={`M${-half * 0.67} ${RIG.shin - 12} Q0 ${RIG.shin - 8} ${half * 0.67} ${RIG.shin - 12}`}
          fill="none" stroke="#fff" opacity={0.25} strokeWidth={1.9} />
      </g> : cut === 'skirt' ? (
        <path d={`M${-half * 0.6} 8 Q${-half * 0.38} 31 ${-half * 0.28} ${RIG.shin - 8}`}
          stroke="#fff" strokeOpacity={0.14} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      ) : <g>
        <path d={`M${-half * 0.94} 12 Q0 8 ${half * 0.94} 12 L${half * 0.72} ${RIG.shin - 4} Q0 ${RIG.shin + 1} ${-half * 0.72} ${RIG.shin - 4}Z`}
          fill={sock} stroke={OUT} strokeWidth={2.9} strokeLinejoin="round" />
        <path d={`M${-half * 0.85} 14 Q0 11 ${half * 0.85} 14`} stroke="#fff" strokeOpacity={0.26} strokeWidth={2.3} fill="none" />
        <path d={`M${-half * 0.55} 20 Q${-half * 0.38} 37 ${-half * 0.34} ${RIG.shin - 9}`}
          stroke="#fff" strokeOpacity={0.1} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      </g>}
      <g transform={`translate(0 ${RIG.shin}) rotate(${-thigh - knee}) scale(${side === 'left' ? -1 : 1} 1)`}>
        <path d="M-12 -6 Q-1 -11 11 -5 L27 1 Q36 5 33 14 Q29 21 20 20 H-14 Q-22 17 -21 10 Q-18 0 -12 -6Z"
          fill={c.shoe} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
        <path d="M-18 14 Q-12 19 -1 18 H27" fill="none" stroke="#73797b" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M11 2 Q21 3 26 7" fill="none" stroke="#fff" strokeOpacity={0.2} strokeWidth={1.8} strokeLinecap="round" />
        {cut !== 'skirt' && <path d="M3 -2 L10 1 M7 -5 L14 -2" stroke="#b9bcbb" strokeOpacity={0.72} strokeWidth={1.8} strokeLinecap="round" />}
        {cut === 'skirt' && <path d="M-17 15 H-9 V19 H-16Z" fill={c.shoe} stroke={OUT} strokeWidth={1.4} />}
      </g>
    </g>
    <path d={upper} fill={pants ? c.bottom : skin} />
    <path d={`M${-half} -3 Q${-half * 1.08} 19 ${-half * 0.96} 33 L${-half * 0.8} ${RIG.thigh - 2} M${half} -3 Q${half * 1.08} 19 ${half * 0.96} 33 L${half * 0.8} ${RIG.thigh - 2}`}
      fill="none" stroke={OUT} strokeWidth={3} strokeLinecap="round" />
    {pants
      ? <path d={`M${-half * 0.58} 13 Q${-half * 0.46} 32 ${-half * 0.36} ${RIG.thigh - 10}`}
          stroke={c.bottomShade} opacity={0.55} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      : <path d={`M${-half * 0.6} 14 Q${-half * 0.42} 31 ${-half * 0.36} ${RIG.thigh - 9}`}
          stroke="#fff" strokeOpacity={0.13} strokeWidth={3} fill="none" strokeLinecap="round" />}
  </g>
}

/** 衣袖繼承肩旋轉，前臂及手掌繼承肘旋轉。 */
export function UniformArm({ shoulder, upper, elbow, width, skin, side, kit }: {
  shoulder: Point; upper: number; elbow: number; width: number; skin: string; side: 'left' | 'right'; kit: Kit
}) {
  const c = kit.palette
  return <g data-layer="uniform-arm" transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${upper})`}>
    <SkinArm width={width} skin={skin} side={side} elbow={elbow} />
    <Sleeve width={width} color={c.shirt} shade={c.shirtShade} />
  </g>
}
