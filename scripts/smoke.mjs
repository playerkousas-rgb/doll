/** 開發用：平台功能冒煙測試（新增/復原/拖曳/刪除/背景/持久化/分享） */
import { readFileSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import { chromium as pw } from 'playwright-core'

const font = readFileSync('node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')
const fontCss = `@font-face{font-family:'NotoTC';src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype');}`

const exe = await chromium.executablePath()
const browser = await pw.launch({
  executablePath: exe,
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1560, height: 960 } })
const url = 'http://localhost:5173/'

const results = []
const check = (name, ok, extra = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` (${extra})` : ''}`)
}
const countOf = async () =>
  page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1') ?? '{"elements":[]}').elements.length)

await page.goto(url, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: fontCss })
// 從乾淨狀態開始
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.addStyleTag({ content: fontCss })
await page.waitForTimeout(600)

// 0. 起始狀態：1 隻、有自動存檔
check('起始 1 隻公仔', (await countOf()) === 1, `count=${await countOf()}`)

// 1. 點「新公仔」新增 → 2 隻
await page.getByRole('button', { name: '新公仔' }).click()
await page.waitForTimeout(300)
check('新增公仔 → 2 隻', (await countOf()) === 2, `count=${await countOf()}`)

// 2. Ctrl+Z 復原 → 1 隻
await page.keyboard.press('Control+z')
await page.waitForTimeout(250)
check('Ctrl+Z 復原 → 1 隻', (await countOf()) === 1, `count=${await countOf()}`)

// 3. Ctrl+Shift+Z 重做 → 2 隻
await page.keyboard.press('Control+Shift+z')
await page.waitForTimeout(250)
check('Ctrl+Shift+Z 重做 → 2 隻', (await countOf()) === 2, `count=${await countOf()}`)

// 4. 拖曳公仔 → 座標改變（兩隻可能重疊，比對全部 x）
const before = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements.map((e) => e.x))
const board = page.locator('.board-card').first()
const box = await board.boundingBox()
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2 + 60, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(300)
}
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements.map((e) => e.x))
check('拖曳公仔改座標', JSON.stringify(before) !== JSON.stringify(after), `${before} → ${after}`)

// 5. 拖曳後 Ctrl+Z 應回到原座標
await page.keyboard.press('Control+z')
await page.waitForTimeout(250)
const undone = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements.map((e) => e.x))
check('拖曳可復原', JSON.stringify(undone) === JSON.stringify(before), `${after} → ${undone}`)

// 6. 背景面板換底色
await page.getByRole('button', { name: '背景' }).click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: '天藍' }).click()
await page.waitForTimeout(250)
const bg = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).bg)
check('切換畫布底色', bg === 'sky', `bg=${bg}`)

// 6.5 面板收合與恢復（參考專案的 ⊟/⊞ 設計）
await page.getByRole('button', { name: '收合右側面板' }).click()
await page.waitForTimeout(200)
check('收合右面板', await page.locator('.restore-right').isVisible())
await page.locator('.restore-right').click()
await page.waitForTimeout(200)
check('恢復右面板', await page.locator('.inspector').isVisible())

await page.getByRole('button', { name: '圖層' }).click()
await page.waitForTimeout(150)
await page.getByRole('button', { name: '圖層' }).click()
await page.waitForTimeout(200)
check('再點同個圖示收合左面板', await page.locator('.restore-left').isVisible())
await page.locator('.restore-left').click()
await page.waitForTimeout(200)
check('恢復左面板', await page.locator('.panel-left').isVisible())

// 7. 圖層面板刪除 → 1 隻（上面重做後有 2 隻）
// 先等 restore 點擊真的生效；面板若仍不見才點圖示（避免 race 把面板又收合）
await page
  .locator('.layer-list')
  .waitFor({ state: 'visible', timeout: 3000 })
  .catch(async () => {
    await page.getByRole('button', { name: '圖層' }).click()
    await page.locator('.layer-list').waitFor({ state: 'visible', timeout: 3000 })
  })
const delBtns = page.locator('.layer-row .icon-btn[title="刪除"]')
await delBtns.first().click({ timeout: 5000 })
await page.waitForTimeout(250)
check('圖層刪除公仔 → 1 隻', (await countOf()) === 1, `count=${await countOf()}`)

// 8. 重新整理 → 狀態保留
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const bgAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).bg)
check('重新整理後狀態保留', (await countOf()) === 1 && bgAfter === 'sky', `bg=${bgAfter}`)

// 9. 分享連結（#c=）開啟可還原
const shareLink = await page.evaluate(() => {
  const raw = localStorage.getItem('doll.canvas.v1')
  return `${location.origin}${location.pathname}#c=${btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')}`
})
await page.evaluate(() => localStorage.clear())
await page.goto(shareLink, { waitUntil: 'networkidle' })
// 同源 #hash 導覽不一定會重建 React，重載模擬分享對象首次開啟。
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const sharedBg = await page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).bg)
check('分享連結開啟還原畫布', (await countOf()) === 1 && sharedBg === 'sky', `count=${await countOf()}, bg=${sharedBg}`)

await browser.close()
console.log(results.join('\n'))
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
