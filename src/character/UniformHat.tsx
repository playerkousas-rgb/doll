import { uniformById, uniformPalette } from '../data/uniforms'

const OUT = '#51443d'

/** 制服帽放在頭髮最上層；小童軍僅能選一般單色帽，不套用其他支部制服帽。 */
export default function UniformHat({ uniform, cut }: { uniform: string; cut: string }) {
  const { section, branch } = uniformById(uniform)
  if (section === 'basic') return null
  const c = uniformPalette(uniform)

  if (section === 'grasshopper') return <g data-layer="uniform-hat" strokeLinejoin="round">
    <path d="M106 45 Q108 13 152 9 Q217 2 253 33 L254 53 Q179 67 106 53Z" fill={c.hat} stroke={OUT} strokeWidth={3.5} />
    <path d="M177 54 Q217 43 268 56 Q268 67 246 69 L178 65Z" fill={c.hatTrim} stroke={OUT} strokeWidth={3} />
    <path d="M126 29 Q157 13 194 23" fill="none" stroke="#fff" strokeOpacity={0.32} strokeWidth={4} strokeLinecap="round" />
  </g>

  if (section === 'cub' && cut === 'skort') return <g data-layer="uniform-hat" strokeLinejoin="round">
    <path d="M116 42 Q125 5 180 4 Q235 5 244 42Z" fill={c.hat} stroke={OUT} strokeWidth={3.5} />
    <path d="M89 47 Q111 38 137 43 Q180 49 223 43 Q249 38 271 47 Q266 60 239 62 H121 Q94 60 89 47Z" fill={c.hat} stroke={OUT} strokeWidth={3.5} />
    <path d="M134 39 Q180 49 226 39" fill="none" stroke={c.hatTrim} strokeWidth={4} />
    <circle cx={180} cy={38} r={5} fill="#c3af6b" stroke={OUT} strokeWidth={1.6} />
  </g>

  if (section === 'cub') return <g data-layer="uniform-hat" strokeLinejoin="round">
    <path d="M103 48 Q106 13 146 6 Q219 -5 256 33 L255 55 Q182 68 104 56Z" fill={c.hat} stroke={OUT} strokeWidth={3.5} />
    <path d="M107 49 Q176 59 253 48" fill="none" stroke="#e8c767" strokeWidth={6} />
    <path d="M123 20 Q139 11 160 10 M205 10 Q228 13 243 29" fill="none" stroke="#e8c767" strokeWidth={4} strokeLinecap="round" />
    <path d="M170 55 Q219 47 267 55 Q265 68 244 72 Q206 70 167 64Z" fill={c.hatTrim} stroke={OUT} strokeWidth={3} />
    <circle cx={177} cy={42} r={5} fill="#e8c767" stroke={OUT} strokeWidth={1.5} />
  </g>

  if (branch === 'sea') return <g data-layer="uniform-hat" strokeLinejoin="round">
    {/* 童軍白頂水手帽；深資／樂行為白頂帽配深藍帽帶，造型略高。 */}
    <path d={section === 'scout'
      ? 'M104 42 Q108 12 134 9 H228 Q252 12 256 42Z'
      : 'M110 44 Q114 8 141 6 H219 Q246 8 250 44Z'}
      fill={c.hat} stroke={OUT} strokeWidth={3.4} />
    <path d="M103 40 Q180 48 257 40 L258 61 Q180 72 102 61Z" fill={c.hatTrim} stroke={OUT} strokeWidth={3.2} />
    <path d="M114 29 Q180 36 246 29" fill="none" stroke="#d0d6d8" strokeWidth={3.2} />
    <path d="M122 56 Q180 64 238 56" fill="none" stroke="#ad9c70" strokeWidth={2.3} />
    {section !== 'scout' && <path d="M133 63 Q180 55 227 63 Q216 74 180 74 Q144 74 133 63Z" fill={c.hatTrim} stroke={OUT} strokeWidth={2.2} />}
    <circle cx={180} cy={51} r={4.4} fill="#d2b873" />
  </g>

  return <g data-layer="uniform-hat" strokeLinejoin="round">
    <path d="M105 46 Q101 22 137 11 Q169 0 196 7 Q235 1 259 29 Q268 45 253 56 Q223 56 196 48 Q164 56 114 54Z"
      fill={c.hat} stroke={OUT} strokeWidth={3.5} />
    <path d="M106 44 Q166 56 203 46 Q231 52 257 43 L256 60 Q183 68 108 60Z"
      fill={c.hatTrim} stroke={OUT} strokeWidth={3} />
    <path d="M132 20 Q153 11 178 12 M201 14 Q223 16 240 29" fill="none" stroke="#fff" strokeOpacity={0.29} strokeWidth={4} strokeLinecap="round" />
    <path d="M164 54 Q181 48 197 54" fill="none" stroke="#b4a370" strokeWidth={2.2} />
    <circle cx={180} cy={52} r={4.7} fill="#cbb179" stroke={OUT} strokeWidth={1.4} />
  </g>
}
