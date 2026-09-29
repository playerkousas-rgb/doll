import type { Design } from '../types'
import type { Pose } from '../character/pose'
import { POSE_PRESETS } from '../character/pose'
import { BANGS, BODIES, BROWS, CHEEKS, EYES, FACES, HAIRS, HAIR_COLORS, MOUTHS, SKINS, getOpt } from '../data/options'
import { uniformById, uniformDetails } from '../data/uniforms'

/** 依目前臉、頭髮、姿勢與備註產生中文生圖提示詞。 */
export function buildPrompt(design: Design, pose: Pose, note = ''): string {
  const skin = getOpt(SKINS, design.skin).label
  const face = getOpt(FACES, design.face).label
  const hair = getOpt(HAIRS, design.hair).label
  const hairColor = getOpt(HAIR_COLORS, design.hairColor).label
  const eyes = getOpt(EYES, design.eyes).label
  const brows = getOpt(BROWS, design.brows).label
  const mouth = getOpt(MOUTHS, design.mouth).label
  const cheeks = getOpt(CHEEKS, design.cheeks).label
  const body = getOpt(BODIES, design.body).label
  const bangs = design.hair !== 'bald' && design.bangs !== 'auto' ? `、${getOpt(BANGS, design.bangs).label}` : ''
  const hairDesc = design.hair === 'bald' ? '光頭' : `${hairColor}的${hair}${bangs}`
  const action = POSE_PRESETS.find((p) => p.id === pose.preset)?.prompt ?? '擺出自然的自訂肢體姿勢'
  const uniform = uniformById(design.uniform)
  const outfit = uniformDetails(design)
  const hat = uniform.section !== 'basic' && design.uniformHat === 'off' ? '，這張圖暫不戴帽' : ''
  const scarf = uniform.section !== 'basic' && design.uniformNeckwear === 'scarf'
    ? `；旅巾底色 ${design.scarfColor}、邊色 ${design.scarfTrim} 僅作示意，實際按所屬旅核准款式` : ''

  const parts = [
    `一隻可愛的 Q 版卡通公仔角色，${face}、${body}身材，膚色${skin}；${hairDesc}，${eyes}、${brows}、${mouth}，${cheeks}。`,
    `穿著${outfit}${hat}${scarf}；${action}，全身入鏡。`,
    '乾淨俐落的向量插畫風格，簡單的淺色背景，適合延伸為旅團角色。',
  ]
  if (note.trim()) parts.push(`另外注意：${note.trim()}`)
  return parts.join('')
}
