import type { Design } from '../types'
import { EXPRS, FACES, HAIRS, HAIR_COLORS, SKINS, getOpt } from '../data/options'

/** 公仔配色 */
const OUT = '#4a3a30' // 柔和深棕描邊
const CLOTH = '#ffffff' // 內衣（背心＋短褲）
const CLOTH_LINE = '#e3e7ec'
const MOUTH = '#6b4235'
const DARK = '#2e2a28'
const TIE = '#ff7e9d' // 髮飾

/** 體型幾何參數 */
const BODY_GEOM: Record<string, { t: number; hip: number; armW: number; legW: number; footRx: number }> = {
  slim: { t: 42, hip: 46, armW: 19, legW: 26, footRx: 23 },
  normal: { t: 50, hip: 54, armW: 23, legW: 30, footRx: 27 },
  round: { t: 62, hip: 66, armW: 27, legW: 35, footRx: 31 },
}

/** 各臉型的耳朵位置（頭部左右邊緣外側） */
const FACE_EAR: Record<string, number> = { round: 95, oval: 103, square: 101, heart: 99 }

interface Props {
  design: Design
  viewBox?: string
  svgId?: string
  className?: string
}

/** 臉部輪廓 */
function faceShape(id: string, fill: string) {
  const common = { fill, stroke: OUT, strokeWidth: 4 }
  switch (id) {
    case 'oval':
      return <ellipse cx={180} cy={119} rx={80} ry={94} {...common} />
    case 'square':
      return <rect x={98} y={28} width={164} height={182} rx={46} {...common} />
    case 'heart':
      return (
        <path
          d="M94 112C94 52 132 26 180 26C228 26 266 52 266 112C266 158 232 196 180 210C128 196 94 158 94 112Z"
          {...common}
        />
      )
    default:
      return <ellipse cx={180} cy={119} rx={88} ry={86} {...common} />
  }
}

/** 眼睛（依表情） */
function eyesGroup(id: string) {
  const L = 150
  const R = 210
  const y = 128
  const roundEye = (cx: number) => (
    <g key={`${id}-${cx}`}>
      <circle cx={cx} cy={y} r={12.5} fill={DARK} />
      <circle cx={cx + 3.5} cy={y - 4.5} r={4.2} fill="#fff" />
      <circle cx={cx - 4} cy={y + 4} r={2} fill="#fff" opacity={0.9} />
    </g>
  )
  switch (id) {
    case 'smile':
      return (
        <g fill="none" stroke={DARK} strokeWidth={6} strokeLinecap="round">
          <path d={`M ${L - 12} ${y + 2} Q ${L} ${y - 14} ${L + 12} ${y + 2}`} />
          <path d={`M ${R - 12} ${y + 2} Q ${R} ${y - 14} ${R + 12} ${y + 2}`} />
        </g>
      )
    case 'wink':
      return (
        <g>
          {roundEye(L)}
          <path
            d={`M ${R - 12} ${y} Q ${R} ${y - 13} ${R + 12} ${y}`}
            fill="none"
            stroke={DARK}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      )
    case 'cool':
      return (
        <g fill={DARK}>
          <path
            d={`M ${L - 13} ${y - 6} Q ${L} ${y - 9} ${L + 13} ${y - 5} Q ${L + 11} ${y + 10} ${L} ${y + 10} Q ${L - 11} ${y + 10} ${L - 13} ${y - 6} Z`}
          />
          <path
            d={`M ${R - 13} ${y - 5} Q ${R} ${y - 9} ${R + 13} ${y - 6} Q ${R + 11} ${y + 10} ${R} ${y + 10} Q ${R - 11} ${y + 10} ${R - 13} ${y - 5} Z`}
          />
          <circle cx={L + 5} cy={y + 2} r={3} fill="#fff" />
          <circle cx={R + 5} cy={y + 2} r={3} fill="#fff" />
        </g>
      )
    default:
      return (
        <g>
          {roundEye(L)}
          {roundEye(R)}
        </g>
      )
  }
}

/** 嘴巴（依表情） */
function mouth(id: string) {
  switch (id) {
    case 'smile':
      return <path d="M 166 158 Q 180 178 194 158 Z" fill={MOUTH} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
    case 'wink':
      return <path d="M 173 165 Q 181 173 189 163" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
    case 'cool':
      return <path d="M 172 168 H 188" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
    default:
      return <path d="M 172 163 Q 180 173 188 163" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
  }
}

