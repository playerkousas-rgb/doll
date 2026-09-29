/** 端對端回歸：姿勢範本、可拖曳骨架、復原、提示詞、存檔／分享／匯出及舊文件。 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import { chromium as pw } from 'playwright-core'

const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args, '--no-sandbox', '--disable-gpu'], headless: true })
const page = await browser.newPage({ viewport: { width: 1560, height: 960 }, acceptDownloads: true })
page.on('pageerror', (err) => console.log('PAGE ERROR', err.message))
page.on('console', (msg) => { if (msg.type() === 'error') console.error('CONSOLE', msg.text()) })
const url = process.env.TEST_URL ?? 'http://localhost:5173/'
const font = readFileSync('node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')
const fontCss = `@font-face{font-family:'NotoTC';src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype');} body,button,input,textarea{font-family:'NotoTC',sans-serif!important}`
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements[0])
const test = (name, check) => { assert.ok(check, name); console.log(`PASS  ${name}`) }

try {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.addStyleTag({ content: fontCss })
  await page.waitForTimeout(100)
  test('起始文件有預設站姿', (await state()).pose.preset === 'stand')

  await page.getByRole('tab', { name: '姿勢' }).click()
  test('顯示十個骨架控制點', await page.locator('.rig-grip').count() === 10)
  await page.screenshot({ path: 'shot-pose.png' })

  await page.locator('.pose-preset').filter({ hasText: '開心招手' }).click()
  test('姿勢範本更新 SVG 與資料', (await state()).pose.preset === 'wave' && (await state()).pose.joints.rightShoulder === -142)
  await page.getByRole('tab', { name: '提示詞' }).click()
  test('提示詞包含目前動作', (await page.locator('.prompt-box').inputValue()).includes('揮手'))
  await page.getByRole('tab', { name: '姿勢' }).click()

  await page.getByRole('button', { name: '左右鏡像' }).click()
  const mirrored = await state()
  test('鏡像交換兩邊的骨架角度', mirrored.pose.preset === 'custom' && mirrored.pose.joints.leftShoulder === 142 && mirrored.pose.joints.rightShoulder === -17)
  await page.keyboard.press('Control+z')
  test('鏡像可以復原', (await state()).pose.preset === 'wave')
  await page.keyboard.press('Control+Shift+z')
  test('鏡像可以重做', (await state()).pose.joints.leftShoulder === 142)

  const grip = page.locator('.rig-grip[data-joint="rightElbow"] .rig-dot')
  const rect = await grip.boundingBox()
  assert.ok(rect, '找不到可拖曳的右手腕')
  const beforeDrag = await state()
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await page.mouse.down()
  await page.mouse.move(rect.x + rect.width / 2 + 45, rect.y + rect.height / 2 - 26, { steps: 12 })
  await page.mouse.up()
  const afterDrag = await state()
  test('拖曳手腕只修改關節而不拖走公仔板', afterDrag.pose.joints.rightElbow !== beforeDrag.pose.joints.rightElbow && afterDrag.x === beforeDrag.x && afterDrag.y === beforeDrag.y)
  await page.keyboard.press('Control+z')
  test('整次拖曳只佔一次復原', (await state()).pose.joints.rightElbow === beforeDrag.pose.joints.rightElbow)

  await page.getByRole('slider', { name: '頭部傾斜角度' }).focus()
  await page.keyboard.press('ArrowRight')
  test('滑桿鍵盤微調進入自訂姿勢', (await state()).pose.preset === 'custom' && (await state()).pose.joints.head !== mirrored.pose.joints.head)

  await page.locator('.pose-preset').filter({ hasText: '跨步出發' }).click()
  const headAlignment = await page.evaluate(() => {
    const layer = document.querySelector('.board-art > svg[id] [data-layer="head"]')
    const dot = document.querySelector('.rig-overlay [data-joint="head"] .rig-dot')
    const actual = new DOMPoint(180, 92).matrixTransform(layer.getScreenCTM())
    const marker = dot.getBoundingClientRect()
    return Math.hypot(actual.x - marker.x - marker.width / 2, actual.y - marker.y - marker.height / 2)
  })
  test('身體傾斜時骨架控制點仍貼合頭部', headAlignment < 2)

  const beforeSlider = (await state()).pose.joints.leftHip
  const hipSlider = await page.getByRole('slider', { name: '左髖角度' }).boundingBox()
  assert.ok(hipSlider)
  await page.mouse.move(hipSlider.x + hipSlider.width * 0.55, hipSlider.y + hipSlider.height / 2)
  await page.mouse.down()
  await page.mouse.move(hipSlider.x + hipSlider.width * 0.8, hipSlider.y + hipSlider.height / 2, { steps: 12 })
  await page.mouse.up()
  test('拖動滑桿可改變髖關節', (await state()).pose.joints.leftHip !== beforeSlider)
  await page.keyboard.press('Control+z')
  test('滑桿整次拖動只佔一次復原', (await state()).pose.joints.leftHip === beforeSlider)

  await page.getByRole('button', { name: '重回站姿' }).click()
  test('重設姿勢不影響人物造型', (await state()).pose.preset === 'stand' && (await state()).design.hair === beforeDrag.design.hair)

  await page.locator('.pose-preset').filter({ hasText: '童軍敬禮' }).click()
  await page.reload({ waitUntil: 'networkidle' })
  test('姿勢重新整理後仍保留', (await state()).pose.preset === 'salute')

  const link = await page.evaluate(() => {
    const bytes = new TextEncoder().encode(localStorage.getItem('doll.canvas.v1'))
    let str = ''
    for (const b of bytes) str += String.fromCharCode(b)
    return `${location.origin}${location.pathname}#c=${btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
  })
  await page.goto(link, { waitUntil: 'networkidle' })
  // 同源只改 #hash 可能不觸發整頁導覽；重載模擬收件者首次開啟分享 URL。
  await page.reload({ waitUntil: 'networkidle' })
  test('分享連結完整還原姿勢', (await state()).pose.preset === 'salute')

  const downloadEvent = page.waitForEvent('download', { timeout: 12000 })
  await page.getByRole('button', { name: '匯出 PNG' }).click()
  const download = await downloadEvent
  const file = readFileSync(await download.path())
  test('畫布 PNG 可匯出', file.subarray(1, 4).toString() === 'PNG' && file.readUInt32BE(16) > 300)

  const old = await state()
  await page.evaluate((el) => {
    delete el.pose
    localStorage.setItem('doll.canvas.v1', JSON.stringify({ v: 1, bg: 'mint', elements: [el] }))
  }, old)
  await page.reload({ waitUntil: 'networkidle' })
  test('舊存檔沒有姿勢欄位可正常遷移', (await state()).pose.preset === 'stand')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.addStyleTag({ content: fontCss })
  await page.getByRole('tab', { name: '姿勢' }).click()
  await page.waitForTimeout(350)
  const stage = await page.locator('.stage').boundingBox()
  const board = await page.locator('.board-card').boundingBox()
  test('手機畫面仍可操作骨架與滑桿', !!stage && stage.width >= 380 && await page.locator('.rig-grip').count() === 10)
  test('縮小視窗後公仔仍在畫布中間', !!stage && !!board && board.x >= stage.x && board.x + board.width <= stage.x + stage.width)
  await page.locator('.stage').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'shot-pose-mobile.png' })

  await page.locator('.parts-panel .part-tile').filter({ hasText: '新公仔' }).click()
  await page.locator('.pose-preset').filter({ hasText: '開心招手' }).click()
  const dolls = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements)
  test('多隻公仔各自保存不同姿勢', dolls.length === 2 && dolls[0].pose.preset === 'stand' && dolls[1].pose.preset === 'wave')
} finally {
  await browser.close()
}
