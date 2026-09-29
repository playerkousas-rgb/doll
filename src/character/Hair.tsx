import type { HeadColors } from './palette'

const OUT = '#51443d'

type HairProps = Pick<HeadColors, 'hair' | 'hairColor'>
type FrontProps = HairProps & Pick<HeadColors, 'bangs'>

/** 髮色的明暗由同一個色票計算；新增髮色不用重畫全部髮型。 */
function blend(color: string, toward: string, amount: number) {
  const a = color.match(/[a-f\d]{2}/gi)?.map((n) => parseInt(n, 16)) ?? [46, 42, 40]
  const b = toward.match(/[a-f\d]{2}/gi)?.map((n) => parseInt(n, 16)) ?? [255, 255, 255]
  return `#${a.map((v, i) => Math.round(v * (1 - amount) + b[i] * amount).toString(16).padStart(2, '0')).join('')}`
}

const paint = (color: string) => ({ fill: color, stroke: OUT, strokeWidth: 3.8, strokeLinejoin: 'round' as const })

/** 髮尾、髮髻和兩側髮束，在頭、身體後面繪製。 */
export function BackHair({ hair, hairColor }: HairProps) {
  const p = paint(hairColor)
  const shade = blend(hairColor, '#261e1b', 0.27)
  const light = blend(hairColor, '#fff1df', 0.32)
  switch (hair) {
    case 'long': return <g>
      <path d="M110 58 C86 77 83 119 84 176 Q85 229 81 282 Q78 311 105 316 Q126 322 140 299 Q158 310 180 304 Q202 310 220 299 Q234 322 255 316 Q282 311 279 282 Q275 229 276 176 C277 119 274 77 250 58Z" {...p} />
      <path d="M105 119 Q93 199 95 277 Q96 301 109 305 M255 119 Q267 199 265 277 Q264 301 251 305" fill="none" stroke={light} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
      <path d="M123 181 Q114 252 125 291 M237 181 Q246 252 235 291 M145 284 Q180 296 215 284" fill="none" stroke={shade} strokeWidth={3.2} strokeLinecap="round" opacity={0.54} />
    </g>
    case 'bob': return <g>
      <path d="M103 54 Q180 3 257 54 Q275 106 268 176 Q266 203 247 215 Q232 218 218 202 L180 188 L142 202 Q128 218 113 215 Q94 203 92 176 Q85 106 103 54Z" {...p} />
      <path d="M102 142 Q97 191 114 203 M258 142 Q263 191 246 203" fill="none" stroke={light} strokeWidth={6} opacity={0.5} strokeLinecap="round" />
    </g>
    case 'twintail': return <g>
      <path d="M105 94 C77 106 57 154 61 215 Q63 246 84 253 Q101 256 106 234 Q115 181 119 105Z" {...p} />
      <path d="M255 94 C283 106 303 154 299 215 Q297 246 276 253 Q259 256 254 234 Q245 181 241 105Z" {...p} />
      <path d="M84 137 Q71 185 76 225 M276 137 Q289 185 284 225" fill="none" stroke={light} strokeWidth={6} opacity={0.55} strokeLinecap="round" />
      <circle cx={95} cy={110} r={13} fill="#df8d76" stroke={OUT} strokeWidth={3} />
      <circle cx={265} cy={110} r={13} fill="#df8d76" stroke={OUT} strokeWidth={3} />
      <circle cx={95} cy={110} r={4} fill="#f9dac3" /><circle cx={265} cy={110} r={4} fill="#f9dac3" />
    </g>
    case 'bun': return <g>
      <circle cx={180} cy={23} r={32} {...p} />
      <path d="M162 19 Q178 3 195 20 Q202 31 188 38 Q175 43 170 33 Q169 26 181 23" fill="none" stroke={shade} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <path d="M159 12 Q171 3 179 5" fill="none" stroke={light} strokeWidth={5} opacity={0.65} strokeLinecap="round" />
    </g>
    case 'curly': return <g>
      <path d="M105 75 C76 91 80 147 88 167 Q93 187 112 181 L125 151 L235 151 L248 181 Q267 187 272 167 C280 147 284 91 255 75Z" {...p} />
      <circle cx={102} cy={138} r={21} {...p} /><circle cx={258} cy={138} r={21} {...p} />
      <path d="M93 143 Q95 126 110 130 M250 130 Q265 126 267 143" fill="none" stroke={light} strokeWidth={5} opacity={0.55} strokeLinecap="round" />
    </g>
    default: return null
  }
}

