import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { DollElement, Doc } from '../lib/canvas'
import type { JointKey } from '../character/pose'
import { POSE_LIMITS } from '../character/pose'
import { getRig, jointAngleAt, RIG, type Point } from '../character/rig'

interface Props {
  el: DollElement
  snapshot: () => Doc
  commitSnapshot: (doc: Doc) => void
  onJoint: (id: string, key: JointKey, angle: number, discrete: boolean) => void
}

const segment = (a: Point, b: Point, key: string) => <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="rig-line" />

/** 畫布上的可拖曳骨架，獨立於角色 SVG；預覽與匯出不會畫出控制點。 */
export default function RigOverlay({ el, snapshot, commitSnapshot, onJoint }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const rig = getRig(el.design.body, el.pose)
  const grips: { key: JointKey; point: Point; label: string }[] = [
    { key: 'torso', point: rig.chest, label: '身體' },
    { key: 'head', point: rig.head, label: '頭部' },
    { key: 'leftShoulder', point: rig.leftElbow, label: '畫面左手肘' },
    { key: 'leftElbow', point: rig.leftWrist, label: '畫面左手腕' },
    { key: 'rightShoulder', point: rig.rightElbow, label: '畫面右手肘' },
    { key: 'rightElbow', point: rig.rightWrist, label: '畫面右手腕' },
    { key: 'leftHip', point: rig.leftKnee, label: '畫面左膝蓋' },
    { key: 'leftKnee', point: rig.leftAnkle, label: '畫面左腳踝' },
    { key: 'rightHip', point: rig.rightKnee, label: '畫面右膝蓋' },
    { key: 'rightKnee', point: rig.rightAnkle, label: '畫面右腳踝' },
  ]

  const onDown = (e: ReactPointerEvent<SVGGElement>, key: JointKey) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation() // 不能同時拖動整張公仔板
    const snap = snapshot()
    const basePose = el.pose
    const pointerId = e.pointerId
    let changed = false
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      const box = svgRef.current?.getBoundingClientRect()
      if (!box || !box.width || !box.height) return
      const point = {
        x: (ev.clientX - box.left) * RIG.width / box.width,
        y: (ev.clientY - box.top) * RIG.height / box.height,
      }
      const angle = jointAngleAt(el.design.body, basePose, key, point)
      if (!changed && Math.round(angle) === basePose.joints[key]) return
      changed = true
      onJoint(el.id, key, angle, false)
    }
    const stop = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      if (changed) commitSnapshot(snap)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
  }

  const onKey = (e: ReactKeyboardEvent<SVGGElement>, key: JointKey) => {
    if (!e.key.startsWith('Arrow')) return
    e.preventDefault()
    e.stopPropagation()
    const step = e.shiftKey ? 10 : 2
    const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -step : step
    const { min, max } = POSE_LIMITS[key]
    onJoint(el.id, key, Math.max(min, Math.min(max, el.pose.joints[key] + delta)), true)
  }

  return (
    <svg ref={svgRef} className="rig-overlay" viewBox={`0 0 ${RIG.width} ${RIG.height}`} aria-label="可拖曳姿勢骨架">
      {[
        segment(rig.pelvis, rig.chest, 'spine'), segment(rig.chest, rig.neck, 'neck'), segment(rig.neck, rig.head, 'head'),
        segment(rig.neck, rig.leftShoulder, 'clavicle-l'), segment(rig.neck, rig.rightShoulder, 'clavicle-r'),
        segment(rig.leftShoulder, rig.leftElbow, 'upper-l'), segment(rig.leftElbow, rig.leftWrist, 'lower-l'),
        segment(rig.rightShoulder, rig.rightElbow, 'upper-r'), segment(rig.rightElbow, rig.rightWrist, 'lower-r'),
        segment(rig.pelvis, rig.leftHip, 'pelvis-l'), segment(rig.pelvis, rig.rightHip, 'pelvis-r'),
        segment(rig.leftHip, rig.leftKnee, 'thigh-l'), segment(rig.leftKnee, rig.leftAnkle, 'shin-l'),
        segment(rig.rightHip, rig.rightKnee, 'thigh-r'), segment(rig.rightKnee, rig.rightAnkle, 'shin-r'),
      ]}
      {[rig.pelvis, rig.neck, rig.leftShoulder, rig.rightShoulder, rig.leftHip, rig.rightHip].map((p, i) => (
        <circle className="rig-anchor" key={i} cx={p.x} cy={p.y} r={4} />
      ))}
      {grips.map(({ key, point, label }) => (
        <g
          key={key}
          className="rig-grip"
          data-joint={key}
          role="button"
          tabIndex={0}
          aria-label={`拖曳${label}調整姿勢`}
          onPointerDown={(e) => onDown(e, key)}
          onKeyDown={(e) => onKey(e, key)}
        >
          <title>拖曳{label} · 方向鍵微調</title>
          <circle className="rig-hit" cx={point.x} cy={point.y} r={17} />
          <circle className="rig-halo" cx={point.x} cy={point.y} r={11} />
          <circle className="rig-dot" cx={point.x} cy={point.y} r={6} />
        </g>
      ))}
    </svg>
  )
}
