import type { ReactNode } from 'react'
import type { Design, Option } from '../types'
import Character from '../character/Character'
import { BANGS, BODIES, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS } from '../data/options'
import {
  CUT_LABELS, UNIFORMS, UNIFORM_SOURCES, allowedCuts, selectUniform, tieColor,
  uniformById, uniformDetails, uniformPalette, type UniformCut, type UniformOption,
} from '../data/uniforms'

export type DesignSection = 'face' | 'hair' | 'uniform' | 'body'
interface Props {
  design: Design
  sectionId: DesignSection
  onSection: (section: DesignSection) => void
  onChange: (key: keyof Design, value: string) => void
}

const HEAD_VIEW = '70 4 220 222'
const HAIR_VIEW = '47 -18 266 278'

/** 每格與畫布、PNG 使用同一份角色 SVG；臉髮格子暫時隱藏帽子。 */
function Thumb({ design, override, viewBox, showHat = false }: {
  design: Design; override: Partial<Design>; viewBox?: string; showHat?: boolean
}) {
  return <div className="thumb"><Character design={{ ...design, ...override }} viewBox={viewBox} showHat={showHat} /></div>
}

function Swatch({ option, active, onPick }: { option: Option; active: boolean; onPick: () => void }) {
  return <button type="button" className={`swatch ${active ? 'is-active' : ''}`} onClick={onPick} title={option.label} aria-label={option.label} aria-pressed={active}>
    <span className="swatch-dot" style={{ background: option.color }} />
    <span className="swatch-label">{option.label}</span>
  </button>
}

function Tile({ design, option, keyName, active, onPick, viewBox, extra, disabled, showHat }: {
  design: Design
  option: Option
  keyName: keyof Design
  active: boolean
  onPick: () => void
  viewBox?: string
  extra?: Partial<Design>
  disabled?: boolean
  showHat?: boolean
}) {
  return <button
    type="button"
    className={`tile ${active ? 'is-active' : ''}`}
    onClick={onPick}
    aria-label={option.label}
    aria-pressed={active}
    disabled={disabled}
  >
    <Thumb design={design} override={{ [keyName]: option.id, ...extra } as Partial<Design>} viewBox={viewBox} showHat={showHat} />
    <span className="tile-label">{option.label}</span>
  </button>
}

function UniformTile({ design, option, onPick }: { design: Design; option: UniformOption; onPick: () => void }) {
  const preview = selectUniform(design, option.id)
  const c = uniformPalette(option.id)
  return <button
    type="button"
    className={`uniform-tile ${design.uniform === option.id ? 'is-active' : ''}`}
    onClick={onPick}
    aria-label={option.label}
    aria-pressed={design.uniform === option.id}
  >
    <span className="uniform-tile-art"><Character design={preview} /></span>
    <span className="uniform-tile-label">{option.label}</span>
    <span className="uniform-tile-colors" aria-hidden="true">
      <i style={{ background: c.shirt }} /><i style={{ background: c.bottom }} /><i style={{ background: c.hat }} />
    </span>
  </button>
}

const GROUPS: { title: string; ids: string[] }[] = [
  { title: '幼童軍', ids: ['cub'] },
  { title: '童軍 · 陸／海／空', ids: ['scout-land', 'scout-sea', 'scout-air'] },
  { title: '深資童軍 · 陸／海／空', ids: ['venture-land', 'venture-sea', 'venture-air'] },
  { title: '樂行童軍 · 陸／海／空', ids: ['rover-land', 'rover-sea', 'rover-air'] },
  { title: '小童軍 · 集會服裝（非正式制服）', ids: ['grasshopper'] },
]

