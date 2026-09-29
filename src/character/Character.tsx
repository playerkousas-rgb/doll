import type { Design } from '../types'
import type { Pose } from './pose'
import { poseFromPreset, poseLabel } from './pose'
import { bodyGeom, RIG } from './rig'
import { Head } from './Head'
import { BackHair } from './Hair'
import { headColors } from './palette'
import { Arm, Leg, Neck, Shorts, Torso } from './Body'
import { UniformArm, UniformBottom, UniformLeg, UniformTorso } from './UniformBody'
import { uniformById, uniformKit } from '../data/uniforms'

interface Props {
  design: Design
  pose?: Pose
  viewBox?: string
  svgId?: string
  className?: string
  /** 頭像／髮型選項暫時隱藏帽子；畫布、制服選項及 PNG 仍依設計資料繪製。 */
  showHat?: boolean
}

/**
 * 同一套 SVG 骨架承載兩組可換衣物：舊版基礎衣物及青少年支部制服。
 * 頭髮、臉、身體、褲／裙和帽子皆是獨立圖層；所有縮圖與匯出共用渲染器。
 */
export default function Character({ design, pose, viewBox = '0 0 360 480', svgId, className, showHat = true }: Props) {
  const p = pose ?? poseFromPreset('stand')
  const j = p.joints
  const geom = bodyGeom(design.body)
  const colors = headColors(design)
  const kit = uniformKit(design)
  const basic = design.uniform === 'basic'
  const torsoTransform = `rotate(${j.torso} ${RIG.centerX} ${RIG.hipY})`
  const headTransform = `rotate(${j.head} ${RIG.centerX} ${RIG.neckY})`
  const shoulderX = geom.shoulder + 1
  const hipX = geom.hip * 0.55

  const leftHip = { x: 180 - hipX, y: RIG.hipY }
  const rightHip = { x: 180 + hipX, y: RIG.hipY }
  const leftShoulder = { x: 180 - shoulderX, y: RIG.shoulderY }
  const rightShoulder = { x: 180 + shoulderX, y: RIG.shoulderY }

  return (
    <svg
      id={svgId}
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${uniformById(design.uniform).label}公仔：${poseLabel(p)}`}
    >
      <ellipse cx={180} cy={466} rx={geom.hip + 43} ry={10} fill="#51443d" opacity={0.12} />

      <g transform={torsoTransform}>
        <g transform={headTransform}>
          <g data-layer="hair-back"><BackHair hair={colors.hair} hairColor={colors.hairColor} /></g>
        </g>
      </g>

      {basic ? <>
        <Leg hip={leftHip} thigh={j.leftHip} knee={j.leftKnee} width={geom.legWidth} skin={colors.skin} side="left" />
        <Leg hip={rightHip} thigh={j.rightHip} knee={j.rightKnee} width={geom.legWidth} skin={colors.skin} side="right" />
        <Shorts hip={geom.hip} />
      </> : <>
        <UniformLeg hip={leftHip} thigh={j.leftHip} knee={j.leftKnee} width={geom.legWidth} skin={colors.skin} side="left" kit={kit} />
        <UniformLeg hip={rightHip} thigh={j.rightHip} knee={j.rightKnee} width={geom.legWidth} skin={colors.skin} side="right" kit={kit} />
        <UniformBottom hip={geom.hip} kit={kit} />
      </>}

      <g transform={torsoTransform}>
        <Neck skin={colors.skin} />
        {basic ? <Torso geom={geom} /> : <UniformTorso geom={geom} kit={kit} />}
        <g data-layer="head" transform={headTransform}>
          <Head {...colors} uniform={design.uniform} uniformCut={design.uniformCut} uniformHat={showHat ? design.uniformHat : 'off'} />
        </g>
        {basic ? <>
          <Arm shoulder={leftShoulder} upper={j.leftShoulder} elbow={j.leftElbow} width={geom.armWidth} skin={colors.skin} side="left" />
          <Arm shoulder={rightShoulder} upper={j.rightShoulder} elbow={j.rightElbow} width={geom.armWidth} skin={colors.skin} side="right" />
        </> : <>
          <UniformArm shoulder={leftShoulder} upper={j.leftShoulder} elbow={j.leftElbow} width={geom.armWidth} skin={colors.skin} side="left" kit={kit} />
          <UniformArm shoulder={rightShoulder} upper={j.rightShoulder} elbow={j.rightElbow} width={geom.armWidth} skin={colors.skin} side="right" kit={kit} />
        </>}
      </g>
    </svg>
  )
}
