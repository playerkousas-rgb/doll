import type { JointKey, Pose } from './pose'

export interface Point { x: number; y: number }

/** 所有素材都共用的固定錨點／肢段長度（SVG viewBox = 360 × 480）。 */
export const RIG = {
  width: 360,
  height: 480,
  centerX: 180,
  shoulderY: 234,
  hipY: 328,
  neckY: 207,
  upperArm: 55,
  forearm: 55,
  thigh: 53,
  shin: 57,
} as const

export const BODY_GEOM: Record<string, {
  shoulder: number; waist: number; hip: number; armWidth: number; legWidth: number
}> = {
  slim: { shoulder: 38, waist: 33, hip: 39, armWidth: 19, legWidth: 24 },
  normal: { shoulder: 44, waist: 39, hip: 45, armWidth: 22, legWidth: 28 },
  round: { shoulder: 51, waist: 48, hip: 51, armWidth: 25, legWidth: 32 },
}

export function bodyGeom(body: string) {
  return BODY_GEOM[body] ?? BODY_GEOM.normal
}

const rad = (angle: number) => angle * Math.PI / 180

/** SVG 正角度從垂直向下往畫面左轉。 */
function extend(from: Point, angle: number, length: number): Point {
  return { x: from.x - Math.sin(rad(angle)) * length, y: from.y + Math.cos(rad(angle)) * length }
}

function rotate(point: Point, around: Point, angle: number): Point {
  const a = rad(angle)
  const x = point.x - around.x
  const y = point.y - around.y
  return { x: around.x + x * Math.cos(a) - y * Math.sin(a), y: around.y + x * Math.sin(a) + y * Math.cos(a) }
}

/** 計算後的骨架，同時給畫面控制點及拖曳解角度使用。 */
export function getRig(body: string, pose: Pose) {
  const g = bodyGeom(body)
  const j = pose.joints
  const pelvis = { x: RIG.centerX, y: RIG.hipY }
  const neck = rotate({ x: RIG.centerX, y: RIG.neckY }, pelvis, j.torso)
  const chest = rotate({ x: RIG.centerX, y: 263 }, pelvis, j.torso)
  // 頭部錨點是「頸部局部座標」而非畫布絕對點：先移動頸部，再疊加兩層旋轉。
  const head = rotate({ x: neck.x, y: neck.y - (RIG.neckY - 92) }, neck, j.torso + j.head)
  const leftShoulder = rotate({ x: RIG.centerX - g.shoulder - 1, y: RIG.shoulderY }, pelvis, j.torso)
  const rightShoulder = rotate({ x: RIG.centerX + g.shoulder + 1, y: RIG.shoulderY }, pelvis, j.torso)
  const leftElbow = extend(leftShoulder, j.torso + j.leftShoulder, RIG.upperArm)
  const rightElbow = extend(rightShoulder, j.torso + j.rightShoulder, RIG.upperArm)
  const leftWrist = extend(leftElbow, j.torso + j.leftShoulder + j.leftElbow, RIG.forearm)
  const rightWrist = extend(rightElbow, j.torso + j.rightShoulder + j.rightElbow, RIG.forearm)
  const leftHip = { x: RIG.centerX - g.hip * 0.55, y: RIG.hipY }
  const rightHip = { x: RIG.centerX + g.hip * 0.55, y: RIG.hipY }
  const leftKnee = extend(leftHip, j.leftHip, RIG.thigh)
  const rightKnee = extend(rightHip, j.rightHip, RIG.thigh)
  const leftAnkle = extend(leftKnee, j.leftHip + j.leftKnee, RIG.shin)
  const rightAnkle = extend(rightKnee, j.rightHip + j.rightKnee, RIG.shin)

  return {
    pelvis, neck, chest, head,
    leftShoulder, leftElbow, leftWrist, rightShoulder, rightElbow, rightWrist,
    leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle,
  }
}

/** 用指標位置反推旋轉角度；後段關節只改自己的相對角度，不影響父關節。 */
export function jointAngleAt(body: string, pose: Pose, key: JointKey, point: Point): number {
  const rig = getRig(body, pose)
  const j = pose.joints
  let origin: Point
  let parentAngle = 0
  let up = false
  switch (key) {
    case 'torso': origin = rig.pelvis; up = true; break
    case 'head': origin = rig.neck; parentAngle = j.torso; up = true; break
    case 'leftShoulder': origin = rig.leftShoulder; parentAngle = j.torso; break
    case 'rightShoulder': origin = rig.rightShoulder; parentAngle = j.torso; break
    case 'leftElbow': origin = rig.leftElbow; parentAngle = j.torso + j.leftShoulder; break
    case 'rightElbow': origin = rig.rightElbow; parentAngle = j.torso + j.rightShoulder; break
    case 'leftHip': origin = rig.leftHip; break
    case 'rightHip': origin = rig.rightHip; break
    case 'leftKnee': origin = rig.leftKnee; parentAngle = j.leftHip; break
    case 'rightKnee': origin = rig.rightKnee; parentAngle = j.rightHip; break
  }
  const dx = point.x - origin.x
  const dy = point.y - origin.y
  const angle = up ? Math.atan2(dx, -dy) : Math.atan2(-dx, dy)
  const value = angle * 180 / Math.PI - parentAngle
  return ((value + 180) % 360 + 360) % 360 - 180
}
