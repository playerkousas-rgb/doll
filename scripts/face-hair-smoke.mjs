/** 端對端回歸：臉與髮可獨立組合、縮圖／畫布共用渲染、復原、舊檔、分享與 PNG。 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import { chromium as pw } from 'playwright-core'

const browser = await pw.launch({
  executablePath: await chromium.executablePath(),
  args: [...chromium.args, '--no-sandbox', '--disable-gpu'],
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1560, height: 960 }, acceptDownloads: true })
const errors = []
page.on('pageerror', (err) => errors.push(err.message))
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
const url = process.env.TEST_URL ?? 'http://localhost:5173/'
// 無頭 Chromium 沒有系統中文字型，截圖時注入與 shot.mjs 相同的 Noto Sans TC。
const font = readFileSync('node_modules/@expo-google-fonts/noto-sans-tc/400Regular/NotoSansTC_400Regular.ttf')
const fontCss = `@font-face{font-family:'NotoTC';src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype')} body,button,input,textarea,h1,h2,h3,p,span{font-family:'NotoTC',sans-serif!important}`
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('doll.canvas.v1')).elements[0].design)
const test = (name, ok) => { assert.ok(ok, name); console.log(`PASS  ${name}`) }
const group = (name) => page.locator('.option-sections .section').filter({ has: page.getByRole('heading', { name, exact: true }) })
const pick = async (section, label) => group(section).getByRole('button', { name: label, exact: true }).click()
const board = page.locator('.board-art > svg[id^="doll-"]').first()
const downloadPng = async () => {
  const event = page.waitForEvent('download', { timeout: 12000 })
  await page.getByRole('button', { name: '匯出 PNG' }).click()
  const file = await event
  return readFileSync(await file.path())
}

try {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  test('預設開啟臉與髮工作台', await page.getByRole('tab', { name: '臉與髮' }).getAttribute('aria-selected') === 'true'
    && await page.getByRole('tab', { name: '臉部' }).getAttribute('aria-selected') === 'true'
    && await page.locator('.portrait-card svg').count() === 1)
  const initial = await state()
  test('預設造型有獨立瀏海、眉型、嘴型和臉頰', ['bangs', 'brows', 'mouth', 'cheeks'].every((key) => !!initial[key]))
  // 眉、眼、嘴、頰各自寫入單獨欄位；不能像舊版一樣換眼睛時連嘴也被改掉。
  await pick('眼睛', '眨眨眼')
  test('換眼睛不會改變眉毛與嘴巴', (await state()).eyes === 'wink'
    && (await state()).brows === initial.brows && (await state()).mouth === initial.mouth)
  await pick('眉型', '精神眉')
  await pick('嘴型', '露齒笑')
  await pick('臉頰', '小雀斑')
  const expression = await state()
  test('眉眼口頰能獨立組成一張臉', expression.eyes === 'wink' && expression.brows === 'determined'
    && expression.mouth === 'grin' && expression.cheeks === 'freckles')
  test('畫布與頭部特寫使用相同的五官圖層', await board.locator('[data-part="eyes"]').count() === 1
    && await board.locator('[data-part="brows"]').count() === 1
    && await board.locator('[data-part="mouth"]').count() === 1
    && await board.locator('[data-part="cheeks"] circle').count() === 6
    && await page.locator('.portrait-card [data-part="mouth"]').count() === 1)
  await pick('臉型', '心形臉')
  const heartPath = await board.locator('[data-part="face"] > path').first().getAttribute('d')
  test('臉型縮圖與畫布使用共用形狀', (await state()).face === 'heart'
    && heartPath === await group('臉型').getByRole('button', { name: '心形臉' }).locator('[data-part="face"] > path').first().getAttribute('d'))

  await page.getByRole('tab', { name: '頭髮' }).click()
  await pick('髮型', '蓬鬆捲髮')
  test('捲髮的後髮獨立於臉部', (await state()).hair === 'curly'
    && await board.locator('[data-layer="hair-back"] circle').count() >= 2
    && (await state()).face === 'heart')
  await pick('瀏海', '露額頭')
  await pick('髮型', '長直髮')
  test('換後髮仍保留自選瀏海', (await state()).hair === 'long' && (await state()).bangs === 'open'
    && await board.locator('[data-layer="hair-front"] path').count() > 0)
  await pick('髮型', '光頭')
  test('光頭隱藏前後髮但不破壞五官或瀏海設定', (await state()).hair === 'bald'
    && (await state()).bangs === 'open' && (await state()).eyes === 'wink'
    && await board.locator('[data-layer="hair-front"] path').count() === 0
    && await board.locator('[data-layer="hair-back"] path').count() === 0
    && await group('瀏海').getByRole('button', { name: '露額頭' }).isDisabled())
  await page.keyboard.press('Control+z')
  test('髮型更改可復原', (await state()).hair === 'long' && (await state()).bangs === 'open')
  await page.keyboard.press('Control+Shift+z')
  test('髮型更改可重做', (await state()).hair === 'bald')
  await pick('髮型', '丸子頭')
  await group('髮色').getByRole('button', { name: '銀灰' }).click()
  const customized = await state()
  test('重新選髮與髮色仍保留臉部組合', customized.hair === 'bun' && customized.bangs === 'open'
    && customized.hairColor === 'silver' && customized.mouth === 'grin' && customized.cheeks === 'freckles')
  test('髮型縮圖、畫布和特寫都由同一渲染器產生', await group('髮型').getByRole('button', { name: '丸子頭' }).locator('[data-layer="hair-front"] path').count() > 0
    && await board.locator('[data-layer="hair-front"] path').count() > 0
    && await page.locator('.portrait-card [data-layer="hair-front"] path').count() > 0)
  await page.addStyleTag({ content: fontCss })
  await page.screenshot({ path: 'shot-face-combo.png' })

  await page.getByRole('tab', { name: '提示詞' }).click()
  const prompt = await page.locator('.prompt-box').inputValue()
  test('提示詞記錄獨立五官與瀏海', ['心形臉', '眨眨眼', '精神眉', '露齒笑', '小雀斑', '露額頭', '丸子頭'].every((word) => prompt.includes(word)))

  const silverPng = await downloadPng()
  test('匯出包含新臉髮的非空 PNG', silverPng.subarray(1, 4).toString() === 'PNG'
    && silverPng.readUInt32BE(16) > 300 && silverPng.length > 5000)
  await page.getByRole('tab', { name: '臉與髮' }).click()
  await page.getByRole('tab', { name: '頭髮' }).click()
  await group('髮色').getByRole('button', { name: '粉紅' }).click()
  const pinkPng = await downloadPng()
  test('改髮色後 PNG 真正改變', pinkPng.subarray(1, 4).toString() === 'PNG' && !silverPng.equals(pinkPng))

  await page.reload({ waitUntil: 'networkidle' })
  test('重新整理後獨立欄位仍保存', (await state()).hairColor === 'pink'
    && (await state()).bangs === 'open' && (await state()).brows === 'determined')

  const share = await page.evaluate(() => {
    const data = new TextEncoder().encode(localStorage.getItem('doll.canvas.v1'))
    let binary = ''
    for (const byte of data) binary += String.fromCharCode(byte)
    return `${location.origin}${location.pathname}#c=${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
  })
  await page.evaluate(() => localStorage.clear())
  await page.goto(share, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' }) // 同源換 hash 不一定重建 React
  test('分享連結完整還原臉髮', JSON.stringify(await state()) === JSON.stringify({ ...customized, hairColor: 'pink' }))

  // 舊版表情同時決定眼睛和嘴巴；新欄位缺漏時保留舊表情，不把 smile 變成閉眼無嘴。
  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem('doll.canvas.v1'))
    doc.elements[0].design = { ...doc.elements[0].design, eyes: 'smile' }
    delete doc.elements[0].design.bangs
    delete doc.elements[0].design.brows
    delete doc.elements[0].design.mouth
    delete doc.elements[0].design.cheeks
    localStorage.setItem('doll.canvas.v1', JSON.stringify(doc))
  })
  await page.reload({ waitUntil: 'networkidle' })
  test('舊版笑眼自動遷移笑嘴與新欄位', (await state()).eyes === 'smile'
    && (await state()).mouth === 'grin' && (await state()).brows === 'soft'
    && (await state()).bangs === 'auto' && (await state()).cheeks === 'blush')

  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem('doll.canvas.v1'))
    doc.elements[0].design = { ...doc.elements[0].design, hair: '???', bangs: '???', face: '???', eyes: '???', brows: '???', mouth: '???', cheeks: '???', hairColor: '???' }
    localStorage.setItem('doll.canvas.v1', JSON.stringify(doc))
  })
  await page.reload({ waitUntil: 'networkidle' })
  test('無效舊 ID 安全回退，不使 SVG 出錯', (await state()).hair === 'spiky' && (await state()).bangs === 'auto'
    && (await state()).face === 'round' && (await state()).eyes === 'cute' && (await state()).mouth === 'soft'
    && await board.locator('[data-part="face"] path').count() > 0)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('tab', { name: '頭髮' }).click()
  const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
  test('手機版仍可使用臉髮分類與特寫', await group('髮型').getByRole('button', { name: '蓬鬆捲髮' }).count() === 1
    && await page.locator('.portrait-card svg').count() === 1 && layout.scroll <= layout.width + 2)
  await page.locator('.portrait-card').scrollIntoViewIfNeeded()
  await page.addStyleTag({ content: fontCss })
  await page.screenshot({ path: 'shot-face-mobile.png' })
  test('沒有瀏覽器執行錯誤', errors.length === 0)
} finally {
  await browser.close()
}