/** 髮型：身體後面的層（長髮、雙馬尾） */
function hairBack(id: string, color: string) {
  const stroke = { fill: color, stroke: OUT, strokeWidth: 4, strokeLinejoin: 'round' as const }
  if (id === 'long') {
    return (
      <g>
        <path d="M 98 70 C 84 128 80 216 84 300 C 98 314 116 314 128 300 C 122 216 124 130 128 74 Z" {...stroke} />
        <path d="M 262 70 C 276 128 280 216 276 300 C 262 314 244 314 232 300 C 238 216 236 130 232 74 Z" {...stroke} />
      </g>
    )
  }
  if (id === 'twintail') {
    return (
      <g>
        <path d="M 104 94 C 72 122 50 176 56 230 C 60 252 86 256 94 238 C 104 194 112 140 118 102 Z" {...stroke} />
        <path d="M 256 94 C 288 122 310 176 304 230 C 300 252 274 256 266 238 C 256 194 248 140 242 102 Z" {...stroke} />
        <ellipse cx={86} cy={116} rx={13} ry={11} fill={TIE} stroke={OUT} strokeWidth={3.5} />
        <ellipse cx={274} cy={116} rx={13} ry={11} fill={TIE} stroke={OUT} strokeWidth={3.5} />
      </g>
    )
  }
  return null
}

/** 髮型：頭部前面的層（劉海＋頭頂） */
function hairFront(id: string, color: string) {
  const stroke = { fill: color, stroke: OUT, strokeWidth: 4, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'bald':
      return (
        <path
          d="M 146 68 Q 164 50 190 54"
          fill="none"
          stroke="#ffffff"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.5}
        />
      )
    case 'spiky':
      return (
        <path
          d="M 94 126
            C 94 84 100 56 116 40
            L 124 16 L 140 34
            L 154 12 L 170 30
            L 186 8 L 202 30
            L 220 14 L 232 36
            L 250 26 L 256 52
            C 264 76 266 100 266 126
            L 254 106 L 242 122 L 228 102 L 214 120 L 200 100 L 186 118
            L 172 100 L 158 120 L 144 102 L 130 120 L 116 104 L 102 120 Z"
          {...stroke}
        />
      )
    case 'side':
      return (
        <path
          d="M 92 130 C 92 56 128 24 180 24 C 232 24 268 56 268 130
            C 266 110 258 96 244 88 C 224 76 196 74 168 80
            C 136 88 106 104 92 130 Z"
          {...stroke}
        />
      )
    case 'bob':
      return (
        <g>
          <path
            d="M 100 92 C 88 124 86 150 94 166 C 108 172 120 162 122 146 C 124 128 122 106 118 92 Z"
            {...stroke}
          />
          <path
            d="M 260 92 C 272 124 274 150 266 166 C 252 172 240 162 238 146 C 236 128 238 106 242 92 Z"
            {...stroke}
          />
          <path
            d="M 92 132 C 92 56 128 24 180 24 C 232 24 268 56 268 132
              C 266 112 262 108 246 106 C 216 102 214 114 180 114
              C 146 114 144 102 114 106 C 98 108 94 112 92 132 Z"
            {...stroke}
          />
        </g>
      )
    case 'bun':
      return (
        <g>
          <circle cx={180} cy={30} r={27} {...stroke} />
          <path
            d="M 92 132 C 92 56 128 24 180 24 C 232 24 268 56 268 132
              C 266 112 262 108 246 106 C 216 102 214 114 180 114
              C 146 114 144 102 114 106 C 98 108 94 112 92 132 Z"
            {...stroke}
          />
        </g>
      )
    case 'twintail':
      return (
        <path
          d="M 92 132 C 92 56 128 24 180 24 C 232 24 268 56 268 132
            C 266 112 262 108 246 106 C 216 102 214 114 180 114
            C 146 114 144 102 114 106 C 98 108 94 112 92 132 Z"
          {...stroke}
        />
      )
    case 'long':
      return (
        <path
          d="M 92 130 C 92 56 128 24 180 24 C 232 24 268 56 268 130
            C 266 110 258 96 244 88 C 224 76 196 74 168 80
            C 136 88 106 104 92 130 Z"
          {...stroke}
        />
      )
    default: // bowl 蘑菇頭
      return (
        <path
          d="M 92 132 C 92 56 128 24 180 24 C 232 24 268 56 268 132
            C 266 112 262 108 246 106 C 216 102 214 114 180 114
            C 146 114 144 102 114 106 C 98 108 94 112 92 132 Z"
          {...stroke}
        />
      )
  }
}

/**
 * 公仔：分層 SVG 疊圖
 * 圖層順序（由後至前）：影子 → 後髮 → 腿 → 短褲 → 身體 → 背心 → 手臂 → 耳 → 臉 → 五官 → 前髮
 */