/** 頭頂的輪廓是髮型；前額的瀏海是另一個可替換層。 */
function Crown({ hair, hairColor }: HairProps) {
  const p = paint(hairColor)
  const light = blend(hairColor, '#fff1df', 0.34)
  const shade = blend(hairColor, '#261e1b', 0.3)
  if (hair === 'bald') return null

  let shape
  switch (hair) {
    case 'spiky':
      shape = <path d="M94 125 C91 96 95 67 108 52 L120 29 Q123 24 127 34 L140 17 Q145 12 149 26 L163 14 Q169 10 173 26 L186 9 Q192 6 197 26 L215 16 Q220 13 224 31 L243 27 Q251 28 252 47 C266 70 270 98 266 125 Q257 112 248 108 Q239 122 230 113 Q220 104 213 116 Q203 102 192 115 Q179 102 167 117 Q154 104 143 117 Q127 104 116 119 Q104 109 94 125Z" {...p} />
      break
    case 'bowl':
      shape = <path d="M91 137 Q82 69 111 40 Q142 16 180 19 Q218 16 249 40 Q278 69 269 137 Q258 148 247 139 Q238 125 228 111 Q179 124 132 111 Q122 125 113 139 Q102 148 91 137Z" {...p} />
      break
    case 'side':
      shape = <path d="M92 130 C90 52 126 23 185 22 Q258 24 269 89 Q271 119 262 133 L248 115 Q222 95 185 99 Q146 97 111 117 L96 138Z" {...p} />
      break
    case 'bob':
      shape = <path d="M92 123 C88 58 124 20 180 20 C236 20 272 58 268 123 Q258 117 249 108 Q219 99 180 102 Q141 99 111 108 Q102 117 92 123Z" {...p} />
      break
    case 'bun':
      shape = <path d="M94 130 Q88 78 113 46 Q139 19 180 24 Q221 19 247 46 Q272 78 266 130 Q247 107 223 105 Q200 103 180 112 Q160 103 137 105 Q113 107 94 130Z" {...p} />
      break
    case 'twintail':
      shape = <path d="M91 128 Q86 73 112 42 Q140 17 180 23 Q220 17 248 42 Q274 73 269 128 Q246 102 221 101 Q199 100 180 109 Q161 100 139 101 Q114 102 91 128Z" {...p} />
      break
    case 'long':
      shape = <path d="M93 132 Q86 64 116 37 Q142 17 180 22 Q218 17 244 37 Q274 64 267 132 Q247 106 225 100 Q201 95 180 106 Q159 95 135 100 Q113 106 93 132Z" {...p} />
      break
    case 'curly':
      shape = <g>
        <path d="M91 127 Q78 106 91 80 Q83 59 106 53 Q108 28 137 34 Q154 14 178 27 Q202 10 220 32 Q246 24 257 51 Q279 57 267 82 Q281 105 269 129 Q247 113 230 115 Q205 98 180 111 Q155 98 130 115 Q111 111 91 127Z" {...p} />
        <path d="M106 93 Q86 89 88 72 Q88 52 109 51 Q103 35 123 30 Q143 24 152 39 Q163 18 182 22 Q197 21 202 39 Q216 20 235 30 Q250 38 246 56 Q268 48 271 68 Q274 84 259 93"
          fill="none" stroke={shade} strokeOpacity={0.38} strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={112} cy={69} rx={22} ry={24} transform="rotate(-18 112 69)" {...p} />
        <ellipse cx={148} cy={47} rx={25} ry={23} transform="rotate(19 148 47)" {...p} />
        <ellipse cx={187} cy={41} rx={26} ry={27} transform="rotate(-14 187 41)" {...p} />
        <ellipse cx={227} cy={54} rx={24} ry={22} transform="rotate(16 227 54)" {...p} />
        <ellipse cx={254} cy={77} rx={19} ry={22} transform="rotate(-12 254 77)" {...p} />
      </g>
      break
    default: return null
  }

  return <g>
    {shape}
    {hair === 'curly' ? (
      <g fill="none" strokeLinecap="round">
        <path d="M105 67 Q110 54 122 55 M140 42 Q148 32 158 39 M179 40 Q187 29 197 40 M221 51 Q229 42 237 49 M247 82 Q252 73 261 77"
          stroke={light} strokeWidth={4.4} opacity={0.55} />
        <path d="M115 73 Q120 78 117 84 M182 52 Q188 56 185 64 M229 67 Q234 72 230 78"
          stroke={shade} strokeWidth={2.5} opacity={0.62} />
      </g>
    ) : hair === 'spiky' ? (
      <g fill="none" strokeLinecap="round">
        <path d="M111 75 Q119 58 132 50 M155 52 Q163 37 171 34 M202 47 Q215 35 228 39 M245 64 Q251 75 253 84"
          stroke={light} strokeWidth={4.5} opacity={0.55} />
        <path d="M137 80 Q146 66 154 63 M180 57 Q186 48 191 45 M221 83 Q226 70 233 66"
          stroke={shade} strokeWidth={2.8} opacity={0.65} />
      </g>
    ) : (
      <g fill="none" strokeLinecap="round">
        <path d="M116 67 Q135 39 164 40 M188 38 Q219 35 244 66" stroke={light} strokeWidth={5.5} opacity={0.52} />
        <path d="M138 84 Q154 68 168 67 M217 75 Q224 64 227 54" stroke={shade} strokeWidth={2.8} opacity={0.55} />
      </g>
    )}
  </g>
}

