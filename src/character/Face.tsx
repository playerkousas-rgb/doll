import type { HeadColors } from './palette'

const OUT = '#51443d'
const INK = '#352f2d'
const LIP = '#a65859'

/** 輪廓的下巴、顴骨和顳角各有微小差異；不要把所有臉型只作橢圓縮放。 */
function FaceShape({ face, skin }: Pick<HeadColors, 'face' | 'skin'>) {
  const paint = { fill: skin, stroke: OUT, strokeWidth: 3.5, strokeLinejoin: 'round' as const }
  switch (face) {
    case 'oval':
      return <path d="M180 25 C229 25 258 62 258 111 C258 169 229 207 191 218 Q180 222 169 218 C131 207 102 169 102 111 C102 62 131 25 180 25Z" {...paint} />
    case 'square':
      return <path d="M146 29 H214 Q256 29 260 76 L259 167 Q258 196 231 208 Q207 219 180 219 Q153 219 129 208 Q102 196 101 167 L100 76 Q104 29 146 29Z" {...paint} />
    case 'heart':
      return <path d="M180 27 C233 26 267 57 267 111 C267 160 234 196 191 214 Q180 220 169 214 C126 196 93 160 93 111 C93 57 127 26 180 27Z" {...paint} />
    default:
      return <path d="M180 28 C231 28 268 63 268 114 C268 163 237 197 194 207 Q180 212 166 207 C123 197 92 163 92 114 C92 63 129 28 180 28Z" {...paint} />
  }
}

function Brows({ type }: { type: string }) {
  let left = 'M138 108 Q150 102 162 109'
  let right = 'M198 109 Q210 102 222 108'
  if (type === 'raised') {
    left = 'M138 104 Q149 92 162 100'
    right = 'M198 100 Q211 92 222 104'
  } else if (type === 'straight') {
    left = 'M138 107 Q150 105 162 108'
    right = 'M198 108 Q210 105 222 107'
  } else if (type === 'determined') {
    left = 'M138 101 Q150 105 162 112'
    right = 'M198 112 Q210 105 222 101'
  }
  return <g fill="none" stroke={INK} strokeWidth={type === 'determined' ? 3.7 : 2.9} strokeLinecap="round" opacity={0.89}>
    <path d={left} /><path d={right} />
  </g>
}

/** 白眼球、暖棕虹膜、深色瞳孔及兩顆光點。避免只用一整塊黑色橢圓。 */
function OpenEye({ x, bright = false }: { x: number; bright?: boolean }) {
  return <g>
    <ellipse cx={x} cy={132} rx={bright ? 14.5 : 13} ry={bright ? 16 : 14.5} fill="#fffdf8" stroke={INK} strokeWidth={2.5} />
    <ellipse cx={x + 0.5} cy={132} rx={bright ? 9.5 : 8.4} ry={bright ? 11.3 : 10} fill="#634638" />
    <path d={`M${x - 6} 137 Q${x} 146 ${x + 7} 137`} fill="none" stroke="#a17657" strokeWidth={2.2} opacity={0.75} strokeLinecap="round" />
    <ellipse cx={x + 1} cy={130} rx={bright ? 6.3 : 5.7} ry={bright ? 8.4 : 7.8} fill={INK} />
    <circle cx={x + 4} cy={125} r={bright ? 4.2 : 3.6} fill="#fff" />
    <circle cx={x - 3} cy={136} r={bright ? 2.4 : 1.8} fill="#fff" opacity={0.93} />
    {bright && <path d={`M${x - 10} 125 L${x - 7} 121 L${x - 5} 124`} fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />}
  </g>
}

function Eyes({ type }: { type: string }) {
  if (type === 'smile') return <g fill="none" stroke={INK} strokeWidth={4.6} strokeLinecap="round">
    <path d="M137 134 Q150 116 163 134" /><path d="M197 134 Q210 116 223 134" />
    <path d="M138 140 Q150 145 162 140 M198 140 Q210 145 222 140" strokeWidth={1.6} opacity={0.28} />
  </g>
  if (type === 'wink') return <g>
    <OpenEye x={150} />
    <path d="M197 132 Q210 119 223 132" fill="none" stroke={INK} strokeWidth={4.8} strokeLinecap="round" />
  </g>
  if (type === 'cool') return <g>
    {[150, 210].map((x) => <g key={x}>
      <path d={`M${x - 14} 125 Q${x} 120 ${x + 14} 125 Q${x + 11} 139 ${x} 140 Q${x - 11} 139 ${x - 14} 125Z`} fill="#fffdf8" stroke={INK} strokeWidth={2.7} />
      <ellipse cx={x + 2} cy={131} rx={6} ry={8} fill="#634638" />
      <circle cx={x + 4} cy={127} r={2.3} fill="#fff" />
      <path d={`M${x - 14} 125 Q${x} 117 ${x + 14} 125`} fill="none" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
    </g>)}
  </g>
  if (type === 'sleepy') return <g>
    {[150, 210].map((x) => <g key={x}>
      <ellipse cx={x} cy={133} rx={12} ry={10} fill="#fffdf8" stroke={INK} strokeWidth={2.4} />
      <ellipse cx={x + 1} cy={135} rx={6} ry={7} fill="#634638" />
      <circle cx={x + 3} cy={132} r={2.1} fill="#fff" />
      <path d={`M${x - 15} 128 Q${x} 121 ${x + 15} 128`} fill="none" stroke={INK} strokeWidth={4.7} strokeLinecap="round" />
    </g>)}
  </g>
  return <g><OpenEye x={150} bright={type === 'bright'} /><OpenEye x={210} bright={type === 'bright'} /></g>
}