/** 臉與髮是第一階段，青少年制服是第二階段；體型保留為插畫比例選項。 */
export default function OptionsPanel({ design, sectionId, onSection, onChange }: Props) {
  const section = (title: string, content: ReactNode) => <section className="section" key={title}>
    <h2 className="section-title">{title}</h2>
    {content}
  </section>

  const swatches = (list: Option[], key: keyof Design) => <div className="swatch-grid">
    {list.map((o) => <Swatch key={o.id} option={o} active={design[key] === o.id} onPick={() => onChange(key, o.id)} />)}
  </div>

  const tiles = (list: Option[], key: keyof Design, viewBox?: string, extra?: Partial<Design>, disabled = false, showHat = false) => <div className={`tile-grid ${list.length % 3 === 1 ? 'tile-grid--wide' : ''}`}>
    {list.map((o) => <Tile
      key={o.id}
      design={design}
      option={o}
      keyName={key}
      active={design[key] === o.id}
      onPick={() => onChange(key, o.id)}
      viewBox={viewBox}
      extra={extra}
      disabled={disabled}
      showHat={showHat}
    />)}
  </div>

  const withoutHair: Partial<Design> = { hair: 'bald' }
  const uniform = uniformById(design.uniform)
  const palette = uniformPalette(design.uniform)
  const chosenCut = design.uniformCut as UniformCut
  const shirtLabel = uniform.section === 'grasshopper' ? '橙色活動服' : uniform.branch === 'sea' ? '白色恤衫' : uniform.branch === 'air' ? '淺藍恤衫' : '杏色恤衫'
  const bottomLabel = uniform.branch === 'land' ? '草青色' : '深藍色'

  return <div className="options-panel">
    <div className="option-category" role="tablist" aria-label="人物造型分類">
      {([
        { id: 'face', label: '臉部', sub: '01' },
        { id: 'hair', label: '頭髮', sub: '02' },
        { id: 'uniform', label: '制服', sub: '03' },
        { id: 'body', label: '體型', sub: '04' },
      ] as const).map(({ id, label, sub }) => <button
        key={id}
        type="button"
        role="tab"
        aria-selected={sectionId === id}
        className={`option-category-tab ${sectionId === id ? 'is-active' : ''}`}
        onClick={() => onSection(id)}
      ><small>{sub}</small>{label}</button>)}
    </div>

    {sectionId === 'face' && <div className="option-sections">
      <p className="option-hint">臉型、眼睛、眉毛、嘴巴分開挑；選項縮圖暫不戴帽，方便看清五官。</p>
      {section('臉型', tiles(FACES, 'face', HEAD_VIEW, withoutHair))}
      {section('膚色', swatches(SKINS, 'skin'))}
      {section('眼睛', tiles(EYES, 'eyes', HEAD_VIEW, { ...withoutHair, brows: 'soft', mouth: 'soft' }))}
      {section('眉型', tiles(BROWS, 'brows', HEAD_VIEW, { ...withoutHair, eyes: 'cute' }))}
      {section('嘴型', tiles(MOUTHS, 'mouth', HEAD_VIEW, { ...withoutHair, eyes: 'cute', cheeks: 'none' }))}
      {section('臉頰', tiles(CHEEKS, 'cheeks', HEAD_VIEW, { ...withoutHair, eyes: 'cute' }))}
    </div>}

    {sectionId === 'hair' && <div className="option-sections">
      <p className="option-hint">髮型與瀏海自由搭配；髮型縮圖暫不戴帽，正式畫布仍會依戴帽設定顯示。</p>
      {section('髮型', tiles(HAIRS, 'hair', HAIR_VIEW))}
      {section('瀏海', <>
        {design.hair === 'bald' && <p className="option-note">光頭不顯示瀏海，先挑選髮型即可啟用。</p>}
        {tiles(BANGS, 'bangs', HEAD_VIEW, design.hair === 'bald' ? { hair: 'side' } : undefined, design.hair === 'bald')}
      </>)}
      {section('髮色', swatches(HAIR_COLORS, 'hairColor'))}
    </div>}

    {sectionId === 'uniform' && <div className="option-sections uniform-sections">
      <div className="uniform-intro">
        <span className="uniform-eyebrow">SCOUT ASSOCIATION OF HONG KONG · YOUTH</span>
        <h2>先選支部，再選剪裁</h2>
        <p>總會的青少年支部有小童軍、幼童軍、童軍、深資童軍和樂行童軍。小童軍只有集會服裝，並非正式制服；童軍／深資／樂行另分陸、海、空。圖例以已宣誓成員為前提。</p>
      </div>

      {section('目前選用', <div className="uniform-summary">
        <strong>{uniform.label}</strong>
        <p>{uniformDetails(design)}</p>
        {uniform.section !== 'basic' && <div className="uniform-color-key">
          <span><i style={{ background: palette.shirt }} />{shirtLabel}</span>
          <span><i style={{ background: palette.bottom }} />{uniform.section === 'grasshopper' ? '單色褲示例' : `${bottomLabel}${CUT_LABELS[chosenCut]}`}</span>
          <span><i style={{ background: palette.hat }} />{uniform.section === 'grasshopper' ? '選配單色帽' : '支部帽'}</span>
        </div>}
        {uniform.source && <a href={uniform.source} target="_blank" rel="noopener noreferrer">查看香港童軍總會的 {uniform.label} 規格 ↗</a>}
      </div>)}

      {section('切換支部／類別', <select className="uniform-picker" value={design.uniform}
        aria-label="支部制服" onChange={(e) => onChange('uniform', e.target.value)}>
        {GROUPS.map((group) => <optgroup label={group.title} key={group.title}>
          {group.ids.map((id) => <option value={id} key={id}>{uniformById(id).label}</option>)}
        </optgroup>)}
        <option value="basic">舊版基礎衣物（非正式制服）</option>
      </select>)}

      {uniform.section !== 'basic' && <>
        {section('下身剪裁', <>
          <div className="uniform-cut-grid">
            {allowedCuts(design.uniform).map((cut) => <button key={cut} type="button"
              className={`uniform-cut ${design.uniformCut === cut ? 'is-active' : ''}`}
              onClick={() => onChange('uniformCut', cut)} aria-label={CUT_LABELS[cut]} aria-pressed={design.uniformCut === cut}>
              <Character design={{ ...design, uniformCut: cut }} />
              <span>{CUT_LABELS[cut]}</span>
            </button>)}
          </div>
          {uniform.section === 'scout' && <p className="option-note">童軍長褲只在旅長決定全團於冬季改穿時使用，並配黑色短襪。</p>}
          {(['venture', 'rover'].includes(uniform.section)) && <p className="option-note">及膝裙配肉色襪褲與黑色非綁帶皮鞋；女性成員參與動態活動可改穿長褲。</p>}
        </>)}
        {section('制服帽', <>
          <div className="uniform-toggle-row">
            {(['on', 'off'] as const).map((v) => <button key={v} type="button" aria-pressed={design.uniformHat === v}
              className={design.uniformHat === v ? 'is-active' : ''} onClick={() => onChange('uniformHat', v)}>
              {v === 'on' ? '戴帽' : '不戴帽'}
            </button>)}
          </div>
          <p className="option-hint">總會指引按活動及場地安排戴帽；未宣誓者暫不可佩戴帽與旅巾。臉髮特寫暫不顯示帽子。</p>
        </>)}
        {(['venture', 'rover'].includes(uniform.section)) && section('領巾／領帶', <>
          <div className="uniform-toggle-row">
            {(['scarf', 'tie'] as const).map((v) => <button key={v} type="button" aria-pressed={design.uniformNeckwear === v}
              className={design.uniformNeckwear === v ? 'is-active' : ''} onClick={() => onChange('uniformNeckwear', v)}>
              {v === 'scarf' ? '旅巾' : `領帶 · ${tieColor(design.uniform).label}`}
            </button>)}
          </div>
          <p className="option-hint">深資／樂行童軍出席典禮、儀式或會議可改戴領帶；陸裝深資棗紅、樂行深綠，海童軍黑色、空童軍深藍。</p>
        </>)}
        {design.uniformNeckwear === 'scarf' && section('旅巾配色（示意）', <>
          <div className="scarf-colors">
            <label>底色<input type="color" value={design.scarfColor} aria-label="旅巾底色" onChange={(e) => onChange('scarfColor', e.target.value)} /></label>
            <label>邊色<input type="color" value={design.scarfTrim} aria-label="旅巾邊色" onChange={(e) => onChange('scarfTrim', e.target.value)} /></label>
          </div>
          <p className="option-note">旅巾並無全港統一顏色：各旅的顏色和式樣須按所屬旅獲批的設計。這裡只能預覽配色，不代表總會核准款式。</p>
          <a className="uniform-source-link" href={UNIFORM_SOURCES.scarf} target="_blank" rel="noopener noreferrer">查看總會《儀容與制服手冊》旅巾規格 ↗</a>
        </>)}
      </>}
      {section('瀏覽其他支部', <p className="option-hint">所有示意圖都由目前角色的臉和髮型重新繪製；選好款式後可回上方調整剪裁。</p>)}
      {GROUPS.map((group) => section(group.title, <div className="uniform-gallery" key={group.title}>
        {group.ids.map((id) => {
          const option = UNIFORMS.find((u) => u.id === id)!
          return <UniformTile key={id} design={design} option={option} onPick={() => onChange('uniform', id)} />
        })}
      </div>))}
      {section('舊版造型', <button type="button" className="uniform-legacy" aria-pressed={design.uniform === 'basic'} onClick={() => onChange('uniform', 'basic')}>
        保留原本的米白色上衣、短褲和球鞋（非正式制服）
      </button>)}

      <p className="uniform-disclaimer">制服的杏／草青／海軍藍等依總會文字規格繪製；上方色票的 HEX 只是數碼插畫近似值，徽章圖樣尚未繪製。實際制服及佩戴以總會指引和所屬旅安排為準。</p>
    </div>}

    {sectionId === 'body' && <div className="option-sections">
      <p className="option-hint">體型調整的是插畫比例；制服剪裁與配色請到「制服」分類選擇。</p>
      {section('體型', tiles(BODIES, 'body', undefined, undefined, false, true))}
    </div>}
  </div>
}