const DEFAULT_BANGS: Record<string, string> = {
  spiky: 'wispy', bowl: 'straight', side: 'sweep', bob: 'straight',
  bun: 'open', twintail: 'open', long: 'sweep', curly: 'wispy',
}

function Fringe({ type, color }: { type: string; color: string }) {
  const light = blend(color, '#fff1df', 0.34)
  const shade = blend(color, '#261e1b', 0.27)
  const edge = { fill: 'none', stroke: OUT, strokeWidth: 3.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  // 只描下緣，不描頂部接縫：瀏海像同一撮頭髮長出來，而不是貼上去的髮箍。
  switch (type) {
    case 'open': return <g>
      <path d="M96 125 C93 91 110 74 138 73 Q164 73 179 99 Q160 103 150 120 Q127 107 105 138Z" fill={color} />
      <path d="M264 125 C267 91 250 74 222 73 Q196 73 181 99 Q200 103 210 120 Q233 107 255 138Z" fill={color} />
      <path d="M105 138 Q126 108 150 120 Q160 103 179 99 M181 99 Q200 103 210 120 Q234 108 255 138" {...edge} />
      <path d="M113 105 Q130 88 153 92 M247 105 Q230 88 207 92" fill="none" stroke={light} strokeWidth={4.5} opacity={0.57} strokeLinecap="round" />
      <path d="M134 109 Q144 109 151 118 M226 109 Q216 109 209 118" fill="none" stroke={shade} strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />
    </g>
    case 'straight': return <g>
      <path d="M99 97 Q143 75 180 83 Q217 75 261 97 L258 119 Q248 127 237 116 Q223 130 209 119 Q195 136 181 124 Q166 137 153 121 Q136 130 121 116 Q110 127 102 119Z" fill={color} />
      <path d="M102 119 Q110 127 121 116 Q136 130 153 121 Q166 137 181 124 Q195 136 209 119 Q223 130 237 116 Q248 127 258 119" {...edge} />
      <path d="M127 102 Q146 96 163 101 M188 100 Q211 96 232 104" fill="none" stroke={light} opacity={0.51} strokeWidth={4.5} strokeLinecap="round" />
      <path d="M145 109 Q150 114 153 121 M197 108 Q204 114 209 119" fill="none" stroke={shade} opacity={0.52} strokeWidth={2} strokeLinecap="round" />
    </g>
    case 'sweep': return <g>
      <path d="M100 124 C102 89 123 70 153 64 Q219 53 252 91 Q262 104 261 122 Q241 109 226 112 Q207 136 177 130 Q152 121 135 122 Q115 118 102 138Z" fill={color} />
      <path d="M102 138 Q115 118 135 122 Q152 121 177 130 Q207 136 226 112 Q241 109 261 122" {...edge} />
      <path d="M122 94 Q164 67 211 79 M155 106 Q184 93 209 99" fill="none" stroke={light} opacity={0.55} strokeWidth={4.8} strokeLinecap="round" />
      <path d="M169 117 Q202 126 226 111" fill="none" stroke={shade} opacity={0.53} strokeWidth={2.7} strokeLinecap="round" />
    </g>
    case 'wispy': return <g>
      <path d="M104 106 Q138 83 168 87 Q214 77 254 105 L256 116 Q239 107 227 121 Q215 110 202 124 Q189 114 180 135 Q167 115 153 124 Q137 110 122 125 Q113 118 104 126Z" fill={color} />
      <path d="M104 126 Q113 118 122 125 Q137 110 153 124 Q167 115 180 135 Q189 114 202 124 Q215 110 227 121 Q239 107 256 116" {...edge} />
      <path d="M120 103 Q140 93 158 97 M195 94 Q220 88 243 104" fill="none" stroke={light} strokeWidth={4} opacity={0.49} strokeLinecap="round" />
      <path d="M148 100 Q156 115 153 123 M178 95 Q187 115 180 132 M213 99 Q215 115 204 122" fill="none" stroke={shade} opacity={0.53} strokeWidth={2.5} strokeLinecap="round" />
    </g>
    default: return null
  }
}

/** 面頰旁的髮束獨立於瀏海；長短髮的輪廓保持可辨認。 */
function SideLocks({ hair, color }: { hair: string; color: string }) {
  if (!['bob', 'long', 'side', 'curly'].includes(hair)) return null
  const p = paint(color)
  const light = blend(color, '#fff1df', 0.34)
  if (hair === 'side') return <path d="M258 95 Q274 117 266 152 Q261 166 249 159 Q243 150 247 132Z" {...p} />
  if (hair === 'curly') return <g>
    <circle cx={104} cy={143} r={17} {...p} /><circle cx={256} cy={143} r={17} {...p} />
    <path d="M97 141 Q103 132 112 140 M248 140 Q257 132 263 141" fill="none" stroke={light} opacity={0.5} strokeWidth={3} strokeLinecap="round" />
  </g>
  const end = hair === 'long' ? 222 : 184
  return <g>
    <path d={`M101 91 C91 126 89 156 94 ${end - 34} Q87 ${end - 3} 104 ${end + 2} Q121 ${end + 7} 125 ${end - 15} Q128 ${end - 23} 120 ${end - 29} Q117 136 129 98Z`} {...p} />
    <path d={`M259 91 C269 126 271 156 266 ${end - 34} Q273 ${end - 3} 256 ${end + 2} Q239 ${end + 7} 235 ${end - 15} Q232 ${end - 23} 240 ${end - 29} Q243 136 231 98Z`} {...p} />
    <path d={`M105 132 Q97 164 104 ${end - 17} M255 132 Q263 164 256 ${end - 17}`} fill="none" stroke={light} opacity={0.51} strokeWidth={4.4} strokeLinecap="round" />
    <path d={`M116 ${end - 42} Q122 ${end - 30} 118 ${end - 19} M244 ${end - 42} Q238 ${end - 30} 242 ${end - 19}`} fill="none" stroke={blend(color, '#261e1b', 0.27)} strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" />
  </g>
}

/** 露額、齊瀏海、側瀏海、空氣瀏海與髮型輪廓可自由交叉組裝。 */
export function FrontHair({ hair, bangs, hairColor }: FrontProps) {
  if (hair === 'bald') return null // 臉部原有的皮膚高光已足夠，避免光頭出現兩道亮線。
  const fringe = bangs === 'auto' ? DEFAULT_BANGS[hair] : bangs
  return <g>
    <Crown hair={hair} hairColor={hairColor} />
    <Fringe type={fringe} color={hairColor} />
    <SideLocks hair={hair} color={hairColor} />
  </g>
}
