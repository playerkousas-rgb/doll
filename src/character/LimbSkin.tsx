import { RIG } from './rig'

const OUT = '#51443d'

/** 拳頭改成帶拇指、指節與掌心的柔和輪廓；位置仍跟著腕部骨架。 */
function Hand({ width, skin, side }: { width: number; skin: string; side: 'left' | 'right' }) {
  const scale = width / 22
  return <g transform={`translate(0 ${RIG.forearm}) scale(${(side === 'left' ? -scale : scale).toFixed(3)} ${scale.toFixed(3)})`}>
    <path d="M-8 -10 Q-14 -9 -15 -2 Q-18 1 -12 6 Q-15 12 -9 15 Q-3 19 5 16 Q13 15 15 9 Q18 1 13 -7 Q9 -13 -1 -13Z"
      fill={skin} stroke={OUT} strokeWidth={2.9} strokeLinejoin="round" />
    <path d="M-12 4 Q-6 5 -7 10 M1 12 Q4 14 7 12" fill="none" stroke={OUT} strokeOpacity={0.42} strokeWidth={1.8} strokeLinecap="round" />
    <path d="M-7 -7 Q-12 -4 -10 0" fill="none" stroke="#fff" strokeOpacity={0.23} strokeWidth={2.2} strokeLinecap="round" />
  </g>
}

/** 輪廓隨兩段旋轉；上臂與前臂的末端稍收窄，消除原本等粗圓柱與硬關節圈。 */
export function SkinArm({ width, skin, side, elbow }: {
  width: number; skin: string; side: 'left' | 'right'; elbow: number
}) {
  const half = width / 2
  return <>
    <g transform={`translate(0 ${RIG.upperArm}) rotate(${elbow})`}>
      <path d={`M${-half * 0.96} -7 Q${-half * 1.12} 13 ${-half * 0.9} 28 L${-half * 0.62} ${RIG.forearm - 4} Q0 ${RIG.forearm + 2} ${half * 0.62} ${RIG.forearm - 4} L${half * 0.9} 28 Q${half * 1.12} 13 ${half * 0.96} -7Z`}
        fill={skin} stroke={OUT} strokeWidth={2.9} strokeLinejoin="round" />
      <path d={`M${-half * 0.64} 15 Q${-half * 0.55} 29 ${-half * 0.4} 42`} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={2.5} strokeLinecap="round" />
      <Hand width={width} skin={skin} side={side} />
    </g>
    <path d={`M${-half * 0.98} -6 Q${-half * 1.08} 15 ${-half * 0.91} 29 L${-half * 0.78} ${RIG.upperArm - 5} Q0 ${RIG.upperArm + 5} ${half * 0.78} ${RIG.upperArm - 5} L${half * 0.91} 29 Q${half * 1.08} 15 ${half * 0.98} -6Z`}
      fill={skin} />
    <path d={`M${-half * 0.98} -6 Q${-half * 1.08} 15 ${-half * 0.91} 29 L${-half * 0.78} ${RIG.upperArm - 5} M${half * 0.98} -6 Q${half * 1.08} 15 ${half * 0.91} 29 L${half * 0.78} ${RIG.upperArm - 5}`}
      fill="none" stroke={OUT} strokeWidth={2.9} strokeLinecap="round" />
    <path d={`M${side === 'left' ? half * 0.1 : -half * 0.53} ${RIG.upperArm + 1} Q0 ${RIG.upperArm + 3} ${side === 'left' ? half * 0.53 : -half * 0.1} ${RIG.upperArm + 1}`}
      fill="none" stroke={OUT} strokeOpacity={0.28} strokeWidth={1.5} strokeLinecap="round" />
  </>
}

/** 平滑衣袖與弧形袖口；基礎衣物和青少年制服使用同一筆觸。 */
export function Sleeve({ width, color, shade }: { width: number; color: string; shade: string }) {
  const half = width / 2 + 5
  return <g strokeLinejoin="round">
    <path d={`M${-half * 0.7} -8 Q0 -14 ${half * 0.7} -8 C${half * 1.05} -6 ${half * 1.18} 0 ${half * 1.18} 10 L${half * 1.1} 25 Q0 31 ${-half * 1.1} 25 L${-half * 1.18} 10 C${-half * 1.18} 0 ${-half * 1.05} -6 ${-half * 0.7} -8Z`}
      fill={color} stroke={OUT} strokeWidth={3.1} />
    <path d={`M${-half * 1.1} 23 Q0 29 ${half * 1.1} 23`} fill="none" stroke={shade} strokeWidth={2.5} strokeLinecap="round" />
    <path d={`M${-half * 0.77} 1 Q${-half * 0.97} 8 ${-half * 0.85} 16`} fill="none" stroke="#fff" strokeOpacity={0.24} strokeWidth={2.7} strokeLinecap="round" />
  </g>
}