export default function Character({ design, viewBox = '0 0 360 480', svgId, className }: Props) {
  const skin = getOpt(SKINS, design.skin).color ?? '#f3c79c'
  const hairColor = getOpt(HAIR_COLORS, design.hairColor).color ?? '#2e2a28'
  const face = FACES.some((f) => f.id === design.face) ? design.face : 'round'
  const hair = HAIRS.some((h) => h.id === design.hair) ? design.hair : 'bowl'
  const expr = EXPRS.some((e) => e.id === design.eyes) ? design.eyes : 'cute'
  const geom = BODY_GEOM[design.body] ?? BODY_GEOM.normal

  const { t, hip, armW, legW, footRx } = geom

  // 腿
  const legTopL = 180 - hip * 0.45
  const legTopR = 180 + hip * 0.45
  const legBotL = 180 - (hip * 0.62 + 6)
  const legBotR = 180 + (hip * 0.62 + 6)
  const legD = (top: number, bot: number) => `M ${top} 330 L ${bot} 440`

  // 手臂
  const shoulderY = 232
  const wristY = 334
  const armL = `M ${180 - t + 4} ${shoulderY} L ${180 - t - 30} ${wristY}`
  const armR = `M ${180 + t - 4} ${shoulderY} L ${180 + t + 30} ${wristY}`
  const handR = armW * 0.58 + 4

  // 短褲
  const x0 = 180 - hip - 6
  const x1 = 180 + hip + 6
  const yTop = 304
  const yBot = 366
  const shortsD = `M ${x0} ${yTop + 14} Q ${x0} ${yTop} ${x0 + 14} ${yTop}
    H ${x1 - 14} Q ${x1} ${yTop} ${x1} ${yTop + 14}
    V ${yBot - 14} Q ${x1} ${yBot} ${x1 - 14} ${yBot}
    H 187 Q 180 ${yBot} 180 ${yBot - 22}
    Q 180 ${yBot} 173 ${yBot}
    H ${x0 + 14} Q ${x0} ${yBot} ${x0} ${yBot - 14} Z`

  // 背心
  const tankL = 180 - t
  const tankW = 2 * t
  const scoop = 'M 154 212 Q 156 244 180 262 Q 204 244 206 212'

  const earX = FACE_EAR[face] ?? 95

  return (
    <svg
      id={svgId}
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="童軍公仔設計預覽"
    >
      {/* ① 影子 */}
      <ellipse cx={180} cy={468} rx={hip + 42} ry={11} fill="#000" opacity={0.07} />

      {/* ② 後髮（長髮、雙馬尾在身體後面） */}
      {hairBack(hair, hairColor)}

      {/* ③ 腿＋腳（先描邊再填色） */}
      <g fill="none" strokeLinecap="round">
        <path d={legD(legTopL, legBotL)} stroke={OUT} strokeWidth={legW + 8} />
        <path d={legD(legTopR, legBotR)} stroke={OUT} strokeWidth={legW + 8} />
        <path d={legD(legTopL, legBotL)} stroke={skin} strokeWidth={legW} />
        <path d={legD(legTopR, legBotR)} stroke={skin} strokeWidth={legW} />
      </g>
      <ellipse cx={legBotL - 8} cy={450} rx={footRx} ry={14} fill={skin} stroke={OUT} strokeWidth={4} />
      <ellipse cx={legBotR + 8} cy={450} rx={footRx} ry={14} fill={skin} stroke={OUT} strokeWidth={4} />

      {/* ④ 短褲 */}
      <path d={shortsD} fill={CLOTH} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x0 + 6} 322 H ${x1 - 6}`} stroke={CLOTH_LINE} strokeWidth={4} strokeLinecap="round" />

      {/* ⑤ 身體（無描邊，避免與衣服輪廓重複） */}
      <rect x={180 - (t - 4)} y={210} width={2 * t - 8} height={102} rx={20} fill={skin} />

      {/* ⑥ 背心（方塊＋挖領口） */}
      <rect x={tankL} y={212} width={tankW} height={106} rx={16} fill={CLOTH} stroke={OUT} strokeWidth={4} />
      <path d={scoop} fill={skin} />
      <path d={scoop} fill="none" stroke={OUT} strokeWidth={4} />

      {/* ⑦ 手臂＋手 */}
      <g fill="none" strokeLinecap="round">
        <path d={armL} stroke={OUT} strokeWidth={armW + 8} />
        <path d={armR} stroke={OUT} strokeWidth={armW + 8} />
        <path d={armL} stroke={skin} strokeWidth={armW} />
        <path d={armR} stroke={skin} strokeWidth={armW} />
      </g>
      <circle cx={180 - t - 30} cy={wristY} r={handR} fill={skin} stroke={OUT} strokeWidth={4} />
      <circle cx={180 + t + 30} cy={wristY} r={handR} fill={skin} stroke={OUT} strokeWidth={4} />

      {/* ⑧ 脖子（在頭的下面；只填色不描邊，避免在領口出現「項鍊線」） */}
      <rect x={166} y={196} width={28} height={26} rx={10} fill={skin} />

      {/* ⑨ 耳朵（在頭的下面） */}
      <circle cx={earX} cy={134} r={15} fill={skin} stroke={OUT} strokeWidth={4} />
      <circle cx={360 - earX} cy={134} r={15} fill={skin} stroke={OUT} strokeWidth={4} />

      {/* ⑩ 臉 */}
      {faceShape(face, skin)}

      {/* ⑪ 五官：腮紅 → 眼 → 嘴 */}
      <ellipse cx={132} cy={158} rx={11} ry={6} fill="#ff8fa6" opacity={0.5} />
      <ellipse cx={228} cy={158} rx={11} ry={6} fill="#ff8fa6" opacity={0.5} />
      {eyesGroup(expr)}
      {mouth(expr)}

      {/* ⑫ 前髮（丸子在帽蓋下面） */}
      {hairFront(hair, hairColor)}
    </svg>
  )
}