function Mouth({ type }: { type: string }) {
  switch (type) {
    case 'grin': return <g>
      <path d="M164 160 Q180 166 196 160 Q193 181 180 182 Q167 181 164 160Z" fill={LIP} stroke={OUT} strokeWidth={2.7} strokeLinejoin="round" />
      <path d="M167 162 Q180 168 193 162 Q191 170 180 170 Q169 170 167 162Z" fill="#fff8ec" />
      <path d="M175 177 Q180 174 185 177" fill="none" stroke="#ee9ba4" strokeWidth={2.7} strokeLinecap="round" />
    </g>
    case 'open': return <g>
      <ellipse cx={180} cy={168} rx={7.5} ry={10} fill={LIP} stroke={OUT} strokeWidth={2.6} />
      <path d="M177 174 Q180 171 183 174" fill="none" stroke="#ed9b9e" strokeWidth={2} strokeLinecap="round" />
    </g>
    case 'calm': return <path d="M171 168 Q180 171 189 168" fill="none" stroke={OUT} strokeWidth={3.1} strokeLinecap="round" />
    case 'pout': return <path d="M170 164 Q175 159 180 165 Q185 159 190 164 Q183 174 180 172 Q177 174 170 164Z" fill="#c07174" stroke={OUT} strokeWidth={2.5} strokeLinejoin="round" />
    default: return <g fill="none" stroke={OUT} strokeLinecap="round">
      <path d="M169 164 Q180 179 191 164" strokeWidth={3.2} />
      <path d="M166 163 L168 163 M192 163 L194 163" strokeWidth={1.8} opacity={0.5} />
    </g>
  }
}

function Cheeks({ type }: { type: string }) {
  if (type === 'none') return null
  if (type === 'freckles') return <g fill="#91513d" opacity={0.64}>
    {[129, 135, 141, 219, 225, 231].map((x, i) => <circle key={x} cx={x} cy={i % 3 === 1 ? 155 : 158} r={i % 3 === 1 ? 2 : 1.7} />)}
  </g>
  return <g fill="#db7885">
    <ellipse cx={130} cy={157} rx={15} ry={7.5} opacity={0.13} />
    <ellipse cx={230} cy={157} rx={15} ry={7.5} opacity={0.13} />
    <ellipse cx={130} cy={157} rx={10} ry={4.6} opacity={0.27} />
    <ellipse cx={230} cy={157} rx={10} ry={4.6} opacity={0.27} />
  </g>
}

/** 面部五官與輪廓獨立於髮型；光頭檢視縮圖直接使用相同渲染器。 */
export default function Face({ skin, face, eyes, brows, mouth, cheeks }: Pick<HeadColors, 'skin' | 'face' | 'eyes' | 'brows' | 'mouth' | 'cheeks'>) {
  const earX: Record<string, number> = { round: 95, oval: 103, square: 100, heart: 98 }
  const x = earX[face] ?? 95
  return <g>
    <ellipse cx={x} cy={133} rx={14} ry={17} fill={skin} stroke={OUT} strokeWidth={3.3} />
    <ellipse cx={360 - x} cy={133} rx={14} ry={17} fill={skin} stroke={OUT} strokeWidth={3.3} />
    <path d={`M${x - 2} 137 Q${x + 3} 127 ${x + 8} 133 M${360 - x + 2} 137 Q${360 - x - 3} 127 ${360 - x - 8} 133`} fill="none" stroke={OUT} opacity={0.34} strokeWidth={1.9} strokeLinecap="round" />
    <g data-part="face"><FaceShape face={face} skin={skin} /></g>
    <path d="M118 86 Q126 61 146 56" fill="none" stroke="#fff" strokeOpacity={0.19} strokeWidth={8} strokeLinecap="round" />
    <path d="M129 184 Q148 202 173 205 M187 205 Q212 202 231 184" fill="none" stroke="#9f614e" strokeOpacity={0.1} strokeWidth={5} strokeLinecap="round" />
    <g data-part="brows"><Brows type={brows} /></g>
    <g data-part="eyes"><Eyes type={eyes} /></g>
    <g data-part="cheeks"><Cheeks type={cheeks} /></g>
    <path d="M180 144 Q175 149 180 151" fill="none" stroke={OUT} strokeOpacity={0.46} strokeWidth={1.9} strokeLinecap="round" />
    <g data-part="mouth"><Mouth type={mouth} /></g>
  </g>
}
