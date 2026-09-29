/**
 * 2D 紙娃娃姿勢資料。角度皆為度數：0 = 垂直向下，正值往畫面左側轉。
 * 手肘／膝蓋是相對於上一節的角度；頭與軀幹則是相對於正立位置。
 * SVG 畫法、骨架控制點及存檔都只讀這份資料，不需要為每個姿勢重畫人物。
 */
export type JointKey =
  | 'torso'
  | 'head'
  | 'leftShoulder'
  | 'leftElbow'
  | 'rightShoulder'
  | 'rightElbow'
  | 'leftHip'
  | 'leftKnee'
  | 'rightHip'
  | 'rightKnee'

export type PoseAngles = Record<JointKey, number>

export const POSE_LIMITS: Record<JointKey, { min: number; max: number }> = {
  torso: { min: -16, max: 16 },
  head: { min: -22, max: 22 },
  leftShoulder: { min: -165, max: 165 },
  leftElbow: { min: -145, max: 145 },
  rightShoulder: { min: -165, max: 165 },
  rightElbow: { min: -145, max: 145 },
  leftHip: { min: -65, max: 65 },
  leftKnee: { min: -115, max: 115 },
  rightHip: { min: -65, max: 65 },
  rightKnee: { min: -115, max: 115 },
}

export const JOINT_KEYS = Object.keys(POSE_LIMITS) as JointKey[]

export type PosePresetId = 'stand' | 'wave' | 'salute' | 'cheer' | 'stride' | 'tpose'

export interface Pose {
  preset: PosePresetId | 'custom'
  joints: PoseAngles
}

export interface PosePreset {
  id: PosePresetId
  label: string
  detail: string
  prompt: string
  joints: PoseAngles
}

/** 中立姿勢也是舊存檔沒有 pose 時的回退值。 */
export const POSE_PRESETS: PosePreset[] = [
  {
    id: 'stand', label: '自然站立', detail: '最適合開始設計', prompt: '自然站立，雙手放鬆垂在身側',
    joints: { torso: 0, head: 0, leftShoulder: 14, leftElbow: -6, rightShoulder: -14, rightElbow: 6, leftHip: 8, leftKnee: -4, rightHip: -8, rightKnee: 4 },
  },
  {
    id: 'wave', label: '開心招手', detail: '右手舉高打招呼', prompt: '一隻手高舉揮手，親切地打招呼',
    joints: { torso: -4, head: 7, leftShoulder: 17, leftElbow: -9, rightShoulder: -142, rightElbow: -25, leftHip: 10, leftKnee: -5, rightHip: -5, rightKnee: 3 },
  },
  {
    id: 'salute', label: '童軍敬禮', detail: '手掌靠近額頭', prompt: '抬手在額前敬禮，神情精神奕奕',
    joints: { torso: 0, head: -3, leftShoulder: 15, leftElbow: -8, rightShoulder: -145, rightElbow: -47, leftHip: 8, leftKnee: -4, rightHip: -8, rightKnee: 4 },
  },
  {
    id: 'cheer', label: '雙手歡呼', detail: '兩隻手都舉起來', prompt: '雙手高舉歡呼，充滿活力',
    joints: { torso: 0, head: 0, leftShoulder: 142, leftElbow: 7, rightShoulder: -142, rightElbow: -7, leftHip: 18, leftKnee: -9, rightHip: -18, rightKnee: 9 },
  },
  {
    id: 'stride', label: '跨步出發', detail: '手腳交錯向前', prompt: '手腳交錯跨步前進，像正要出發去探險',
    joints: { torso: 8, head: -9, leftShoulder: -35, leftElbow: 24, rightShoulder: -40, rightElbow: -20, leftHip: 36, leftKnee: -39, rightHip: -33, rightKnee: 33 },
  },
  {
    id: 'tpose', label: '骨架校正', detail: '展開雙臂檢查零件', prompt: '雙臂水平展開的 T 字姿勢',
    joints: { torso: 0, head: 0, leftShoulder: 90, leftElbow: 0, rightShoulder: -90, rightElbow: 0, leftHip: 8, leftKnee: -4, rightHip: -8, rightKnee: 4 },
  },
]

const DEFAULT = POSE_PRESETS[0]

export function poseFromPreset(id: PosePresetId): Pose {
  const preset = POSE_PRESETS.find((p) => p.id === id) ?? DEFAULT
  return { preset: preset.id, joints: { ...preset.joints } }
}

export function poseLabel(pose: Pose): string {
  return POSE_PRESETS.find((p) => p.id === pose.preset)?.label ?? '自訂姿勢'
}

export function clampJoint(key: JointKey, value: number): number {
  const { min, max } = POSE_LIMITS[key]
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : DEFAULT.joints[key]
}

export function setPoseJoint(pose: Pose, key: JointKey, value: number): Pose {
  const next = clampJoint(key, value)
  if (pose.joints[key] === next) return pose
  return { preset: 'custom', joints: { ...pose.joints, [key]: next } }
}

/** 鏡像交換左右，並反轉旋轉方向；保留使用者已微調的角度。 */
export function mirrorPose(pose: Pose): Pose {
  const p = pose.joints
  return {
    preset: 'custom',
    joints: {
      torso: -p.torso,
      head: -p.head,
      leftShoulder: -p.rightShoulder,
      leftElbow: -p.rightElbow,
      rightShoulder: -p.leftShoulder,
      rightElbow: -p.leftElbow,
      leftHip: -p.rightHip,
      leftKnee: -p.rightKnee,
      rightHip: -p.leftHip,
      rightKnee: -p.leftKnee,
    },
  }
}

/** 分享連結、localStorage 和舊版文件一律從此處讀入，防止缺欄／壞角度使 SVG 失效。 */
export function normalizePose(raw: unknown): Pose {
  if (!raw || typeof raw !== 'object') return poseFromPreset('stand')
  const data = raw as { preset?: unknown; joints?: unknown }
  const preset = POSE_PRESETS.find((p) => p.id === data.preset) ?? DEFAULT
  const source = data.joints && typeof data.joints === 'object' ? data.joints as Record<string, unknown> : {}
  const joints = { ...preset.joints }
  for (const key of JOINT_KEYS) {
    if (typeof source[key] === 'number') joints[key] = clampJoint(key, source[key])
  }
  const matchesPreset = JOINT_KEYS.every((key) => joints[key] === preset.joints[key])
  return { preset: data.preset === 'custom' || !matchesPreset ? 'custom' : preset.id, joints }
}
