/** 畫風試版：同一套資料渲染臉髮特寫及全身制服，方便改筆觸前後對照。
 *  npm run line:study 會把目前角色輸出到忽略的 shot-style-current.png。
 *  可用 STUDY_OUT=shot-style-after.png STUDY_LABEL=修改後 npm run line:study 更改標題與路徑。
 */
import { writeFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { Resvg } from '@resvg/resvg-js'
import Character from '../src/character/Character'
import { DEFAULT_DESIGN, type Design } from '../src/types'

const variants: { label: string; detail: string; design: Design }[] = [
  {
    label: '童軍｜短髮', detail: '看看瀏海、眼睛與肩膀的連接',
    design: { ...DEFAULT_DESIGN, uniformHat: 'off' },
  },
  {
    label: '幼童軍｜長髮', detail: '看看笑臉、髮尾與裙褲的線條',
    design: { ...DEFAULT_DESIGN, uniform: 'cub', uniformCut: 'skort', uniformHat: 'off',
      hair: 'long', bangs: 'open', hairColor: 'brown', face: 'heart', eyes: 'smile', mouth: 'grin' },
  },
  {
    label: '深資海童軍｜捲髮', detail: '看看深膚色、捲髮與四肢輪廓',
    design: { ...DEFAULT_DESIGN, uniform: 'venture-sea', uniformCut: 'trousers', uniformHat: 'off',
      hair: 'curly', bangs: 'wispy', hairColor: 'brown', skin: 'deep', eyes: 'bright', brows: 'raised' },
  },
]

const width = 1100
const height = 866
const column = 344
const xAt = (i: number) => 22 + i * 367
const label = process.env.STUDY_LABEL ?? '線條研究'
const output = process.env.STUDY_OUT ?? 'shot-style-current.png'
const art = (d: Design, box: string, x: number, y: number, w: number, h: number) =>
  <svg x={x} y={y} width={w} height={h} overflow="hidden">
    {/* 內層共用 Character 渲染器；只用 viewBox 更改臉髮／全身取景。 */}
    <Character design={d} viewBox={box} showHat={false} />
  </svg>

const sheet = <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
  <rect width={width} height={height} fill="#edf2ea" />
  <path d="M0 0 H1100 V8 H0Z" fill="#345e4c" />
  <text x={27} y={43} fontFamily="Noto Sans TC" fontWeight={700} fontSize={23} fill="#244938">人物線條研究 · {label}</text>
  <text x={27} y={72} fontFamily="Noto Sans TC" fontSize={13} fill="#667d6c">同一角色設定、同一套青少年制服；比較臉型、髮束、關節及衣袖的造型。</text>
  {variants.map(({ design, label: title, detail }, i) => {
    const x = xAt(i)
    return <g key={i}>
      <rect x={x} y={92} width={column} height={749} rx={21} fill="#fffcf7" stroke="#d6dfd4" strokeWidth={2} />
      <text x={x + 18} y={126} fontFamily="Noto Sans TC" fontWeight={700} fontSize={17} fill="#244938">{title}</text>
      <text x={x + 18} y={150} fontFamily="Noto Sans TC" fontSize={11} fill="#637768">{detail}</text>
      <rect x={x + 14} y={165} width={column - 28} height={281} rx={15} fill="#f1f5ef" />
      {art(design, '58 -14 244 242', x + 22, 164, column - 44, 287)}
      <text x={x + 20} y={471} fontFamily="Noto Sans TC" fontSize={11} fill="#687d6c">01 / 臉型與髮絲特寫（不戴帽）</text>
      <rect x={x + 14} y={484} width={column - 28} height={305} rx={15} fill="#f1f5ef" />
      {art(design, '0 0 360 480', x + 29, 486, column - 58, 300)}
      <text x={x + 20} y={813} fontFamily="Noto Sans TC" fontSize={11} fill="#687d6c">02 / 正面站立與制服全身線條</text>
    </g>
  })}
</svg>

const source = renderToStaticMarkup(sheet)
const fontFiles = ['node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf']
writeFileSync(output, new Resvg(source, { font: { fontFiles, loadSystemFonts: false } }).render().asPng())
console.log(`written ${output} (${width}x${height})`)
