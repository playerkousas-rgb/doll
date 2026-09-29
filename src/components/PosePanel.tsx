import { useRef } from 'react'
import Character from '../character/Character'
import type { JointKey } from '../character/pose'
import { POSE_LIMITS, POSE_PRESETS, poseFromPreset, poseLabel } from '../character/pose'
import type { DollElement, Doc } from '../lib/canvas'
import { Icon } from './Icons'
import { P } from './iconPaths'

interface Props {
  sel: DollElement
  beginInteract: () => Doc
  endInteract: (snap: Doc) => void
  onPreset: (id: (typeof POSE_PRESETS)[number]['id']) => void
  onJoint: (key: JointKey, angle: number, discrete: boolean) => void
  onMirror: () => void
  onReset: () => void
}

const CONTROL_GROUPS: { title: string; caption: string; controls: { key: JointKey; label: string }[] }[] = [
  { title: '身體', caption: '調整重心與視線', controls: [{ key: 'torso', label: '身體傾斜' }, { key: 'head', label: '頭部傾斜' }] },
  { title: '手臂', caption: '左右是畫面中的方向', controls: [
    { key: 'leftShoulder', label: '左肩' }, { key: 'leftElbow', label: '左手肘' },
    { key: 'rightShoulder', label: '右肩' }, { key: 'rightElbow', label: '右手肘' },
  ] },
  { title: '雙腿', caption: '髖部帶動膝蓋與鞋子', controls: [
    { key: 'leftHip', label: '左髖' }, { key: 'leftKnee', label: '左膝' },
    { key: 'rightHip', label: '右髖' }, { key: 'rightKnee', label: '右膝' },
  ] },
]

/** 姿勢工作台：預設是起點；關節滑桿和畫布控制點修改的是同一份 Pose。 */
export default function PosePanel({ sel, beginInteract, endInteract, onPreset, onJoint, onMirror, onReset }: Props) {
  const gestures = useRef<Partial<Record<JointKey, Doc>>>({})
  const start = (key: JointKey) => { gestures.current[key] ??= beginInteract() }
  const finish = (key: JointKey) => {
    const snap = gestures.current[key]
    if (snap) endInteract(snap)
    delete gestures.current[key]
  }

  return (
    <div className="inspector-body pose-body">
      <div className="pose-intro">
        <span className="pose-kicker"><Icon d={P.pose} size={14} /> POSE STUDIO</span>
        <h2>姿勢草稿</h2>
        <p>先以正面站立為主。骨架和範本仍可試用；正式動作待臉髮、制服與畫風定稿後再深化。</p>
      </div>

      <div className="pose-section-head">
        <h3>姿勢範本</h3>
        <span>{poseLabel(sel.pose)}</span>
      </div>
      <div className="pose-presets">
        {POSE_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className={`pose-preset ${sel.pose.preset === preset.id ? 'is-active' : ''}`}
            aria-pressed={sel.pose.preset === preset.id}
            onClick={() => onPreset(preset.id)}
            title={preset.detail}
          >
            <span className="pose-preset-art"><Character design={sel.design} pose={poseFromPreset(preset.id)} /></span>
            <span className="pose-preset-label">{preset.label}</span>
            <span className="pose-preset-detail">{preset.detail}</span>
          </button>
        ))}
      </div>

      <div className="pose-section-head pose-controls-heading">
        <h3>微調關節</h3>
        <span>10 個可調節點</span>
      </div>
      {CONTROL_GROUPS.map((group) => (
        <section className="pose-control-group" key={group.title}>
          <div className="pose-control-group-head">
            <strong>{group.title}</strong>
            <small>{group.caption}</small>
          </div>
          {group.controls.map(({ key, label }) => (
            <label className="pose-control" key={key} htmlFor={`joint-${key}`}>
              <span className="pose-control-line">
                <span>{label}</span>
                <output htmlFor={`joint-${key}`}>{sel.pose.joints[key] > 0 ? '+' : ''}{sel.pose.joints[key]}°</output>
              </span>
              <input
                id={`joint-${key}`}
                type="range"
                min={POSE_LIMITS[key].min}
                max={POSE_LIMITS[key].max}
                step={1}
                value={sel.pose.joints[key]}
                aria-label={`${label}角度`}
                onPointerDown={() => start(key)}
                onPointerUp={() => finish(key)}
                onPointerCancel={() => finish(key)}
                onBlur={() => finish(key)}
                onChange={(e) => onJoint(key, Number(e.target.value), !gestures.current[key])}
              />
            </label>
          ))}
        </section>
      ))}
      <div className="pose-actions">
        <button className="btn" type="button" onClick={onMirror}><Icon d={P.mirror} size={16} /> 左右鏡像</button>
        <button className="btn btn-ghost" type="button" onClick={onReset}><Icon d={P.reset} size={16} /> 重回站姿</button>
      </div>
    </div>
  )
}
